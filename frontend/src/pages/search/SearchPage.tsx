import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Song, Album } from "@/types";
import SectionGrid from "../home/components/SectionGrid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosInstance } from "@/lib/axios";
import Footer from "@/components/Footer";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const genre = searchParams.get("genre") || "";
    const [songs, setSongs] = useState<Song[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (!query && !genre) return;

            setIsLoading(true);
            try {
                const songsRequest = genre
                    ? axiosInstance.get(`/songs/search?genre=${encodeURIComponent(genre)}`)
                    : axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);

                const [songsRes, albumsRes] = await Promise.all([
                    songsRequest,
                    axiosInstance.get(`/albums`)
                ]);

                const filteredAlbums = albumsRes.data.filter((album: Album) =>
                    album.title.toLowerCase().includes(query.toLowerCase()) ||
                    album.artist.toLowerCase().includes(query.toLowerCase())
                );

                setSongs(songsRes.data);
                setAlbums(filteredAlbums);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        search();
    }, [query, genre]);

    return (
        <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">
            <h1 className="text-3xl font-bold mb-6">
                {genre ? `Genre: ${genre}` : query === "*" ? "Browse all songs" : `Search Results for "${query}"`}
            </h1>

            <Tabs defaultValue="songs" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="songs">Songs</TabsTrigger>
                    <TabsTrigger value="albums">Albums</TabsTrigger>
                </TabsList>

                <TabsContent value="songs">
                    <ScrollArea className="min-h-0 flex-1">
                        <SectionGrid songs={songs} title="Songs" isLoading={isLoading} showAll={false} />
                        <Footer />
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="albums">
                    <ScrollArea className="min-h-0 flex-1">
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {albums.map((album) => (
                                <div
                                    key={album._id}
                                    className="bg-zinc-800/40 p-3 sm:p-4 rounded-md hover:bg-zinc-700/40 transition-all cursor-pointer"
                                    onClick={() => window.location.href = `/albums/${album._id}`}
                                >
                                    <div className="aspect-square rounded-md shadow-lg overflow-hidden mb-3 sm:mb-4">
                                        <img
                                            src={album.imageUrl}
                                            alt={album.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="font-medium mb-2 truncate">{album.title}</h3>
                                    <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
                                </div>
                            ))}
                        </div>
                        <Footer />
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SearchPage;