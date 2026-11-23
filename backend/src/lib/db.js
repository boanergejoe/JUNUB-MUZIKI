import mongoose from "mongoose";

let connectionPromise;

export const connectDB = async () => {
	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI is required to start the backend");
	}

	if (mongoose.connection.readyState === 1) return mongoose.connection;
	if (connectionPromise) return connectionPromise;

	connectionPromise = mongoose
		.connect(process.env.MONGODB_URI, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000,
			maxPoolSize: 10,
		})
		.then((conn) => {
			console.log(`Connected to MongoDB ${conn.connection.host}`);
			return conn.connection;
		})
		.catch((error) => {
			connectionPromise = undefined;
			throw error;
		});

	return connectionPromise;
};
