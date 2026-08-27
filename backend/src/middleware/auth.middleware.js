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
		const primaryEmail = currentUser.emailAddresses.find(
			(emailAddress) => emailAddress.id === currentUser.primaryEmailAddressId
		);
		const currentUserEmail = primaryEmail?.emailAddress?.trim().toLowerCase();
		const isVerified = primaryEmail?.verification?.status === "verified";
		const isSuperAdmin = Boolean(
			configuredAdminEmail && currentUserEmail && configuredAdminEmail === currentUserEmail && isVerified
		);

		if (!isSuperAdmin) {
			return res.status(403).json({ message: "Only the verified super admin account may access this area" });
		}

		req.admin = { isSuperAdmin: true, email: currentUserEmail };
		next();
	} catch (error) {
		next(error);
	}
};
