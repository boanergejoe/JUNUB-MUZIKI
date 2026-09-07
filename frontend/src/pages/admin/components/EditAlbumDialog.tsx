import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import { Album } from "@/types";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

const genres = ["Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "Country", "R&B", "Reggae", "Blues", "Folk", "Indie", "Metal", "Punk", "Alternative", "Dance", "Soul", "Funk"];

const EditAlbumDialog = ({ album }: { album: Album }) => {
	const { updateAlbum } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [form, setForm] = useState({ title: album.title, artist: album.artist, genre: "Pop", releaseYear: String(album.releaseYear) });

	useEffect(() => {
		if (open) setForm({ title: album.title, artist: album.artist, genre: "Pop", releaseYear: String(album.releaseYear) });
	}, [open, album]);

	const handleSave = async () => {
		if (!form.title.trim() || !form.artist.trim()) return;
		setIsSaving(true);
		try {
			await updateAlbum(album._id, {
				title: form.title.trim(),
				artist: form.artist.trim(),
				genre: form.genre,
				releaseYear: Number(form.releaseYear) || new Date().getFullYear(),
			});
			setOpen(false);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button variant="ghost" size="sm" aria-label={`Edit ${album.title}`} onClick={() => setOpen(true)}><Pencil className="size-4" /></Button>
			<DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-700 bg-zinc-900">
				<DialogHeader><DialogTitle>Edit album</DialogTitle><DialogDescription>Update the album details shown across Junub Muziki.</DialogDescription></DialogHeader>
				<div className="grid gap-4 py-2">
					<label className="grid gap-2 text-sm font-medium">Album title<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
					<label className="grid gap-2 text-sm font-medium">Artist<Input value={form.artist} onChange={(event) => setForm({ ...form, artist: event.target.value })} /></label>
					<div className="grid grid-cols-2 gap-3">
						<label className="grid gap-2 text-sm font-medium">Genre<Select value={form.genre} onValueChange={(genre) => setForm({ ...form, genre })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{genres.map((genre) => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}</SelectContent></Select></label>
						<label className="grid gap-2 text-sm font-medium">Release year<Input type="number" min="1900" max={new Date().getFullYear()} value={form.releaseYear} onChange={(event) => setForm({ ...form, releaseYear: event.target.value })} /></label>
					</div>
				</div>
				<DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSaving || !form.title.trim() || !form.artist.trim()} className="bg-violet-500 text-white hover:bg-violet-400">{isSaving ? "Saving..." : "Save changes"}</Button></DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditAlbumDialog;
