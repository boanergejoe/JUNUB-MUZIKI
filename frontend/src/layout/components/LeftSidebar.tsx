import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore"; // show user playlists in sidebar
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle, Plus, Settings, Radio } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
	const { fetchAlbums, isLoading } = useMusicStore();
	const { playlists, fetchPlaylists } = usePlaylistStore();
	// note: albums still fetched for album pages, playlists fetched separately for user library
	const { unreadCounts } = useChatStore();
	let totalUnread = Array.from(unreadCounts.values()).reduce((sum, v) => sum + v, 0);
	if (totalUnread > 99) totalUnread = 99; // cap for display


	useEffect(() => {
		fetchAlbums();
		fetchPlaylists(); // load playlists for sidebar
	}, [fetchAlbums, fetchPlaylists]);



	return (
		<div className='flex h-full min-h-0 flex-col gap-2'>
			{/* Navigation menu */}

			<div className='rounded-lg bg-zinc-900 p-4'>
				<div className='space-y-2'>
					<Link
						to="/"
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Home</span>
					</Link>

					<Link
						to="/premium"
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<Library className='mr-2 size-5' />
						<span className='hidden md:inline'>Premium</span>
					</Link>

					<Link
						to="/settings"
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<Settings className='mr-2 size-5' />
						<span className='hidden md:inline'>Settings</span>
					</Link>

					<Link
						to="/radio"
						className={cn(
							buttonVariants({
								variant: "ghost",
								className: "w-full justify-start text-white hover:bg-zinc-800",
							})
						)}
					>
						<Radio className='mr-2 size-5' />
						<span className='hidden md:inline'>Radio</span>
					</Link>

					<SignedIn>
						<Link
							to="/chat"
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-start text-white hover:bg-zinc-800 relative",
								})
							)}
						>
							<MessageCircle className='mr-2 size-5' />
							<span className='hidden md:inline'>Messages</span>
							{totalUnread > 0 && (
								<span className='absolute top-0 right-0 -mt-1 -mr-2 inline-flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full w-4 sm:w-5 h-4 sm:h-5'>
									{totalUnread}
								</span>
							)}
						</Link>
					</SignedIn>
				</div>
			</div>

			{/* Library section */}
			<div className='flex min-h-0 flex-1 flex-col rounded-lg bg-zinc-900 p-3'>
				<div className='mb-3 flex items-center justify-between px-2'>
					<div className='flex items-center text-white'>
						<Library className='size-5 mr-2' />
						<span className='font-semibold'>Your Library</span>
					</div>
					<Link to='/playlists' aria-label='Create playlist' className='flex size-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'>
						<Plus className='size-5' />
					</Link>
				</div>

				{/* quick links: liked songs and all songs */}
				<ScrollArea className='library-scrollbar flex-1'>
					<div className='space-y-3 pr-3'>
						{/* Quick links section */}
						<div className='space-y-2 rounded-lg bg-zinc-800/70 p-4'>
							<p className='font-semibold text-white'>Create your first playlist</p>
							<p className='mt-2 text-sm text-zinc-300'>It's easy, we'll help you</p>
							<Link to='/playlists' className='mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200'>Create playlist</Link>
						</div>
						<div className='space-y-2 rounded-lg bg-zinc-800/70 p-4'>
							<p className='font-semibold text-white'>Let's find some podcasts to follow</p>
							<p className='mt-2 text-sm text-zinc-300'>We'll keep you updated on new episodes</p>
							<Link to='/radio' className='mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200'>Browse podcasts</Link>
						</div>
						<div className='space-y-2'>
							<Link 
								to='/liked' 
								className='text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 block p-2 rounded-md transition'
								title='Your liked songs collection'
							>
								♥ Liked Songs
							</Link>
							<Link 
								to='/songs' 
								className='text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 block p-2 rounded-md transition'
								title='Browse all available songs'
							>
								🎵 All Songs
							</Link>
						</div>

						{/* Playlists section */}
						{playlists.length > 0 && (
							<div>
								<p className='text-xs font-semibold text-zinc-400 px-2 uppercase tracking-wider mb-2'>Your Playlists</p>
								<div className='space-y-2'>
									{isLoading ? (
										<PlaylistSkeleton />
									) : (
										playlists.map((pl) => (
											<Link
												to={`/playlists/${pl._id}`}
												key={pl._id}
												className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer transition'
												title={`${pl.title} - ${pl.songs.length} songs`}
											>
												{/* playlist cover: show first song image if we have it */}
												<img
													src={pl.songs?.[0]?.imageUrl || ""}
													alt='Playlist img'
													className='size-12 rounded-md flex-shrink-0 object-cover'
												/>

												<div className='flex-1 min-w-0 hidden md:block'>
													<p className='font-medium truncate text-white'>{pl.title}</p>
													<p className='text-xs text-zinc-400 truncate'>{pl.songs.length} songs</p>
												</div>
											</Link>
										))
									)}
								</div>
							</div>
						)}

						{/* Empty state */}
						{!isLoading && playlists.length === 0 && (
							<div className='text-center py-6'>
								<p className='text-sm text-zinc-400'>No playlists yet</p>
								<Link 
									to='/playlists' 
									className='text-xs text-[#1db954] hover:text-[#1ed760] mt-2 inline-block'
								>
									Create one
								</Link>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;
