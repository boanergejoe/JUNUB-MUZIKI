import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Radio, Music } from "lucide-react";

const RadioPage = () => {
    const navigate = useNavigate();
    const genres = [
        "Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic",
        "Country", "R&B", "Reggae", "Blues", "Folk", "Indie",
        "Metal", "Punk", "Alternative", "Dance", "Soul", "Funk"
    ];

    return (
        <div className="min-h-screen max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-[#1db954] scrollbar-track-zinc-900 bg-gradient-to-b from-[#0b1220] via-[#111827] to-[#0f172a] px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-6xl space-y-10">
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white flex items-center gap-3">
                                <Radio className="h-10 w-10 text-[#1db954]" />
                                Radio Stations
                            </h1>
                            <p className="mt-3 max-w-2xl text-zinc-300 text-lg">Explore curated radio stations for every mood, genre, and moment. Tap play to start a seamless music journey.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => navigate(`/search?q=*`)} className="rounded-full bg-[#1db954] px-6 py-3 text-base font-semibold text-black hover:bg-[#22e372]">Featured</Button>
                            <Button onClick={() => navigate(`/search?q=*`)} variant="outline" className="rounded-full px-6 py-3 text-base">Browse all</Button>
                        </div>
                    </div>
                </div>

                <ScrollArea className="max-h-[72vh] overflow-y-auto overflow-x-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/90 p-4 scrollbar-thin scrollbar-thumb-[#1db954] scrollbar-track-zinc-900">
                    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
                        <div className="space-y-6">
                            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <div>
                                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Top stations</p>
                                    <h2 className="text-3xl font-semibold text-white">Live radio curated for you</h2>
                                </div>
                                <span className="rounded-full bg-[#1db954]/15 px-4 py-2 text-sm font-medium text-[#1db954]">Updated daily</span>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {genres.slice(0, 8).map((genre) => (
                                    <Card key={genre} onClick={() => navigate(`/search?genre=${encodeURIComponent(genre)}`)} className="bg-zinc-800 border border-zinc-700 shadow-sm hover:bg-zinc-700/80 transition-colors cursor-pointer">
                                        <CardHeader className="p-5">
                                            <CardTitle className="text-xl text-white">{genre} Radio</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-5 pt-0">
                                            <p className="text-zinc-400 mb-4">Station with fresh mixes, trends, and exclusive drops for {genre} fans.</p>
                                            <Button onClick={() => navigate(`/search?genre=${encodeURIComponent(genre)}`)} className="w-full rounded-2xl bg-[#1db954] text-black hover:bg-[#1ef67a]">Play {genre}</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">Discover genres</h2>
                            <ScrollArea className="h-72 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {genres.map((genre) => (
                                        <div
                                            key={genre}
                                            onClick={() => navigate(`/search?genre=${encodeURIComponent(genre)}`)}
                                            className="rounded-3xl bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                                        >
                                            {genre}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                            <h2 className="text-2xl font-semibold text-white mb-4">Why Radio?</h2>
                            <ul className="space-y-4 text-zinc-300">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#1db954]" />
                                    <span>Seamless listening with handpicked station playlists.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#1db954]" />
                                    <span>Discover new hits across every genre and era.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#1db954]" />
                                    <span>Perfect for mood playlists, workouts, and background music.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <Music className="h-8 w-8 text-[#1db954]" />
                                <div>
                                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Quick listen</p>
                                    <h3 className="text-xl font-semibold text-white">On-demand stations</h3>
                                </div>
                            </div>
                            <p className="text-zinc-400 mb-6">Launch a station in one click and keep the music flowing.</p>
                            <Button className="w-full rounded-2xl bg-[#1db954] text-black hover:bg-[#1ef67a]">Start listening now</Button>
                        </div>
                    </aside>
                </div>
            </ScrollArea>
            <div className="mt-8">
                <Footer />
            </div>
            </div>
        </div>
    );
};

export default RadioPage;