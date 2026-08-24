import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";


const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		fetchPopularSongs,
		isLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
		popularSongs,
	} = useMusicStore();
	const { initializeQueue } = usePlayerStore();
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (value.trim()) {
			navigate(`/search?q=${encodeURIComponent(value)}`);
		}
	};

	useEffect(() => {
		fetchFeaturedSongs();
		fetchMadeForYouSongs();
		fetchTrendingSongs();
		fetchPopularSongs();
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchPopularSongs]);

	useEffect(() => {
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0 && popularSongs.length > 0) {
			const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs, ...popularSongs];
			initializeQueue(allSongs);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs, popularSongs]);

	// Filter songs by search
	const filterSongs = (songs: typeof featuredSongs) =>
		songs.filter(
			(s) =>
				s.title.toLowerCase().includes(search.toLowerCase()) ||
				s.artist.toLowerCase().includes(search.toLowerCase())
		);

	return (
		<main className="flex h-full min-h-0 flex-col overflow-hidden rounded-md bg-gradient-to-b from-zinc-800 to-zinc-900">
			<Topbar search={search} setSearch={handleSearchChange} />
			<ScrollArea className="min-h-0 flex-1">
				<div className="p-2 sm:p-6">
					<h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your vibe, your way</h1>
					<FeaturedSection />
					<div className="space-y-8">
						<SectionGrid title="Made For You" songs={filterSongs(madeForYouSongs)} isLoading={isLoading} showAll />
						<SectionGrid title="Trending" songs={filterSongs(trendingSongs)} isLoading={isLoading} showAll />
						<SectionGrid title="Most Popular" songs={filterSongs(popularSongs)} isLoading={isLoading} showAll />
					</div>
					<Footer />
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
