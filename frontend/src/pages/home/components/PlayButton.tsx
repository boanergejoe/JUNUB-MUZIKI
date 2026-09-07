import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { Pause, Play } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const PlayButton = ({ song, queue }: { song: Song; queue?: Song[] }) => {
	const { currentSong, isPlaying, playAlbum, setCurrentSong, togglePlay } = usePlayerStore();
	const { user, isLoaded } = useUser();
	const isLoggedIn = isLoaded && !!user;
	const isCurrentSong = currentSong?._id === song._id;

	const handlePlay = () => {
		if (!isLoggedIn) {
			toast.error("Login and listen to your favorite song");
			return;
		}
		if (isCurrentSong) togglePlay();
		else if (queue?.length) playAlbum(queue, Math.max(0, queue.findIndex((queuedSong) => queuedSong._id === song._id)));
		else setCurrentSong(song);
	};

	return (
		<Button
			size={"icon"}
			onClick={handlePlay}
			className={`absolute bottom-3 right-2 bg-green-500 hover:bg-green-400 hover:scale-105 transition-all 
				opacity-0 translate-y-2 group-hover:translate-y-0 ${isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100"
				}`}
		>
			{isCurrentSong && isPlaying ? (
				<Pause className='size-5 text-black' />
			) : (
				<Play className='size-5 text-black' />
			)}
		</Button>
	);
};
export default PlayButton;
