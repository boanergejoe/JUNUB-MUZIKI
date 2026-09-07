import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface EditSongDialogProps {
	song: Song;
}

const genres = [
	"Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "Country", "R&B",
	"Reggae", "Blues", "Folk", "Indie", "Metal", "Punk", "Alternative", "Dance", "Soul", "Funk",
];

const EditSongDialog = ({ song }: EditSongDialogProps) => {
	const { albums, updateSong } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState({
		title: song.title,
		artist: song.artist,
		genre: "Pop",
		duration: String(song.duration),
		albumId: song.albumId || "none",
		isPremium: song.isPremium,
		premiumTier: song.premiumTier || "Featured",
	});

	useEffect(() => {
		if (!open) return;
		setForm({
			title: song.title,
			artist: song.artist,
			genre: "Pop",
			duration: String(song.duration),
			albumId: song.albumId || "none",
			isPremium: song.isPremium,
			premiumTier: song.premiumTier || "Featured",
		});
	}, [open, song]);

	const handleSave = async () => {
		if (!form.title.trim() || !form.artist.trim()) return;
		setIsSaving(true);
		try {
			await updateSong(song._id, {
				title: form.title.trim(),
				artist: form.artist.trim(),
				genre: form.genre,
				duration: Number(form.duration) || 0,
				albumId: form.albumId === "none" ? null : form.albumId,
				isPremium: form.isPremium,
				premiumTier: form.isPremium ? form.premiumTier : null,
			});
			setOpen(false);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button variant="ghost" size="sm" aria-label={`Edit ${song.title}`} onClick={() => setOpen(true)}>
				<Pencil className="size-4" />
			</Button>
			<DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-700 bg-zinc-900">
				<DialogHeader>
					<DialogTitle>Edit song</DialogTitle>
					<DialogDescription>Update the track details shown across Junub Muziki.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2">
					<label className="grid gap-2 text-sm font-medium">Title<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
					<label className="grid gap-2 text-sm font-medium">Artist<Input value={form.artist} onChange={(event) => setForm({ ...form, artist: event.target.value })} /></label>
					<div className="grid grid-cols-2 gap-3">
						<label className="grid gap-2 text-sm font-medium">Genre
							<Select value={form.genre} onValueChange={(genre) => setForm({ ...form, genre })}>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>{genres.map((genre) => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}</SelectContent>
							</Select>
						</label>
						<label className="grid gap-2 text-sm font-medium">Duration (seconds)<Input type="number" min="0" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></label>
					</div>
					<label className="grid gap-2 text-sm font-medium">Album
						<Select value={form.albumId} onValueChange={(albumId) => setForm({ ...form, albumId })}>
							<SelectTrigger><SelectValue placeholder="No album" /></SelectTrigger>
							<SelectContent><SelectItem value="none">No album</SelectItem>{albums.map((album) => <SelectItem key={album._id} value={album._id}>{album.title}</SelectItem>)}</SelectContent>
						</Select>
					</label>
					<div className="flex items-center justify-between rounded-lg border border-zinc-700 p-3">
						<div><p className="text-sm font-semibold">Premium item</p><p className="text-xs text-zinc-500">Show this track in the premium catalog.</p></div>
						<Switch checked={form.isPremium} onCheckedChange={(isPremium) => setForm({ ...form, isPremium })} />
					</div>
					{form.isPremium && <label className="grid gap-2 text-sm font-medium">Premium tier
						<Select value={form.premiumTier} onValueChange={(premiumTier) => setForm({ ...form, premiumTier })}>
							<SelectTrigger><SelectValue /></SelectTrigger>
							<SelectContent><SelectItem value="Featured">Featured</SelectItem><SelectItem value="Exclusive">Exclusive</SelectItem><SelectItem value="Top Premium">Top Premium</SelectItem></SelectContent>
						</Select>
					</label>}
				</div>
				<DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSaving || !form.title.trim() || !form.artist.trim()} className="bg-emerald-500 text-black hover:bg-emerald-400">{isSaving ? "Saving..." : "Save changes"}</Button></DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditSongDialog;
