import { axiosInstance } from "@/lib/axios";
import { Song } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface UserStore {
    likedSongs: Song[];
    isLoading: boolean;
    error: string | null;

    fetchLikedSongs: () => Promise<void>;
    likeSong: (songId: string) => Promise<void>;
    unlikeSong: (songId: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
    likedSongs: [],
    isLoading: false,
    error: null,

    // fetchLikedSongs corresponds to Spotify "Get User's Saved Tracks" endpoint.
    // https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-saved-tracks
    fetchLikedSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/users/songs/liked");
            set({ likedSongs: res.data });
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    likeSong: async (songId: string) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post(`/users/songs/${songId}/like`);
            // Fetch the song details to add to likedSongs
            const songResponse = await axiosInstance.get(`/songs/${songId}`);
            set((state) => ({ likedSongs: [...state.likedSongs, songResponse.data] }));
            toast.success("Song added to Liked Songs");
        } catch (err: any) {
            set({ error: err.message });
            toast.error("Failed to like song");
        } finally {
            set({ isLoading: false });
        }
    },

    unlikeSong: async (songId) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/users/songs/${songId}/like`);
            set((state) => ({
                likedSongs: state.likedSongs.filter((s) => s._id !== songId),
            }));
            toast.success("Song removed from Liked Songs");
        } catch (err: any) {
            set({ error: err.message });
            toast.error("Failed to unlike song");
        } finally {
            set({ isLoading: false });
        }
    },
}));