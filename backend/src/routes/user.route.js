import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages, likeSong, unlikeSong, getLikedSongs, getMe, createPesaPalPayment, checkPesaPalPayment, pesapalCallback, getPesaPalEmbedCode } from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.get("/me", protectRoute, getMe);
// song liking endpoints
router.post("/songs/:songId/like", protectRoute, likeSong);
router.delete("/songs/:songId/like", protectRoute, unlikeSong);
router.get("/songs/liked", protectRoute, getLikedSongs);
// PesaPal payment endpoints
router.post("/create-pesapal-payment", protectRoute, createPesaPalPayment);
router.get("/check-pesapal-payment/:orderTrackingId", protectRoute, checkPesaPalPayment);
router.post("/pesapal-callback", pesapalCallback);
router.get("/pesapal-embed-code", getPesaPalEmbedCode);

export default router;
