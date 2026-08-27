import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import PlayButton from "./PlayButton";
import HorizontalScroll from "@/components/ui/horizontal-scroll";
import { Link } from "react-router-dom";

const FeaturedSection = () => {
	const { isLoading, featuredSongs, error } = useMusicStore();

	if (isLoading) return <FeaturedGridSkeleton />;

	if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

	return (
		<div className='mb-8'>
			<div className='mb-3 flex items-center justify-between'>
				<h2 className='text-2xl font-bold'>Featured music</h2>
				<Link to='/songs' className='text-sm font-semibold text-zinc-400 hover:text-white'>View all</Link>
			</div>
		<HorizontalScroll label='featured songs'>
			{featuredSongs.map((song) => (
				<div
					key={song._id}
					className='flex min-w-[240px] snap-start items-center overflow-hidden rounded-md bg-zinc-800/50
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
				>
					<img
						src={song.imageUrl}
						alt={song.title}
						className='size-16 shrink-0 object-cover sm:size-20'
					/>
					<div className='flex-1 p-4'>
						<p className='font-medium truncate'>{song.title}</p>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
					<PlayButton song={song} />
				</div>
			))}
		</HorizontalScroll>
		</div>
	);
};
export default FeaturedSection;
