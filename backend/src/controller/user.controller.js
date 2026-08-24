// Activate premium status for user
import { User } from "../models/user.model.js";
import { Payment } from "../models/payment.model.js";

import { Message } from "../models/message.model.js";
import { Song } from "../models/song.model.js";

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
// analogous to Spotify's "Save Tracks for User"
// https://developer.spotify.com/documentation/web-api/reference/#/operations/save-tracks-user
// note: we do not yet implement sharing, offline-sync, or playback devices
export const likeSong = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { songId } = req.params;
		const user = await User.findOne({ clerkId: userId });
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!user.likedSongs.includes(songId)) {
			user.likedSongs.push(songId);
			await user.save();
			// Increment likesCount on the song
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
		const user = await User.findOne({ clerkId: userId });
		if (!user) return res.status(404).json({ message: "User not found" });

		user.likedSongs = user.likedSongs.filter((s) => s.toString() !== songId);
		await user.save();
		// Decrement likesCount on the song
		await Song.findByIdAndUpdate(songId, { $inc: { likesCount: -1 } });
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// fetch songs liked by the current user
export const getLikedSongs = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId }).populate("likedSongs");
		if (!user) return res.status(404).json({ message: "User not found" });
		res.status(200).json(user.likedSongs);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getMe = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });
		if (!user) return res.status(404).json({ message: "User not found" });
		res.status(200).json({ premium: user.premium });
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// PesaPal Payment Integration
import crypto from 'crypto';
import { getOAuthToken, createPaymentOrder, getPaymentStatus, getPesaPalEmbedUrl, getPesaPalShareUrl, PESAPAL_CONSUMER_KEY, PESAPAL_BASE_URL } from "../lib/pesapal.js";

// Store pending payments in memory (in production, use a database)
const pendingPayments = new Map();

