import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../album/AlbumPage";
import { Play, Pause, Trash } from "lucide-react";

const PlaylistPage = () => {
    const { playlistId } = useParams();
    const {
        currentPlaylist,
        fetchPlaylistById,
        deletePlaylist,
        removeSong,
    } = usePlaylistStore();
    const { songs } = useMusicStore();
    const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
    const [showAddMenu, setShowAddMenu] = useState(false);

    useEffect(() => {
        if (playlistId) fetchPlaylistById(playlistId);
    }, [fetchPlaylistById, playlistId]);

    const handlePlayPlaylist = () => {
        if (!currentPlaylist) return;
        const isCurrentPlaying = currentPlaylist.songs.some((s) => s._id === currentSong?._id);
        if (isCurrentPlaying) togglePlay();
        else playAlbum(currentPlaylist.songs, 0);
    };

    const handlePlaySong = (index: number) => {
        if (!currentPlaylist) return;
        playAlbum(currentPlaylist.songs, index);
    };

    const handleRemove = async (songId: string) => {
        if (!playlistId) return;
        await removeSong(playlistId, songId);
    };

    const availableToAdd = songs.filter(
        (s) => !currentPlaylist?.songs.find((x) => x._id === s._id)
    );

    const handleAdd = async (songId: string) => {
        if (!playlistId) return;
        await usePlaylistStore.getState().addSong(playlistId, songId);
        setShowAddMenu(false);
    };

    if (!currentPlaylist) return null;

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{currentPlaylist.title}</h1>
                <Button size="icon" onClick={() => playlistId && deletePlaylist(playlistId)}>
                    <Trash />
                </Button>
            </div>
            <div className="mb-4">
                <Button size="icon" onClick={handlePlayPlaylist}>
                    {isPlaying && currentPlaylist.songs.some((s) => s._id === currentSong?._id) ? (
                        <Pause />
                    ) : (
                        <Play />
                    )}
                </Button>
            </div>
            <table className="w-full">
                <thead className="text-zinc-400">
                    <tr className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4">
                        <th>#</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>
                            <span className="sr-only">Duration</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentPlaylist.songs.map((song, idx) => {
                        const isCurrentSong = currentSong?._id === song._id;
                        return (
                            <tr key={song._id} className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 items-center">
                                <td>
                                    {isCurrentSong && isPlaying ? "♫" : idx + 1}
                                </td>
                                <td>
                                    <button
                                        className="flex items-center gap-3 w-full text-left"
                                        onClick={() => handlePlaySong(idx)}
                                    >
                                        <img src={song.imageUrl} alt={song.title} className="size-10" />
                                        <div>
                                            <div className="font-medium text-white">{song.title}</div>
                                            <div>{song.artist}</div>
                                        </div>
                                    </button>
                                </td>
                                <td>{song.createdAt.split("T")[0]}</td>
                                <td>{formatDuration(song.duration)}</td>
                                <td>
                                    <Button size="icon" variant="ghost" onClick={() => handleRemove(song._id)}>
                                        <Trash className="text-red-400" />
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* add song dropdown */}
            <div className="mt-4">
                <Button onClick={() => setShowAddMenu((v) => !v)}>Add song</Button>
                {showAddMenu && (
                    <div className="mt-2 p-2 bg-zinc-800 rounded">
                        {availableToAdd.length === 0 && <p className="text-sm">No songs available</p>}
                        {availableToAdd.map((s) => (
                            <div key={s._id} className="flex justify-between items-center">
                                <span>{s.title}</span>
                                <Button size="icon" onClick={() => handleAdd(s._id)}>
                                    +
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistPage;