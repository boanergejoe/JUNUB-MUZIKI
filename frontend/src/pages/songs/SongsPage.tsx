
import { useEffect, useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import SectionGrid from "../home/components/SectionGrid";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";

const SongsPage = () => {
    const { songs, fetchSongs, isLoading } = useMusicStore();
    const [search, setSearch] = useState("");

    // fetch songs initially and whenever search query changes
    useEffect(() => {
        fetchSongs(search);
    }, [fetchSongs, search]);

    // if backend returns all songs when search is empty we can simply use songs directly
    const filteredSongs = songs; // backend already filtered if "search" is provided

    return (
        <div className="flex h-full min-h-0 flex-col p-2 sm:p-4">
            <h1 className="text-2xl font-bold mb-4">All Songs</h1>
            <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
                <input
                    type="text"
                    placeholder="Search songs or artists..."
                    className="w-full sm:w-96 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <ScrollArea className="min-h-0 flex-1">
                <SectionGrid songs={filteredSongs} title="Songs" isLoading={isLoading} showAll={false} />
                <Footer />
            </ScrollArea>
        </div>
    );
};

export default SongsPage;
