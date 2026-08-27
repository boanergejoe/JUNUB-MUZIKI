// UI primitives and hooks imported from shared component library
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// central Zustand store for player state/actions
import { usePlayerStore } from "@/stores/usePlayerStore";

// icons used in playback controls
import {
	Laptop2,
	ListMusic,
	Mic2,
	Pause,
	Play,
	Repeat,
	Repeat1,
	Shuffle,
	SkipBack,
	SkipForward,
	Volume1,
	Volume2,
	VolumeX,
} from "lucide-react";

// React hooks for lifecycle and refs
import { useEffect, useRef, useState } from "react";

// dialog components for displaying the queue
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// toast notifications for user feedback
import toast from "react-hot-toast";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	// destructure needed values and actions from player store
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious, shuffle, toggleShuffle, repeat, cycleRepeat, queue, showQueue, toggleQueue } = usePlayerStore();

	// local component state: volume slider, time/duration display
	const [volume, setVolume] = useState(75);
	const [previousVolume, setPreviousVolume] = useState(75);
	const [isMuted, setIsMuted] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	// ref holds <audio> element so we can inspect/seek it
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		const handleEnded = () => {
			usePlayerStore.getState().playNext();
		};

		audio.addEventListener("ended", handleEnded);

		// Media Session API for mobile/Android notification controls
		if ("mediaSession" in navigator && currentSong) {
			navigator.mediaSession.metadata = new globalThis.MediaMetadata({
				title: currentSong.title,
				artist: currentSong.artist,
				artwork: [
					{ src: currentSong.imageUrl, sizes: "512x512", type: "image/png" },
				],
			});
			navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
			navigator.mediaSession.setActionHandler("play", togglePlay);
			navigator.mediaSession.setActionHandler("pause", togglePlay);
			navigator.mediaSession.setActionHandler("nexttrack", playNext);
		}

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
			if ("mediaSession" in navigator) {
				navigator.mediaSession.setActionHandler("previoustrack", null);
				navigator.mediaSession.setActionHandler("play", null);
				navigator.mediaSession.setActionHandler("pause", null);
				navigator.mediaSession.setActionHandler("nexttrack", null);
			}
		};
	}, [currentSong, playNext, playPrevious, togglePlay]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = isMuted ? 0 : volume / 100;
		}
	}, [volume, isMuted]);

	// user clicked the shuffle icon; update store and toast accordingly
	const handleShuffleClick = () => {
		const newVal = !shuffle;
		toggleShuffle();
		// toast based on new state (not on mount or programmatic change)
		toast(newVal ? "Shuffle enabled" : "Shuffle disabled");
	};

	// user clicked the repeat icon; compute next label and update
	const handleRepeatClick = () => {
		let message = "";
		switch (repeat) {
			case "none":
				message = "Repeat all";
				break;
			case "all":
				message = "Repeat one";
				break;
			case "one":
				message = "Repeat off";
				break;
		}
		cycleRepeat();
		toast(message);
	};

	// handle volume mute/unmute
	const handleVolumeMuteClick = () => {
		if (isMuted) {
			setIsMuted(false);
			setVolume(previousVolume);
			if (audioRef.current) {
				audioRef.current.volume = previousVolume / 100;
			}
			toast("Unmuted");
		} else {
			setPreviousVolume(volume);
			setIsMuted(true);
			setVolume(0);
			if (audioRef.current) {
				audioRef.current.volume = 0;
			}
			toast("Muted");
		}
	};

	// handle volume slider change
	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		setVolume(newVolume);
		setIsMuted(newVolume === 0);
		if (newVolume > 0) {
			setPreviousVolume(newVolume);
		}
		if (audioRef.current) {
			audioRef.current.volume = newVolume / 100;
		}
	};

	const handleSeek = (value: number[]) => {
		if (!audioRef.current || !Number.isFinite(value[0])) return;
		audioRef.current.currentTime = value[0];
		setCurrentTime(value[0]);
	};

	return (
		<>
			{/** queue dialog */}
			<Dialog open={showQueue} onOpenChange={toggleQueue}>
				<DialogContent className='bg-zinc-900 border-zinc-800'>
					<DialogHeader>
						<DialogTitle>Upcoming songs</DialogTitle>
					</DialogHeader>
					<div className='space-y-2 max-h-[60vh] overflow-auto'>
						{queue.length === 0 ? (
							<p className='text-zinc-400'>Queue is empty</p>
						) : (
							queue.map((s) => (
								<button
									key={s._id}
									className='w-full text-left p-2 hover:bg-zinc-800 rounded cursor-pointer bg-transparent border-none text-inherit'
									onClick={() => {
										usePlayerStore.getState().setCurrentSong(s);
										setTimeout(toggleQueue, 0);
									}}
								>
									{s.title} - {s.artist}
								</button>
							))
						)}
					</div>
				</DialogContent>
			</Dialog>
			<footer className='h-20 shrink-0 border-t border-zinc-800 bg-zinc-900 px-2 pb-1 sm:h-24 sm:px-4'>
				<div className='mx-auto flex h-full max-w-[1800px] items-center gap-2 sm:gap-4'>
					{/* currently playing song */}
					<div className='flex min-w-0 w-[42%] items-center gap-2 sm:w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-md'
							/>
							<div className='flex-1 min-w-0'>
								<div className='font-medium truncate hover:underline cursor-pointer text-xs sm:text-sm'>
									{currentSong.title}
								</div>
								<div className='text-[10px] sm:text-xs text-zinc-400 truncate hover:underline cursor-pointer'>
									{currentSong.artist}
								</div>
							</div>
						</>
					)}
					</div>

					{/* player controls*/}
					<div className='flex w-auto min-w-0 flex-1 flex-col items-center gap-0 sm:w-[42%] sm:flex-none sm:gap-3'>
						{/* central controls area */}
						<div className='flex w-full items-center justify-center gap-1 sm:gap-4 lg:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className={`hidden text-zinc-400 sm:inline-flex ${shuffle ? "text-white" : "hover:text-white"}`}
							onClick={handleShuffleClick}
							title="Shuffle"
						>
							<Shuffle className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							title="Previous song"
						>
							<SkipBack className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0'
							onClick={togglePlay}
							title={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							title="Next song"
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className={`hidden text-zinc-400 sm:inline-flex ${repeat === 'none' ? 'hover:text-white' : 'text-white'}`}
							onClick={handleRepeatClick}
							title="Repeat"
						>
							{repeat === 'one' ? <Repeat1 className='h-4 w-4' /> : <Repeat className='h-4 w-4' />}
						</Button>
						<div className='flex w-full max-w-[560px] items-center gap-2 sm:rounded-full sm:border sm:border-zinc-800 sm:bg-zinc-950/90 sm:px-3 sm:py-1'>
							<span className='w-8 text-right text-[10px] text-zinc-400'>{formatTime(currentTime)}</span>
							<Slider value={[Math.min(currentTime, duration || 0)]} max={duration || 1} step={0.1} aria-label='Seek through song' className='flex-1' onValueChange={handleSeek} disabled={!currentSong || !duration} />
							<span className='w-8 text-[10px] text-zinc-400'>{formatTime(duration || currentSong?.duration || 0)}</span>
						</div>
					</div>

					</div>
					<div className='flex min-w-0 items-center justify-end gap-1 sm:w-[28%] sm:gap-3 lg:gap-4'>
						<Button size='icon' variant='ghost' className='hidden text-zinc-400 hover:text-white lg:inline-flex' onClick={() => {
							// microphone icon clicked (no toast)
						}} title="Voice control">
							<Mic2 className='h-4 w-4' />
						</Button>
						<Button size='icon' variant='ghost' className={`hover:text-white text-zinc-400 ${queue.length > 0 ? 'text-white' : ''}`} onClick={toggleQueue} title="Queue">
							<ListMusic className='h-4 w-4' />
						</Button>
						<Button size='icon' variant='ghost' className='hidden text-zinc-400 hover:text-white lg:inline-flex' onClick={() => {
							// future device selector support
						}} title="Devices">
							<Laptop2 className='h-4 w-4' />
						</Button>

						<div className='hidden items-center gap-1 sm:flex sm:gap-2'>
							<Button 
								size='icon' 
								variant='ghost' 
								className='hover:text-white text-zinc-400'
								onClick={handleVolumeMuteClick}
								title={isMuted ? 'Unmute' : 'Mute'}
							>
								{isMuted ? (
									<VolumeX className='h-4 w-4' />
								) : volume > 50 ? (
									<Volume1 className='h-4 w-4' />
								) : (
									<Volume2 className='h-4 w-4' />
								)}
							</Button>

							<Slider
								value={[volume]}
								max={100}
								step={1}
								className='w-12 sm:w-20 lg:w-24 hover:cursor-grab active:cursor-grabbing'
								onValueChange={handleVolumeChange}
							/>
						</div>
					</div>

				</div>
			</footer>
		</>
	);
};



