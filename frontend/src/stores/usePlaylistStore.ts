import { axiosInstance } from "@/lib/axios";
import { Playlist } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface PlaylistStore {
    // spotify has a full playlist management feature; we're implementing a simplified version
    // collaborative playlists, following/friends, and remote control are omitted
    // (would normally map to Spotify Web API calls such as create Collaboration).
    playlists: Playlist[]; // all playlists belonging to current user
    currentPlaylist: Playlist | null;
    isLoading: boolean;
    error: string | null;

    fetchPlaylists: () => Promise<void>;
    fetchPlaylistById: (id: string) => Promise<void>;
    createPlaylist: (title: string) => Promise<void>;
    deletePlaylist: (id: string) => Promise<void>;
    addSong: (playlistId: string, songId: string) => Promise<void>;
    removeSong: (playlistId: string, songId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set) => ({
    playlists: [],
    currentPlaylist: null,
    isLoading: false,
    error: null,

    fetchPlaylists: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get("/playlists");
            set({ playlists: res.data });
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchPlaylistById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.get(`/playlists/${id}`);
            set({ currentPlaylist: res.data });
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ isLoading: false });
        }
    },

    createPlaylist: async (title) => {
        set({ isLoading: true, error: null });
        try {
            // Spotify Web API has a similar create playlist endpoint
            // https://developer.spotify.com/documentation/web-api/reference/#/operations/create-playlist
            const res = await axiosInstance.post("/playlists", { title });
            set((state) => ({ playlists: [...state.playlists, res.data] }));
            toast.success("Playlist created");
        } catch (err: any) {
            set({ error: err.message });
            toast.error("Failed to create playlist");
        } finally {
            set({ isLoading: false });
        }
    },

    deletePlaylist: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/playlists/${id}`);
            set((state) => ({ playlists: state.playlists.filter((p) => p._id !== id) }));
            toast.success("Playlist deleted");
        } catch (err: any) {
            set({ error: err.message });
            toast.error("Failed to delete playlist");
        } finally {
            set({ isLoading: false });
        }
    },

    addSong: async (playlistId, songId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.post(`/playlists/${playlistId}/songs/${songId}`);
            set((state) => ({
                currentPlaylist: res.data,
                playlists: state.playlists.map((p) => (p._id === playlistId ? res.data : p)),
            }));
            toast.success("Song added to playlist");
        } catch (err: any) {
            set({ error: err.message });
            toast.error("Failed to add song to playlist");
        } finally {
            set({ isLoading: false });
        }
    },

    removeSong: async (playlistId, songId) => {
        set({ isLoading: true, error: null });
        try {
            const res = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
            set((state) => ({
                currentPlaylist: res.data,
                playlists: state.playlists.map((p) => (p._id === playlistId ? res.data : p)),
            }));
            toast.success("Song removed from playlist");
        } catch (err: any) {
            set({ error: err.message });
            toast.error("Failed to remove song from playlist");
        } finally {
            set({ isLoading: false });
        }
    },
}));
