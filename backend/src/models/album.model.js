import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		artist: { type: String, required: true },
		genre: { type: String, default: "Pop" },
		imageUrl: { type: String, required: true },
		releaseYear: { type: Number, required: true },
		songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
	},
	{ timestamps: true }
); //  createdAt, updatedAt

export const Album = mongoose.model("Album", albumSchema);