// Create PesaPal payment
export const createPesaPalPayment = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		if (!userId) return res.status(401).json({ message: "Unauthorized" });
		
		const user = await User.findOne({ clerkId: userId });
		if (!user) return res.status(404).json({ message: "User not found" });

		const { plan, amount } = req.body;

		const PLAN_PRICES = {
			Individual: 5.99,
			Duo: 10.99,
			Family: 12.99,
			Student: 2.99,
		};

		const planAmount = Number(amount ?? PLAN_PRICES[plan] ?? PLAN_PRICES.Individual);
		
		// Generate unique order tracking ID
		const orderTrackingId = `MELODY_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
		
		// Store pending payment
		pendingPayments.set(orderTrackingId, {
			userId,
			clerkId: userId,
			plan,
			amount: planAmount,
			status: 'pending',
			createdAt: new Date()
		});

		// Use direct PesaPal mrestaurant URL
		const pesapalStoreUrl = "https://store.pesapal.com/mrestaurant";
		const paymentUrl = `${pesapalStoreUrl}?amount=${planAmount}&reference=${orderTrackingId}&description=Junub+Muziki+Premium+${plan}`;
		
		res.status(200).json({
			success: true,
			paymentUrl,
			orderTrackingId,
			amount: planAmount,
			plan
		});
	} catch (error) {
		console.error("Error creating PesaPal payment:", error?.message || error);
		res.status(500).json({ success: false, message: error?.message || "Failed to initiate payment" });
	}
};

// Check PesaPal payment status
export const checkPesaPalPayment = async (req, res, next) => {
	try {
		const { orderTrackingId } = req.params;
		
		const pendingPayment = pendingPayments.get(orderTrackingId);
		
		if (!pendingPayment) {
			return res.status(404).json({ 
				success: false, 
				message: "Payment not found",
				paymentStatus: "failed"
			});
		}

		// Check if payment has expired (5 minutes)
		const now = new Date();
		const createdAt = new Date(pendingPayment.createdAt);
		const diffMinutes = (now - createdAt) / (1000 * 60);
		
		if (diffMinutes > 5) {
			pendingPayment.status = 'expired';
			pendingPayments.set(orderTrackingId, pendingPayment);
			return res.status(200).json({
				success: false,
				message: "Payment expired",
				paymentStatus: "expired"
			});
		}

		let paymentStatus = pendingPayment.status;
		const simulatedStatus = String(req.query.status || "").toLowerCase();
		
		if (!simulatedStatus) {
			try {
				const statusData = await getPaymentStatus(orderTrackingId);
				const rawStatus = typeof statusData === 'string'
					? statusData.toLowerCase()
					: String(statusData?.status || statusData?.paymentStatus || statusData?.transactionStatus || statusData?.message || "").toLowerCase();
				if (rawStatus.includes("completed") || rawStatus.includes("paid") || rawStatus.includes("success")) {
					paymentStatus = 'completed';
				} else if (rawStatus.includes("failed") || rawStatus.includes("declined") || rawStatus.includes("cancelled") || rawStatus.includes("canceled") || rawStatus.includes("expired")) {
					paymentStatus = 'failed';
				} else {
					paymentStatus = 'pending';
				}
			} catch (error) {
				console.error("Error fetching PesaPal payment status from API:", error?.message || error);
				paymentStatus = pendingPayment.status || 'pending';
			}
		} else {
			paymentStatus = simulatedStatus;
		}

		if (paymentStatus === 'completed') {
			const user = await User.findOne({ clerkId: pendingPayment.clerkId });
			if (user) {
				await Payment.create({
					userId: pendingPayment.clerkId,
					method: "PesaPal",
					plan: pendingPayment.plan,
					amount: pendingPayment.amount,
					receiverBankAccount: PESAPAL_CONSUMER_KEY,
					status: "completed",
				});
				user.premium = true;
				await user.save();
				pendingPayment.status = 'completed';
				pendingPayments.set(orderTrackingId, pendingPayment);
			}

			return res.status(200).json({
				success: true,
				message: "Payment completed",
				paymentStatus: "completed"
			});
		}

		if (paymentStatus === 'failed') {
			pendingPayment.status = 'failed';
			pendingPayments.set(orderTrackingId, pendingPayment);
			return res.status(200).json({
				success: false,
				message: "Payment failed",
				paymentStatus: "failed"
			});
		}

		return res.status(200).json({
			success: true,
			message: "Payment pending",
			paymentStatus: pendingPayment.status
		});
	} catch (error) {
		console.error("Error checking PesaPal payment:", error);
		next(error);
	}
};

// PesaPal callback endpoint (for IPN - Instant Payment Notification)
export const pesapalCallback = async (req, res, next) => {
	try {
		const { pesapal_transaction_tracking_id, pesapal_merchant_reference, pesapal_notification_type } = req.body;
		
		console.log("PesaPal Callback:", {
			transactionId: pesapal_transaction_tracking_id,
			merchantRef: pesapal_merchant_reference,
			notificationType: pesapal_notification_type
		});

		if (pesapal_notification_type === "COMPLETE") {
			const pendingPayment = pendingPayments.get(pesapal_merchant_reference);
			
			if (pendingPayment) {
				const user = await User.findOne({ clerkId: pendingPayment.clerkId });
				if (user) {
					await Payment.create({
						userId: pendingPayment.clerkId,
						method: "PesaPal",
						plan: pendingPayment.plan,
						amount: pendingPayment.amount,
						receiverBankAccount: PESAPAL_CONSUMER_KEY,
						status: "completed",
					});
					
					user.premium = true;
					await user.save();
					
					pendingPayment.status = 'completed';
					pendingPayments.set(pesapal_merchant_reference, pendingPayment);
				}
			}
		}

		res.status(200).json({ received: true });
	} catch (error) {
		console.error("Error processing PesaPal callback:", error);
		next(error);
	}
};

// Get PesaPal embed code
export const getPesaPalEmbedCode = async (req, res, next) => {
	try {
		const pesapalStoreUrl = "https://store.pesapal.com/mrestaurant";
		const embedCode = `<iframe width="200" height="40" src="https://store.pesapal.com/embed-code?pageUrl=${encodeURIComponent(pesapalStoreUrl)}" frameborder="0" allowfullscreen></iframe>`;
		const shareUrl = pesapalStoreUrl;
		
		res.status(200).json({
			success: true,
			embedCode,
			shareUrl,
			consumerKey: PESAPAL_CONSUMER_KEY
		});
	} catch (error) {
		console.error("Error getting PesaPal embed code:", error);
		next(error);
	}
};


