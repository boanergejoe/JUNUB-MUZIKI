import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Song } from "@/types";
import SectionGrid from "../home/components/SectionGrid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/axios";

const ArtistPage = () => {
    const { artistName } = useParams<{ artistName: string }>();
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSongsByArtist = async () => {
            try {
                const response = await axiosInstance.get(`/songs/artist/${encodeURIComponent(artistName!)}`);
                setSongs(response.data);
            } catch (error) {
                console.error("Error fetching songs by artist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (artistName) {
            fetchSongsByArtist();
        }
    }, [artistName]);

    return (
        <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{artistName}</h1>
                <p className="text-zinc-400">{songs.length} songs</p>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <SectionGrid songs={songs} title="Songs" isLoading={isLoading} showAll={false} />
            </ScrollArea>
        </div>
    );
};

export default ArtistPage;