import axios from "axios";

/**
 * The frontend and backend are deployed as two separate Vercel projects, so a
 * relative "/api" URL would hit the frontend project (404). Always resolve an
 * absolute backend URL. VITE_API_URL may be either the backend origin or the
 * full /api base – both are accepted.
 */
const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const rawApiUrl =
	trimTrailingSlashes(import.meta.env.VITE_API_URL?.trim() || "") ||
	(import.meta.env.DEV ? "http://localhost:5000" : "https://junub-muziki.vercel.app");

export const API_BASE_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

/** Backend origin used by Socket.IO (same host, without the /api prefix). */
export const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	// send cookies (Clerk session) so that protected/admin endpoints authenticate
	withCredentials: true,
});

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

/** Called by AuthProvider so every request uses a fresh Clerk session token. */
export const setAuthTokenProvider = (provider: TokenProvider | null) => {
	tokenProvider = provider;
	if (!provider) delete axiosInstance.defaults.headers.common["Authorization"];
};

axiosInstance.interceptors.request.use(async (config) => {
	if (!tokenProvider) return config;

	try {
		const token = await tokenProvider();
		if (token) config.headers.Authorization = `Bearer ${token}`;
		else delete config.headers.Authorization;
	} catch {
		delete config.headers.Authorization;
	}

	return config;
});
