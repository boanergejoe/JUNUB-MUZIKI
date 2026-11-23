import { ensureAppUser } from "../lib/user.js";

export const authCallback = async (req, res, next) => {
	try {
		const id = req.auth?.userId;
		if (!id) return res.status(401).json({ message: "Unauthorized" });

		await ensureAppUser(id);

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};
