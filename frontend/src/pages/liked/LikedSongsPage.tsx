import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Play, Pause } from "lucide-react";
import { formatDuration } from "../album/AlbumPage";
import { Button } from "@/components/ui/button";

const LikedSongsPage = () => {
    const { likedSongs, fetchLikedSongs, isLoading } = useUserStore();
    const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

    useEffect(() => {
        fetchLikedSongs();
    }, [fetchLikedSongs]);

    const handlePlaySong = (index: number) => {
        playAlbum(likedSongs, index);
    };

    const handlePlayAll = () => {
        const isCurrentPlaying = likedSongs.some((s) => s._id === currentSong?._id);
        if (isCurrentPlaying) togglePlay();
        else playAlbum(likedSongs, 0);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Liked Songs</h1>
            <div className="mb-4">
                <Button onClick={handlePlayAll} size="icon">
                    {isPlaying && likedSongs.some((s) => s._id === currentSong?._id) ? (
                        <Pause />
                    ) : (
                        <Play />
                    )}
                </Button>
            </div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="space-y-2">
                    {likedSongs.map((song, idx) => (
                        <div
                            key={song._id}
                            className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 text-sm 
              text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer w-full text-left"
                            onClick={() => handlePlaySong(idx)}
                        >
                            <div className="flex items-center justify-center">
                                {currentSong?._id === song._id && isPlaying ? (
                                    <div className="size-4 text-green-500">♫</div>
                                ) : (
                                    <span className="group-hover:hidden">{idx + 1}</span>
                                )}
                                {!isPlaying && (
                                    <Play className="h-4 w-4 hidden group-hover:block" />
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <img src={song.imageUrl} alt={song.title} className="size-10" />
                                <div>
                                    <div className="font-medium text-white">{song.title}</div>
                                    <div>{song.artist}</div>
                                </div>
                            </div>
                            <div className="flex items-center">{song.createdAt.split("T")[0]}</div>
                            <div className="flex items-center">{formatDuration(song.duration)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LikedSongsPage;