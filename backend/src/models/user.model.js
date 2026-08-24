import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
		// list of songs this user has liked (User Library > Songs)
		likedSongs: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Song",
			},
		],
		premium: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true } //  createdAt, updatedAt
);

export const User = mongoose.model("User", userSchema);
