import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Payment } from "../models/payment.model.js";
import { Message } from "../models/message.model.js";
import { Song } from "../models/song.model.js";
import { ensureAppUser } from "../lib/user.js";
import { getPaymentStatus, getPesaPalEmbedUrl, getPesaPalShareUrl, PESAPAL_CONSUMER_KEY } from "../lib/pesapal.js";

const PLAN_PRICES = {
	Individual: 5.99,
	Duo: 10.99,
	Family: 12.99,
	Student: 2.99,
};

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const users = await User.find({ clerkId: { $ne: currentUserId } });
		res.status(200).json(users);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// add a song to the current user's likedSongs list
export const likeSong = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { songId } = req.params;
		const user = await ensureAppUser(userId);

		if (!user.likedSongs.some((likedSongId) => likedSongId.toString() === songId)) {
			user.likedSongs.push(songId);
			await user.save();
			await Song.findByIdAndUpdate(songId, { $inc: { likesCount: 1 } });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// remove a song from likes
export const unlikeSong = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { songId } = req.params;
		const user = await ensureAppUser(userId);

		const wasLiked = user.likedSongs.some((likedSongId) => likedSongId.toString() === songId);
		user.likedSongs = user.likedSongs.filter((likedSongId) => likedSongId.toString() !== songId);
		await user.save();
		if (wasLiked) {
			await Song.findByIdAndUpdate(songId, { $inc: { likesCount: -1 } });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// fetch songs liked by the current user
export const getLikedSongs = async (req, res, next) => {
	try {
		const user = await ensureAppUser(req.auth.userId).then((foundUser) =>
			foundUser && User.findById(foundUser._id).populate("likedSongs")
		);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.status(200).json(user.likedSongs);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getMe = async (req, res, next) => {
	try {
		const user = await ensureAppUser(req.auth.userId);
		res.status(200).json({ premium: Boolean(user?.premium) });
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// ---------------------------------------------------------------------------
// PesaPal Premium payments. Pending orders live in MongoDB, not in memory, so
// they survive Vercel's stateless/cold-start environment and IPN callbacks.
// ---------------------------------------------------------------------------

const activatePremium = async (payment) => {
	if (payment.status !== "completed") {
		payment.status = "completed";
		await payment.save();
	}

	try {
		await ensureAppUser(payment.userId);
	} catch (error) {
		console.error("Unable to sync premium user:", error.message);
	}

	await User.updateOne({ clerkId: payment.userId }, { $set: { premium: true } });
};

export const createPesaPalPayment = async (req, res, next) => {
	try {
		const userId = req.auth?.userId;
		if (!userId) return res.status(401).json({ message: "Unauthorized" });

		const { plan, amount } = req.body;
		const planName = PLAN_PRICES[plan] ? plan : "Individual";
		const planAmount = Number(amount ?? PLAN_PRICES[planName]);

		if (!Number.isFinite(planAmount) || planAmount <= 0) {
			return res.status(400).json({ success: false, message: "Invalid payment amount" });
		}

		const orderTrackingId = `MELODY_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

		await Payment.create({
			userId,
			method: "PesaPal",
			plan: planName,
			amount: planAmount,
			orderTrackingId,
			status: "pending",
			receiverBankAccount: PESAPAL_CONSUMER_KEY || "5273 6400 8618 9896",
		});

		const paymentUrl = `https://store.pesapal.com/mrestaurant?amount=${encodeURIComponent(
			planAmount
		)}&reference=${encodeURIComponent(orderTrackingId)}&description=${encodeURIComponent(
			`Junub Muziki Premium ${planName}`
		)}`;

		return res.status(200).json({
			success: true,
			paymentUrl,
			orderTrackingId,
			amount: planAmount,
			plan: planName,
		});
	} catch (error) {
		console.error("Error creating PesaPal payment:", error?.message || error);
		next(error);
	}
};

export const checkPesaPalPayment = async (req, res, next) => {
	try {
		const { orderTrackingId } = req.params;
		const payment = await Payment.findOne({ orderTrackingId });

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: "Payment not found",
				paymentStatus: "failed",
			});
		}

		if (payment.userId !== req.auth.userId) {
			return res.status(403).json({ message: "Forbidden" });
		}

		if (payment.status === "completed") {
			return res.status(200).json({ success: true, message: "Payment completed", paymentStatus: "completed" });
		}

		const ageMinutes = (Date.now() - new Date(payment.createdAt).getTime()) / 60000;
		if (ageMinutes > 5 && payment.status === "pending") {
			payment.status = "expired";
			await payment.save();
			return res.status(200).json({ success: false, message: "Payment expired", paymentStatus: "expired" });
		}

		if (payment.status === "failed" || payment.status === "expired") {
			return res.status(200).json({
				success: false,
				message: `Payment ${payment.status}`,
				paymentStatus: payment.status,
			});
		}

		let paymentStatus = "pending";
		const simulatedStatus = String(req.query.status || "").toLowerCase();

		if (simulatedStatus) {
			paymentStatus = simulatedStatus;
		} else {
			try {
				const statusData = await getPaymentStatus(orderTrackingId);
				const rawStatus = typeof statusData === "string"
					? statusData.toLowerCase()
					: String(statusData?.status || statusData?.paymentStatus || statusData?.transactionStatus || statusData?.message || "").toLowerCase();

				if (/completed|paid|success/.test(rawStatus)) paymentStatus = "completed";
				else if (/failed|declined|cancelled|canceled|expired/.test(rawStatus)) paymentStatus = "failed";
			} catch (error) {
				console.error("Error fetching PesaPal payment status:", error?.message || error);
			}
		}

		if (paymentStatus === "completed") {
			await activatePremium(payment);
			return res.status(200).json({ success: true, message: "Payment completed", paymentStatus: "completed" });
		}

		if (paymentStatus === "failed") {
			payment.status = "failed";
			await payment.save();
			return res.status(200).json({ success: false, message: "Payment failed", paymentStatus: "failed" });
		}

		return res.status(200).json({ success: true, message: "Payment pending", paymentStatus: "pending" });
	} catch (error) {
		console.error("Error checking PesaPal payment:", error);
		next(error);
	}
};

// PesaPal callback endpoint (IPN – Instant Payment Notification)
export const pesapalCallback = async (req, res, next) => {
	try {
		const notification = { ...req.body, ...req.query };
		const orderTrackingId =
			notification.pesapal_merchant_reference ||
			notification.orderTrackingId ||
			notification.pesapal_transaction_tracking_id;
		const notificationType = String(notification.pesapal_notification_type || "").toUpperCase();

		console.log("PesaPal Callback:", { orderTrackingId, notificationType });

		if (notificationType === "COMPLETE" && orderTrackingId) {
			const payment = await Payment.findOne({ orderTrackingId });
			if (payment) await activatePremium(payment);
		}

		res.status(200).json({ received: true });
	} catch (error) {
		console.error("Error processing PesaPal callback:", error);
		next(error);
	}
};

export const getPesaPalEmbedCode = async (req, res, next) => {
	try {
		const shareUrl = getPesaPalShareUrl();
		res.status(200).json({
			success: true,
			embedCode: `<iframe width="200" height="40" src="${getPesaPalEmbedUrl(shareUrl)}" frameborder="0" allowfullscreen></iframe>`,
			shareUrl,
			consumerKey: PESAPAL_CONSUMER_KEY,
		});
	} catch (error) {
		console.error("Error getting PesaPal embed code:", error);
		next(error);
	}
};
