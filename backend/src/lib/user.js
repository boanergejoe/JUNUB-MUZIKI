import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

/**
 * Make sure a Clerk user has a matching database record. Auth callbacks can be
 * missed (network error, old deployment), so protected routes self-heal instead
 * of returning "User not found" for likes, playlists and Premium checks.
 */
export const ensureAppUser = async (clerkId) => {
	if (!clerkId) return null;

	const existingUser = await User.findOne({ clerkId });
	if (existingUser) return existingUser;

	const clerkUser = await clerkClient.users.getUser(clerkId);
	const fullName =
		[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
		clerkUser.username ||
		clerkUser.emailAddresses?.[0]?.emailAddress ||
		"Junub Muziki listener";

	// upsert avoids a race when two requests arrive before the first save ends.
	await User.updateOne(
		{ clerkId },
		{
			$setOnInsert: {
				clerkId,
				fullName,
				imageUrl: clerkUser.imageUrl || "",
			},
		},
		{ upsert: true }
	);

	return User.findOne({ clerkId });
};
