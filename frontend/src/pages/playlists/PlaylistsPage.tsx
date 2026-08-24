import { useEffect, useState } from "react";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const PlaylistsPage = () => {
    const { playlists, fetchPlaylists, createPlaylist, isLoading } = usePlaylistStore();
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            toast.error("Playlist title cannot be empty");
            return;
        }
        await createPlaylist(newTitle.trim());
        setNewTitle("");
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Your Playlists</h1>
            <div className="mb-6 flex gap-2">
                <input
                    type="text"
                    className="flex-1 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white"
                    placeholder="New playlist title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <Button onClick={handleCreate}>Create</Button>
            </div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {playlists.map((pl) => (
                        <Link
                            to={`/playlists/${pl._id}`}
                            key={pl._id}
                            className="p-4 bg-zinc-900 rounded hover:bg-zinc-800"
                        >
                            <h2 className="font-semibold truncate">{pl.title}</h2>
                            <p className="text-sm text-zinc-400">{pl.songs.length} songs</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlaylistsPage;