import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
	if (!req.auth?.userId) {
		return res.status(401).json({ message: "Unauthorized - you must be logged in" });
	}
	next();
};

export const requireAdmin = async (req, res, next) => {
	try {
		const currentUser = await clerkClient.users.getUser(req.auth.userId);
		const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
		const currentUserEmail = currentUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
		const isSuperAdmin = Boolean(configuredAdminEmail && currentUserEmail && configuredAdminEmail === currentUserEmail);
		const databaseUser = await User.findOne({ clerkId: req.auth.userId }).select("isAdmin");
		const isAdmin = isSuperAdmin || Boolean(databaseUser?.isAdmin);

		if (!isAdmin) {
			return res.status(403).json({ message: "Unauthorized - you must be an admin" });
		}

		req.admin = { isSuperAdmin, email: currentUserEmail };
		next();
	} catch (error) {
		next(error);
	}
};
