import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
	try {
		const { firstName, lastName, imageUrl } = req.body;
		const id = req.auth.userId;
		if (!id) return res.status(401).json({ message: "Unauthorized" });

		// check if user already exists
		const user = await User.findOne({ clerkId: id });

		if (!user) {
			// signup
			await User.create({
				clerkId: id,
				fullName: `${firstName || ""} ${lastName || ""}`.trim(),
				imageUrl,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};
