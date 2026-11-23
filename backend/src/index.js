import express from "express";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import os from "os";
import { createServer } from "http";
import cron from "node-cron";
import { fileURLToPath } from "url";

import "./config/env.js";
import { corsOrigin } from "./config/cors.js";
import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import playlistRoutes from "./routes/playlist.route.js"; // added for user playlists

const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const app = express();
const PORT = Number(process.env.PORT) || 5000;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors({ origin: corsOrigin, credentials: true }));

// Health check must work even if Clerk credentials are temporarily missing.
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use(clerkMiddleware({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
}));

if (process.env.NODE_ENV === "production") {
	const frontendDirectory = path.join(__dirname, "frontend", "dist");
	app.use(express.static(frontendDirectory));
	app.get("/", (req, res, next) => {
		res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
			if (error) next(error);
		});
	});
}

app.use(express.json()); // to parse req.body
// Serverless filesystems are read-only except the OS temp directory.
const tempDir = path.join(os.tmpdir(), "junub-muziki-uploads");
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: tempDir,
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
		},
	})
);

// cron jobs
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => { });
			}
		});
	}
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/playlists", playlistRoutes); // endpoints to manage user playlists

// Unknown API routes must return JSON, not the SPA index.html.
app.use("/api", (req, res) => {
	res.status(404).json({ message: "Endpoint not found" });
});

if (process.env.NODE_ENV === "production") {
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
	});
}

// error handler
app.use((err, req, res, next) => {
	let statusCode = Number(err.status || err.statusCode) || 500;
	if (err.name === "ValidationError" || err.name === "CastError") statusCode = 400;
	if (err.code === 11000) statusCode = 409;

	const message = statusCode === 401
		? "Unauthorized - please sign in again"
		: statusCode === 403
			? "Forbidden"
			: statusCode === 400
				? err.message
				: statusCode === 409
					? "A record with this value already exists"
					: process.env.NODE_ENV === "production"
						? "Internal server error"
						: err.message;
	console.error("Request failed:", statusCode, err.message);
	res.status(statusCode).json({ message });
});

const startServer = async () => {
	try {
		await connectDB();
		httpServer.listen(PORT, () => {
			console.log("Server is running on port " + PORT);
		});
	} catch (error) {
		console.error("Failed to start backend:", error.message);
		process.exitCode = 1;
	}
};

startServer();

// Allows hosting platforms (e.g. Vercel Functions) to use the Express app
// directly, while `npm start` still runs the standalone HTTP server.
export default app;
