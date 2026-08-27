import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

const hideLockedAudio = async (songs, req) => {
	const list = Array.isArray(songs) ? songs : [songs];
	const user = req.auth?.userId ? await User.findOne({ clerkId: req.auth.userId }).select("premium") : null;
	const hasPremiumAccess = Boolean(user?.premium);
	return list.map((song) => {
		const result = typeof song.toObject === "function" ? song.toObject() : { ...song };
		if (result.isPremium && !hasPremiumAccess) result.audioUrl = null;
		return result;
	});
};

export const getAllSongs = async (req, res, next) => {
	try {
		// -1 = Descending => newest -> oldest
		// 1 = Ascending => oldest -> newest
		const songs = await Song.find().sort({ createdAt: -1 });
		res.json(await hideLockedAudio(songs, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		// fetch 6 random songs using mongodb's aggregation pipeline
		const songs = await Song.aggregate([
			{
				$sample: { size: 6 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(await hideLockedAudio(songs, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(await hideLockedAudio(songs, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		const songs = await Song.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					title: 1,
					artist: 1,
					imageUrl: 1,
					audioUrl: 1,
				},
			},
		]);

		res.json(await hideLockedAudio(songs, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getMostPopularSongs = async (req, res, next) => {
	try {
		const songs = await Song.find()
			.sort({ likesCount: -1 }) // Sort by likes count descending
			.limit(10) // Get top 10 most liked songs
			.select('_id title artist imageUrl audioUrl duration likesCount');

		res.json(await hideLockedAudio(songs, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};

// server-side search endpoint. users can call /api/songs/search?q=term or /api/songs/search?genre=Pop
// similar to Spotify's Search API: https://developer.spotify.com/documentation/web-api/reference/#/operations/search
export const searchSongs = async (req, res, next) => {
	try {
		const { q, genre, isPremium } = req.query;

		// Build filter object
		const filter = {};

		if (q && q !== "*") {
			const regex = new RegExp(q, "i");
			filter.$or = [{ title: regex }, { artist: regex }];
		}

		if (genre) {
			filter.genre = genre;
		}

		if (typeof isPremium !== "undefined") {
			filter.isPremium = String(isPremium) === "true";
		}

		if (!q && !genre && typeof isPremium === "undefined") {
			return res.status(400).json({ message: "Query parameter q, genre, or isPremium is required" });
		}

		const results = await Song.find(filter);
		res.status(200).json(await hideLockedAudio(results, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getSongById = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (id === "popular") {
			// Return popular songs if 'popular' is passed
			const songs = await Song.find().sort({ likesCount: -1 }).limit(10);
			return res.json(await hideLockedAudio(songs, req));
		}
		if (id === "trending") {
			// Return trending songs if 'trending' is passed
			const songs = await Song.aggregate([
				{ $sample: { size: 4 } },
				{ $project: { _id: 1, title: 1, artist: 1, imageUrl: 1, audioUrl: 1 } }
			]);
			return res.json(await hideLockedAudio(songs, req));
		}
		// Validate ObjectId
		const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
		if (!isValidObjectId) {
			// If not valid ObjectId, return all songs (or you can customize to return featured, trending, etc.)
			const songs = await Song.find().sort({ createdAt: -1 });
			return res.json(await hideLockedAudio(songs, req));
		}
		const song = await Song.findById(id);
		if (!song) return res.status(404).json({ message: "Song not found" });
		res.json((await hideLockedAudio(song, req))[0]);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const downloadSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const userId = req.auth?.userId;

		// Check if user is authenticated
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		// Get the song
		const song = await Song.findById(id);
		if (!song) {
			return res.status(404).json({ message: "Song not found" });
		}

		// Check if song is premium
		if (song.isPremium) {
			// Verify user has premium access
			const user = await User.findOne({ clerkId: userId });
			
			if (!user || !user.premium) {
				return res.status(403).json({ message: "Premium access required" });
			}
		}

		// Redirect to the audio URL (served from Cloudinary or storage)
		res.json({ success: true, downloadUrl: song.audioUrl, songTitle: song.title });
	} catch (error) {
		console.error("Error in downloadSong:", error);
		next(error);
	}
};

export const getPopularSongs = async (req, res, next) => {
	try {
		const songs = await Song.find().sort({ likesCount: -1 }).limit(10);
		res.json(await hideLockedAudio(songs, req));
	} catch (error) {
		console.error(error);
		next(error);
	}
};


