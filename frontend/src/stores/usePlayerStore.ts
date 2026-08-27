import { create } from "zustand";
import toast from "react-hot-toast";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
import { usePremiumStore } from "./usePremiumStore";

// ensure the current user is logged in before allowing playback actions
const ensureLoggedIn = (): boolean => {
	const socket = useChatStore.getState().socket;
	if (!socket.auth) {
		toast.error("Login and listen to your favorite song");
		return false;
	}
	return true;
};

const canPlaySong = (song: Song): boolean => {
	if (song.isPremium && !usePremiumStore.getState().isPremium) {
		toast.error("Premium subscription required to play this song");
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
	recentlyPlayed: string[];

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
	recentlyPlayed: [],
	shuffle: false,
	repeat: "none",
	showQueue: false,

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
			recentlyPlayed: get().recentlyPlayed.filter((id) => songs.some((song) => song._id === id)),
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;
		if (!ensureLoggedIn()) return;

		const song = songs[startIndex];
		if (!song || !canPlaySong(song)) return;
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
			recentlyPlayed: [song._id, ...get().recentlyPlayed.filter((id) => id !== song._id)].slice(0, 50),
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;
		if (!ensureLoggedIn()) return;
		if (!canPlaySong(song)) return;

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
			recentlyPlayed: [song._id, ...get().recentlyPlayed.filter((id) => id !== song._id)].slice(0, 50),
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
		const { currentIndex, queue, shuffle, repeat, recentlyPlayed } = get();

		// if we are repeating one, just replay the same song
		if (repeat === "one") {
			const song = queue[currentIndex];
			if (song) {
				updateActivityPlaying(song);
				set({ isPlaying: true });
			}
			return;
		}

		const nextIndex = shuffle && queue.length > 1
			? queue
				.map((song, index) => ({ index, age: recentlyPlayed.indexOf(song._id) }))
				.filter(({ index }) => index !== currentIndex)
				.sort((left, right) => (right.age < 0 ? Infinity : right.age) - (left.age < 0 ? Infinity : left.age))
				.slice(0, Math.min(3, queue.length - 1))[Math.floor(Math.random() * Math.min(3, queue.length - 1))]?.index ?? currentIndex + 1
			: getNextIndex(currentIndex, queue.length, false);

		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];
			if (!canPlaySong(nextSong)) {
				set({ isPlaying: false });
				return;
			}
			updateActivityPlaying(nextSong);
			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
				recentlyPlayed: [nextSong._id, ...recentlyPlayed.filter((id) => id !== nextSong._id)].slice(0, 50),
			});
		} else if (repeat === "all" && queue.length > 0) {
			// wrap around
			const wrapIndex = getWrapIndex(shuffle, queue.length, true);
			const nextSong = queue[wrapIndex];
			if (!canPlaySong(nextSong)) {
				set({ isPlaying: false });
				return;
			}
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
			if (!canPlaySong(prevSong)) {
				set({ isPlaying: false });
				return;
			}
			updateActivityPlaying(prevSong);
			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else if (repeat === "all" && queue.length > 0) {
			const wrapIndex = getWrapIndex(shuffle, queue.length, false);
			const prevSong = queue[wrapIndex];
			if (!canPlaySong(prevSong)) {
				set({ isPlaying: false });
				return;
			}
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
