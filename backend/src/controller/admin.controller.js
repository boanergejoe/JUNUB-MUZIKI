import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

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
		const { title, artist, genre, duration, albumId, isPremium, premiumTier } = req.body;

		const updates = {};
		if (typeof title !== "undefined") updates.title = title.trim();
		if (typeof artist !== "undefined") updates.artist = artist.trim();
		if (typeof genre !== "undefined") updates.genre = genre.trim();
		if (typeof duration !== "undefined") updates.duration = Number(duration);
		if (typeof albumId !== "undefined") updates.albumId = albumId || null;
		if (typeof isPremium !== "undefined") {
			updates.isPremium = isPremium === "true" || isPremium === true;
		}
		if (typeof premiumTier !== "undefined") {
			updates.premiumTier = premiumTier || null;
		}

		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		if (typeof albumId !== "undefined" && String(song.albumId || "") !== String(updates.albumId || "")) {
			if (song.albumId) {
				await Album.findByIdAndUpdate(song.albumId, { $pull: { songs: song._id } });
			}
			if (updates.albumId) {
				await Album.findByIdAndUpdate(updates.albumId, { $addToSet: { songs: song._id } });
			}
		}

		const updatedSong = await Song.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

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
		if (!req.files?.imageFile) {
			return res.status(400).json({ message: "Please upload album artwork" });
		}
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

export const updateAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, artist, genre, releaseYear } = req.body;
		const updates = {};
		if (typeof title !== "undefined") updates.title = title.trim();
		if (typeof artist !== "undefined") updates.artist = artist.trim();
		if (typeof genre !== "undefined") updates.genre = genre.trim();
		if (typeof releaseYear !== "undefined") updates.releaseYear = Number(releaseYear);

		const album = await Album.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate("songs");
		if (!album) return res.status(404).json({ message: "Album not found" });

		res.status(200).json(album);
	} catch (error) {
		console.log("Error in updateAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true, superAdmin: Boolean(req.admin?.isSuperAdmin) });
};

