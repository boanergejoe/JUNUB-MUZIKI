import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api",
	// send cookies (Clerk session) so that protected/admin endpoints authenticate
	withCredentials: true,
});
