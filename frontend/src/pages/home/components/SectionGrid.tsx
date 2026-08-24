import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import { Plus, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useUserStore } from "@/stores/useUserStore";
import { useNavigate, Link } from "react-router-dom";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
	showAll?: boolean;
	showAllLabel?: string;
};
const SectionGrid = ({ songs, title, isLoading, showAll = false, showAllLabel }: SectionGridProps) => {
	const navigate = useNavigate();
	const { likedSongs, likeSong, unlikeSong } = useUserStore();

	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className="mb-8">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
				<h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
				{showAll && (
					<Button
						variant="link"
						className="text-sm text-zinc-400 hover:text-white"
						onClick={() => navigate(showAll === true ? "/songs" : showAll)}
					>
						{showAllLabel || "Show all"}
					</Button>
				)}
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
				{songs.map((song) => {
					const isLiked = likedSongs.some((likedSong) => likedSong._id === song._id);
					return (
						<div
							key={song._id}
							className="bg-zinc-800/40 p-3 sm:p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer"
						>
							<div className="relative mb-3 sm:mb-4">
								<div className="aspect-square rounded-md shadow-lg overflow-hidden">
									<img
										src={song.imageUrl}
										alt={song.title}
										className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>
								<PlayButton song={song} />
								{/* add to queue button */}
								<button
									className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
									onClick={(e) => {
										e.stopPropagation();
										usePlayerStore.getState().addToQueue(song);
										toast("Added to queue");
									}}
								>
									<Plus className="h-4 w-4 text-white" />
								</button>
								{/* like button */}
								<button
									className="absolute top-2 left-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
									onClick={(e) => {
										e.stopPropagation();
										if (isLiked) {
											unlikeSong(song._id);
										} else {
											likeSong(song._id);
										}
									}}
								>
									<Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
								</button>
								{/* like button */}
								<button
									className="absolute top-2 left-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
									onClick={(e) => {
										e.stopPropagation();
										if (isLiked) unlikeSong(song._id);
										else likeSong(song._id);
									}}
								>
									<Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-red-500" : "text-white"}`} />
								</button>
							</div>
							<h3 className="font-medium mb-2 truncate">{song.title}</h3>
							<Link
								to={`/artists/${encodeURIComponent(song.artist)}`}
								className="text-sm text-zinc-400 truncate hover:text-white transition-colors"
							>
								{song.artist}
							</Link>
						</div>
					);
				})}
			</div>
		</div>
	);
};
export default SectionGrid;
