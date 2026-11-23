import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { create } from "zustand";

export type PaymentStatus = "pending" | "completed" | "failed" | "expired";

export interface PremiumPayment {
  success: boolean;
  paymentUrl: string;
  orderTrackingId: string;
  amount: number;
  plan: string;
}

interface PremiumStore {
    isPremium: boolean;
    isLoading: boolean;
    error: string | null;
    checkPremiumStatus: () => Promise<void>;
    createPayment: (plan: string) => Promise<PremiumPayment>;
    checkPayment: (orderTrackingId: string) => Promise<PaymentStatus>;
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
            set({ isPremium: Boolean(response.data.premium) });
        } catch (error: unknown) {
            set({ isPremium: false, error: getErrorMessage(error, "Unable to check Premium status") });
        } finally {
            set({ isLoading: false });
        }
    },

    createPayment: async (plan) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post<PremiumPayment>("/users/create-pesapal-payment", { plan });
            return response.data;
        } catch (error: unknown) {
            const message = getErrorMessage(error, "Unable to start payment");
            set({ error: message });
            throw new Error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    checkPayment: async (orderTrackingId) => {
        const response = await axiosInstance.get<{ paymentStatus: PaymentStatus }>(
            `/users/check-pesapal-payment/${encodeURIComponent(orderTrackingId)}`
        );
        const status = response.data.paymentStatus;
        if (status === "completed") set({ isPremium: true });
        return status;
    },

    reset: () => {
        set({ isPremium: false, isLoading: false, error: null });
    }
}));
