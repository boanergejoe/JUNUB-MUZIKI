import { Playlist } from "../models/playlist.model.js";
import { Song } from "../models/song.model.js";

// missing feature compared to real Spotify: user playlists.
// implementing a basic CRUD model here; in a real app you might call
// Spotify Web API endpoints such as
// https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-list-of-current-users-playlists
// or create-playlist etc.

// our own local playlist implementation starts below

export const createPlaylist = async (req, res, next) => {
    try {
        const { title } = req.body;
        const userId = req.auth.userId; // clerk id from auth middleware

        const playlist = new Playlist({ title, userId, songs: [] });
        await playlist.save();

        res.status(201).json(playlist);
    } catch (error) {
        next(error);
    }
};

export const getMyPlaylists = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const playlists = await Playlist.find({ userId }).populate("songs");
        res.status(200).json(playlists);
    } catch (error) {
        next(error);
    }
};

export const getPlaylistById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id).populate("songs");
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        // only owner may fetch or we may allow public view later
        if (playlist.userId !== req.auth.userId)
            return res.status(403).json({ message: "Forbidden" });
        res.status(200).json(playlist);
    } catch (error) {
        next(error);
    }
};

export const deletePlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.userId !== req.auth.userId)
            return res.status(403).json({ message: "Forbidden" });
        await Playlist.findByIdAndDelete(id);
        res.status(200).json({ message: "Playlist deleted" });
    } catch (error) {
        next(error);
    }
};

export const addSongToPlaylist = async (req, res, next) => {
    try {
        const { playlistId, songId } = req.params;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.userId !== req.auth.userId)
            return res.status(403).json({ message: "Forbidden" });

        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        }
        res.status(200).json(playlist);
    } catch (error) {
        next(error);
    }
};

export const removeSongFromPlaylist = async (req, res, next) => {
    try {
        const { playlistId, songId } = req.params;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });
        if (playlist.userId !== req.auth.userId)
            return res.status(403).json({ message: "Forbidden" });

        playlist.songs = playlist.songs.filter((s) => s.toString() !== songId);
        await playlist.save();
        res.status(200).json(playlist);
    } catch (error) {
        next(error);
    }
};
