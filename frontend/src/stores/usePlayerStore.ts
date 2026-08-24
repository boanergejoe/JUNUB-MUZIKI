import { create } from "zustand";
import toast from "react-hot-toast";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";

// ensure the current user is logged in before allowing playback actions
const ensureLoggedIn = (): boolean => {
	const socket = useChatStore.getState().socket;
	if (!socket.auth) {
		toast.error("Login and listen to your favorite song");
		return false;
	}
	return true;
};

const updateActivityPlaying = (song: Song): void => {
	const socket = useChatStore.getState().socket;
	if (socket.auth) {
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: `Playing ${song.title} by ${song.artist}`,
		});
	}
};

const updateActivityIdle = (): void => {
	const socket = useChatStore.getState().socket;
	if (socket.auth) {
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: `Idle`,
		});
	}
};

const getNextIndex = (currentIndex: number, queueLength: number, shuffle: boolean): number => {
	let nextIndex = currentIndex + 1;
	if (shuffle && queueLength > 1) {
		do {
			nextIndex = Math.floor(Math.random() * queueLength);
		} while (nextIndex === currentIndex);
	}
	return nextIndex;
};

const getPrevIndex = (currentIndex: number, queueLength: number, shuffle: boolean): number => {
	let prevIndex = currentIndex - 1;
	if (shuffle && queueLength > 1) {
		do {
			prevIndex = Math.floor(Math.random() * queueLength);
		} while (prevIndex === currentIndex);
	}
	return prevIndex;
};

const getWrapIndex = (shuffle: boolean, queueLength: number, isNext: boolean = true): number => {
	if (shuffle) {
		return Math.floor(Math.random() * queueLength);
	}
	return isNext ? 0 : queueLength - 1;
};


interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;

	// new UI states
	shuffle: boolean;
	repeat: "none" | "one" | "all";
	showQueue: boolean;

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;

	// new actions
	toggleShuffle: () => void;
	cycleRepeat: () => void;
	addToQueue: (song: Song) => void;
	toggleQueue: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	shuffle: false,
	repeat: "none",
	showQueue: false,

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;
		if (!ensureLoggedIn()) return;

		const song = songs[startIndex];
		const socket = useChatStore.getState().socket;
		// update activity since user is authenticated
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: `Playing ${song.title} by ${song.artist}`,
		});
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;
		if (!ensureLoggedIn()) return;

		const socket = useChatStore.getState().socket;
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: `Playing ${song.title} by ${song.artist}`,
		});

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex >= 0 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		if (!ensureLoggedIn()) return;
		const willStartPlaying = !get().isPlaying;

		const currentSong = get().currentSong;
		const socket = useChatStore.getState().socket;
		// update activity (user must be authenticated)
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity:
				willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : "Idle",
		});

		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		if (!ensureLoggedIn()) return;
		const { currentIndex, queue, shuffle, repeat } = get();

		// if we are repeating one, just replay the same song
		if (repeat === "one") {
			const song = queue[currentIndex];
			if (song) {
				updateActivityPlaying(song);
				set({ isPlaying: true });
			}
			return;
		}

		const nextIndex = getNextIndex(currentIndex, queue.length, shuffle);

		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];
			updateActivityPlaying(nextSong);
			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else if (repeat === "all" && queue.length > 0) {
			// wrap around
			const wrapIndex = getWrapIndex(shuffle, queue.length, true);
			const nextSong = queue[wrapIndex];
			updateActivityPlaying(nextSong);
			set({
				currentSong: nextSong,
				currentIndex: wrapIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
			updateActivityIdle();
		}
	},
	playPrevious: () => {
		if (!ensureLoggedIn()) return;
		const { currentIndex, queue, shuffle, repeat } = get();

		if (repeat === "one") {
			const song = queue[currentIndex];
			if (song) set({ isPlaying: true });
			return;
		}

		const prevIndex = getPrevIndex(currentIndex, queue.length, shuffle);

		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];
			updateActivityPlaying(prevSong);
			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else if (repeat === "all" && queue.length > 0) {
			const wrapIndex = getWrapIndex(shuffle, queue.length, false);
			const prevSong = queue[wrapIndex];
			updateActivityPlaying(prevSong);
			set({
				currentSong: prevSong,
				currentIndex: wrapIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
			updateActivityIdle();
		}
	},
	toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
	cycleRepeat: () =>
		set((state) => {
			let nextRepeat: "none" | "one" | "all";
			if (state.repeat === "none") {
				nextRepeat = "all";
			} else if (state.repeat === "all") {
				nextRepeat = "one";
			} else {
				nextRepeat = "none";
			}
			return { repeat: nextRepeat };
		}),
	addToQueue: (song: Song) =>
		set((state) => ({ queue: [...state.queue, song] })),
	toggleQueue: () => set((state) => ({ showQueue: !state.showQueue })),
}));
