import express from "express";
import * as playlistController from "../controller/playlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// all endpoints require authentication via Clerk middleware (already setup in auth.middleware)
router.post("/", protectRoute, playlistController.createPlaylist);
router.get("/", protectRoute, playlistController.getMyPlaylists);
router.get("/:id", protectRoute, playlistController.getPlaylistById);
router.delete("/:id", protectRoute, playlistController.deletePlaylist);
router.post("/:playlistId/songs/:songId", protectRoute, playlistController.addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", protectRoute, playlistController.removeSongFromPlaylist);

export default router;
