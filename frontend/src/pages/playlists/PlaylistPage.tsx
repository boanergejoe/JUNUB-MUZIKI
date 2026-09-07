import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../album/AlbumPage";
import { ListMusic, Play, Pause, Trash, Plus } from "lucide-react";

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
        <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-zinc-950 to-zinc-900 p-3 sm:p-6">
            <section className="mb-5 flex flex-col gap-4 border-b border-zinc-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-700 shadow-lg sm:size-24"><ListMusic className="size-8 text-black sm:size-10" /></div>
                    <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Playlist</p><h1 className="truncate text-2xl font-bold sm:text-4xl">{currentPlaylist.title}</h1><p className="mt-1 text-sm text-zinc-400">{currentPlaylist.songs.length} songs in playback order</p></div>
                </div>
                <div className="flex items-center gap-2 self-end">
                    <Button className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400" onClick={handlePlayPlaylist} disabled={!currentPlaylist.songs.length}>
                    {isPlaying && currentPlaylist.songs.some((s) => s._id === currentSong?._id) ? (
                        <Pause />
                    ) : (
                        <Play />
                    )}
                        {isPlaying && currentPlaylist.songs.some((s) => s._id === currentSong?._id) ? "Pause" : "Play all"}
                    </Button>
                    <Button size="icon" variant="outline" aria-label="Delete playlist" onClick={() => playlistId && deletePlaylist(playlistId)}><Trash /></Button>
                </div>
            </section>
            <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[620px]">
                <thead className="text-zinc-400">
                    <tr className="grid grid-cols-[32px_minmax(0,4fr)_2fr_1fr_40px] gap-4 border-b border-zinc-800 px-3 py-2 text-left text-xs uppercase tracking-wider">
                        <th>#</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>
                            Duration
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentPlaylist.songs.map((song, idx) => {
                        const isCurrentSong = currentSong?._id === song._id;
                        return (
                            <tr key={song._id} className="group grid grid-cols-[32px_minmax(0,4fr)_2fr_1fr_40px] items-center gap-4 rounded-lg border-b border-zinc-800/60 px-3 py-2 text-sm transition hover:bg-white/5">
                                <td className="text-zinc-400">
                                    {isCurrentSong && isPlaying ? "♫" : idx + 1}
                                </td>
                                <td>
                                    <button
                                        className="flex items-center gap-3 w-full text-left"
                                        onClick={() => handlePlaySong(idx)}
                                    >
                                        <img src={song.imageUrl} alt={song.title} className="size-10 rounded object-cover" />
                                        <div className="min-w-0">
                                            <div className="font-medium text-white">{song.title}</div>
                                            <div>{song.artist}</div>
                                        </div>
                                    </button>
                                </td>
                                <td className="text-zinc-400">{song.createdAt.split("T")[0]}</td>
                                <td className="text-zinc-400">{formatDuration(song.duration)}</td>
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
            </div>

            {/* add song dropdown */}
            <div className="relative mt-4">
                <Button variant="outline" className="gap-2" onClick={() => setShowAddMenu((v) => !v)}><Plus className="size-4" />Add song</Button>
                {showAddMenu && (
                    <div className="absolute bottom-12 left-0 z-10 max-h-64 w-full max-w-md overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
                        {availableToAdd.length === 0 && <p className="text-sm">No songs available</p>}
                        {availableToAdd.map((s) => (
                            <div key={s._id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-zinc-800">
                                <span className="truncate text-sm">{s.title} <span className="text-zinc-500">by {s.artist}</span></span>
                                <Button size="icon" aria-label={`Add ${s.title}`} onClick={() => handleAdd(s._id)}><Plus /></Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistPage;