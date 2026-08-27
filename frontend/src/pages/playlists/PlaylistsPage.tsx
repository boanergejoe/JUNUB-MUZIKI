import { useEffect, useState } from "react";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";

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
        <div className="flex h-full min-h-0 min-w-0 flex-col p-4">
            <ScrollArea className="min-h-0 flex-1">
                <div className="min-w-0">
                    <h1 className="mb-4 text-2xl font-bold">Your Playlists</h1>
                    <div className="mb-6 flex gap-2">
                        <input
                            type="text"
                            className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                            placeholder="New playlist title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <Button onClick={handleCreate}>Create</Button>
                    </div>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {playlists.map((pl) => (
                                <Link
                                    to={`/playlists/${pl._id}`}
                                    key={pl._id}
                                    className="rounded bg-zinc-900 p-4 hover:bg-zinc-800"
                                >
                                    <h2 className="truncate font-semibold">{pl.title}</h2>
                                    <p className="text-sm text-zinc-400">{pl.songs.length} songs</p>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Footer />
                </div>
            </ScrollArea>
        </div>
    );
};

export default PlaylistsPage;