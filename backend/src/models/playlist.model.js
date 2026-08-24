import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        userId: { type: String, required: true }, // clerkId of the owner
        songs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song",
            },
        ],
    },
    { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
