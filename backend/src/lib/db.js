import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		if (!process.env.MONGODB_URI) {
			throw new Error("MONGODB_URI is required to start the backend");
		}
		const conn = await mongoose.connect(process.env.MONGODB_URI);
		console.log(`Connected to MongoDB ${conn.connection.host}`);
	} catch (error) {
		console.error("Failed to connect to MongoDB:", error.message);
		process.exit(1); // 1 is failure, 0 is success
	}
};
