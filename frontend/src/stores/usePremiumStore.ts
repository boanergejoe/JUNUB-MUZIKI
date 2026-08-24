import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface PremiumStore {
    isPremium: boolean;
    isLoading: boolean;
    error: string | null;
    checkPremiumStatus: () => Promise<void>;
    reset: () => void;
}

export const usePremiumStore = create<PremiumStore>((set) => ({
    isPremium: false,
    isLoading: false,
    error: null,

    checkPremiumStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/users/me");
            set({ isPremium: response.data.premium });
        } catch (error: any) {
            set({ isPremium: false, error: error.response?.data?.message || "Error" });
        } finally {
            set({ isLoading: false });
        }
    },

    reset: () => {
        set({ isPremium: false, isLoading: false, error: null });
    }
}));
