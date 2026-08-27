import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { ArrowRight, Disc3, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import PlayButton from "./components/PlayButton";
import { Album, Song } from "@/types";
import HorizontalScroll from "@/components/ui/horizontal-scroll";


const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		fetchPopularSongs,
		fetchAlbums,
		isLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
		popularSongs,
		albums,
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
		fetchAlbums();
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchPopularSongs, fetchAlbums]);

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

	const allSongs = [...featuredSongs, ...madeForYouSongs, ...trendingSongs, ...popularSongs];
	const artists = Array.from(new Map(allSongs.map((song) => [song.artist, song])).values()).slice(0, 8);

	return (
		<main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-md bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
			<Topbar search={search} setSearch={handleSearchChange} />
			<ScrollArea className="min-h-0 flex-1">
				<div className="grid min-w-0 w-full max-w-full grid-cols-[minmax(0,1fr)] overflow-x-hidden p-4 sm:p-7">
					<div className="mb-7 flex items-end justify-between gap-4">
						<div>
							<p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Junub Muziki</p>
							<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Good music, right on time</h1>
						</div>
						<Link to="/radio" className="hidden items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white sm:flex">Explore radio <ArrowRight className="size-4" /></Link>
					</div>
					<FeaturedSection />
					<MediaRail title="Popular radio" subtitle="Your daily mix of artists and sounds" songs={popularSongs} variant="radio" />
					<ChartRail />
					<div className="space-y-8">
						<SectionGrid title="Trending songs" songs={filterSongs(trendingSongs)} isLoading={isLoading} showAll compact />
						<SectionGrid title="Most Popular" songs={filterSongs(popularSongs)} isLoading={isLoading} showAll />
					</div>
					<ArtistRail artists={artists} />
					{albums.length > 0 && <AlbumRail albums={albums} />}
					<Footer />
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;

const MediaRail = ({ title, subtitle, songs, variant }: { title: string; subtitle: string; songs: Song[]; variant?: "radio" }) => (
	<section className="mb-9">
		<div className="mb-4 flex items-end justify-between">
			<div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-zinc-400">{subtitle}</p></div>
			<Link to="/songs" className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white">View all</Link>
		</div>
		<HorizontalScroll label={title}>
			{songs.slice(0, 6).map((song, index) => (
				<div key={`${song._id}-${index}`} className="group w-[168px] shrink-0 snap-start sm:w-[184px]">
					<div className={`relative aspect-square overflow-hidden rounded-lg ${variant === "radio" ? "rounded-[18px]" : ""}`}>
						<img src={song.imageUrl} alt={song.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
						{variant === "radio" && <div className="absolute inset-x-0 top-0 flex justify-between p-3 text-[10px] font-bold tracking-widest text-white"><Headphones className="size-4" /><span>RADIO</span></div>}
						<div className="absolute bottom-3 right-3 opacity-0 transition group-hover:opacity-100"><PlayButton song={song} /></div>
					</div>
					<h3 className="mt-3 truncate font-semibold">{song.artist}</h3>
					<p className="truncate text-sm text-zinc-400">With {song.title} and more</p>
				</div>
			))}
		</HorizontalScroll>
	</section>
);

const ChartRail = () => {
	const charts = [
		{ title: "Top Songs", region: "Global", colors: "from-fuchsia-700 to-violet-500" },
		{ title: "Top Songs", region: "USA", colors: "from-red-600 to-rose-500" },
		{ title: "Top 50", region: "Global", colors: "from-cyan-700 to-blue-950" },
		{ title: "Top 50", region: "USA", colors: "from-pink-600 to-red-600" },
	];
	return <section className="mb-9"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">Featured charts</h2><Link to="/songs" className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white">View all</Link></div><HorizontalScroll label="featured charts">{charts.map((chart) => <div key={`${chart.title}-${chart.region}`} className={`flex aspect-[0.78] min-w-[150px] snap-start flex-col justify-between rounded-lg bg-gradient-to-br ${chart.colors} p-4 text-white sm:min-w-[180px]`}><Disc3 className="size-4" /><div><p className="text-2xl font-black leading-none sm:text-3xl">{chart.title}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-white/80">{chart.region}</p></div><p className="text-xs font-semibold">Weekly music charts</p></div>)}</HorizontalScroll></section>;
};

const ArtistRail = ({ artists }: { artists: Song[] }) => <section className="mb-9"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">Popular artists</h2><Link to="/songs" className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white">View all</Link></div><HorizontalScroll label="popular artists">{artists.map((artist) => <Link key={artist.artist} to={`/artists/${encodeURIComponent(artist.artist)}`} className="group min-w-[120px] snap-start text-center sm:min-w-[150px]"><img src={artist.imageUrl} alt={artist.artist} className="aspect-square w-full rounded-full object-cover ring-1 ring-white/5 transition group-hover:scale-105 group-hover:ring-emerald-400" /><p className="mt-3 truncate font-semibold">{artist.artist}</p><p className="text-sm text-zinc-400">Artist</p></Link>)}</HorizontalScroll></section>;

const AlbumRail = ({ albums }: { albums: Album[] }) => <MediaRail title="Popular albums" subtitle="Albums worth playing all the way through" songs={albums.flatMap((album) => album.songs?.slice(0, 1).map((song) => ({ ...song, artist: album.title })) || [])} />;
