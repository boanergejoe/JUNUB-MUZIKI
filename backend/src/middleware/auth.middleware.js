import { clerkClient } from "@clerk/express";

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
		const isAdmin = Boolean(configuredAdminEmail && currentUserEmail && configuredAdminEmail === currentUserEmail);

		if (!isAdmin) {
			return res.status(403).json({ message: "Unauthorized - you must be an admin" });
		}

		next();
	} catch (error) {
		next(error);
	}
};
