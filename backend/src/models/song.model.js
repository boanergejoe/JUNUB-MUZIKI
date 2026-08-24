import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		genre: {
			type: String,
			default: "Pop",
		},
		imageUrl: {
			type: String,
			required: true,
		},
		audioUrl: {
			type: String,
			required: true,
		},
		duration: {
			type: Number,
			required: true,
		},
		albumId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Album",
			required: false,
		},
		isPremium: {
			type: Boolean,
			default: false,
		},
		premiumTier: {
			type: String,
			enum: ["Featured", "Exclusive", "Top Premium"],
			default: null,
		},
		likesCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const Song = mongoose.model("Song", songSchema);
