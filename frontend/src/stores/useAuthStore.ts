import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { create } from "zustand";

interface AuthStore {
	isAdmin: boolean;
	isSuperAdmin: boolean;
	isLoading: boolean;
	error: string | null;

	checkAdminStatus: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isSuperAdmin: false,
	isLoading: false,
	error: null,

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/check");
			set({ isAdmin: response.data.admin, isSuperAdmin: response.data.superAdmin });
		} catch (error: unknown) {
			set({ isAdmin: false, isSuperAdmin: false, error: getErrorMessage(error, "Unable to verify admin access") });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isSuperAdmin: false, isLoading: false, error: null });
	},
}));
