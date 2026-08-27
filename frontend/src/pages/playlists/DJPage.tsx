import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { ArrowDown, ArrowUp, Headphones, Play, Trash2 } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";

type DJItem = { song: Song; votes: number; voters: string[]; addedBy: string };

const DJPage = () => {
	const { userId } = useAuth();
	const { socket } = useChatStore();
	const { songs, fetchSongs } = useMusicStore();
	const { playAlbum } = usePlayerStore();
	const [queue, setQueue] = useState<DJItem[]>([]);
	const [roomId] = useState("main-stage");

	useEffect(() => {
		fetchSongs("*");
		if (!userId || !socket) return;
		socket.emit("dj_join", { roomId, userId });
		const update = (items: DJItem[]) => setQueue(items);
		socket.on("dj_state", update);
		return () => socket.off("dj_state", update);
	}, [fetchSongs, roomId, socket, userId]);

	const addSong = (song: Song) => socket?.emit("dj_add", { roomId, song, userId });
	const removeSong = (songId: string) => socket?.emit("dj_remove", { roomId, songId, userId });
	const vote = (songId: string, direction: 1 | -1) => socket?.emit("dj_vote", { roomId, songId, userId, direction });

	return (
		<div className="h-full min-h-0 overflow-hidden bg-gradient-to-b from-zinc-900 to-black p-4 text-white sm:p-8">
			<div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col gap-6">
				<header className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-6">
					<div className="flex items-center gap-3"><Headphones className="text-emerald-400" /><p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Collaborative DJ</p></div>
					<h1 className="mt-2 text-3xl font-bold">Build the next set together</h1>
					<p className="mt-2 text-zinc-300">Everyone in the room can add a track and vote the queue into shape.</p>
				</header>
				<section className="-mb-8 grid min-h-0 flex-1 items-stretch gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="flex min-h-0 h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
						<h2 className="mb-4 text-xl font-semibold">Room queue</h2>
						<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#10b981_#27272a] [scrollbar-width:thin]"><div className="space-y-3">{queue.length === 0 && <p className="text-zinc-500">Add the first track to start the room.</p>}{queue.map((item) => <div key={item.song._id} className="flex items-center gap-3 rounded-xl bg-zinc-800 p-3"><img src={item.song.imageUrl} alt="" className="size-12 rounded object-cover" /><div className="min-w-0 flex-1"><p className="break-words font-medium">{item.song.title}</p><p className="break-words text-sm text-zinc-400">{item.song.artist} · {item.votes} votes</p></div><Button size="icon" variant="ghost" onClick={() => vote(item.song._id, 1)} aria-label="Upvote"><ArrowUp /></Button><Button size="icon" variant="ghost" onClick={() => vote(item.song._id, -1)} aria-label="Downvote"><ArrowDown /></Button><Button size="icon" onClick={() => playAlbum(queue.map((entry) => entry.song), queue.findIndex((entry) => entry.song._id === item.song._id))} aria-label="Play"><Play /></Button>{item.addedBy === userId && <Button size="icon" variant="ghost" onClick={() => removeSong(item.song._id)} aria-label="Remove from room"><Trash2 /></Button>}</div>)}</div></div>
					</div>
					<div className="flex min-h-0 h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="mb-4 text-xl font-semibold">Add a track</h2><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#10b981_#27272a] [scrollbar-width:thin]"><div className="space-y-2">{songs.slice(0, 12).map((song) => <button key={song._id} onClick={() => addSong(song)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-800"><img src={song.imageUrl} alt="" className="size-10 shrink-0 rounded object-cover" /><span className="min-w-0 flex-1 break-words text-left">{song.title}<small className="block break-words text-zinc-500">{song.artist}</small></span><span className="text-emerald-400">+</span></button>)}</div></div></div>
				</section>
			</div>
		</div>
	);
};

export default DJPage;