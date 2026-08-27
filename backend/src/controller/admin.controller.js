import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";
import { clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, albumId, duration, isPremium, premiumTier, genre } = req.body;
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile);
		const imageUrl = await uploadToCloudinary(imageFile);

		const song = new Song({
			title,
			artist,
			genre: genre || "Pop",
			audioUrl,
			imageUrl,
			duration,
			albumId: albumId || null,
			isPremium: isPremium === "true" || isPremium === true,
			premiumTier: premiumTier || null,
		});

		await song.save();

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const updateSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { isPremium, premiumTier } = req.body;

		const updates = {};
		if (typeof isPremium !== "undefined") {
			updates.isPremium = isPremium === "true" || isPremium === true;
		}
		if (typeof premiumTier !== "undefined") {
			updates.premiumTier = premiumTier || null;
		}

		const updatedSong = await Song.findByIdAndUpdate(id, updates, { new: true });

		if (!updatedSong) {
			return res.status(404).json({ message: "Song not found" });
		}

		res.status(200).json(updatedSong);
	} catch (error) {
		console.log("Error in updateSong", error);
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artist, releaseYear, genre } = req.body;
		const { imageFile } = req.files;

		const imageUrl = await uploadToCloudinary(imageFile);

		const album = new Album({
			title,
			artist,
			genre: genre || "Pop",
			releaseYear,
			imageUrl,
		});

		await album.save();

		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true, superAdmin: Boolean(req.admin?.isSuperAdmin) });
};

export const grantAdmin = async (req, res, next) => {
	try {
		if (!req.admin?.isSuperAdmin) {
			return res.status(403).json({ message: "Only the super admin can grant admin access" });
		}

		const email = req.body.email?.trim().toLowerCase();
		if (!email) return res.status(400).json({ message: "An email address is required" });

		const users = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 });
		const clerkUser = users.data?.[0];
		if (!clerkUser) return res.status(404).json({ message: "No Clerk user found for that email" });

		const user = await User.findOneAndUpdate(
			{ clerkId: clerkUser.id },
			{
				$set: { isAdmin: true },
				$setOnInsert: {
					fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email,
					imageUrl: clerkUser.imageUrl || "",
					clerkId: clerkUser.id,
				},
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true }
		);

		res.status(200).json({ message: "Admin access granted", user: { id: user.clerkId, email } });
	} catch (error) {
		next(error);
	}
};

export const revokeAdmin = async (req, res, next) => {
	try {
		if (!req.admin?.isSuperAdmin) {
			return res.status(403).json({ message: "Only the super admin can revoke admin access" });
		}

		const email = req.body.email?.trim().toLowerCase();
		if (!email) return res.status(400).json({ message: "An email address is required" });
		if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
			return res.status(400).json({ message: "The super admin cannot be revoked" });
		}

		const users = await clerkClient.users.getUserList({ emailAddress: [email], limit: 1 });
		const clerkUser = users.data?.[0];
		if (!clerkUser) return res.status(404).json({ message: "No Clerk user found for that email" });

		await User.findOneAndUpdate({ clerkId: clerkUser.id }, { $set: { isAdmin: false } });
		res.status(200).json({ message: "Admin access revoked", email });
	} catch (error) {
		next(error);
	}
};
