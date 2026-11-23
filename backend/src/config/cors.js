import "./env.js";

// Shared origin policy for Express CORS and Socket.IO. The frontend and backend
// live on different Vercel subdomains, so the production origin must be allowed
// explicitly (including Vercel preview deployments).

const configuredOrigins = (process.env.FRONTEND_URL || "")
	.split(",")
	.map((origin) => origin.trim().replace(/\/+$/, ""))
	.filter(Boolean);

const defaultOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"https://junub-muziki-drq1.vercel.app",
];

export const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

export const isAllowedOrigin = (origin) => {
	// Non-browser requests (curl, health checks, server-to-server) have no Origin.
	if (!origin) return true;
	if (allowedOrigins.includes(origin.replace(/\/+$/, ""))) return true;

	try {
		const { hostname } = new URL(origin);
		if (hostname === "localhost" || hostname === "127.0.0.1") return true;
		// Allow Vercel preview/production subdomains for this project.
		if (hostname.endsWith(".vercel.app")) return true;
	} catch {
		// Malformed Origin header – reject below.
	}

	return false;
};

// `cors` reflects the request origin when this returns true and omits the
// Access-Control-Allow-Origin header when it returns false.
export const corsOrigin = (origin, callback) => callback(null, isAllowedOrigin(origin));
