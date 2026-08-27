import mongoose from "mongoose";

export const connectDB = async () => {
	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is required to start the backend");
	}

	const conn = await mongoose.connect(process.env.MONGODB_URI, {
		serverSelectionTimeoutMS: 10000,
		connectTimeoutMS: 10000,
		maxPoolSize: 10,
	});
	console.log(`Connected to MongoDB ${conn.connection.host}`);
};
