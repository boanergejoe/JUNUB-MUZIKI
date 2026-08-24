import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface NewSong {
	title: string;
	artist: string;
	album: string;
	genre: string;
	duration: string;
	isPremium: boolean;
	premiumTier: string;
}

const AddSongDialog = () => {
	const { albums } = useMusicStore();
	const [songDialogOpen, setSongDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const genres = [
		"Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic",
		"Country", "R&B", "Reggae", "Blues", "Folk", "Indie",
		"Metal", "Punk", "Alternative", "Dance", "Soul", "Funk"
	];

	const [newSong, setNewSong] = useState<NewSong>({
		title: "",
		artist: "",
		album: "",
		genre: "Pop",
		duration: "0",
		isPremium: false,
		premiumTier: "Featured",
	});

	const [files, setFiles] = useState<{ audio: File | null; image: File | null }>({
		audio: null,
		image: null,
	});

	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!files.audio || !files.image) {
				return toast.error("Please upload both audio and image files");
			}

			const formData = new FormData();

			formData.append("title", newSong.title);
			formData.append("artist", newSong.artist);
					formData.append("genre", newSong.genre);
			if (newSong.premiumTier) {
				formData.append("premiumTier", newSong.premiumTier);
			}
			if (newSong.album && newSong.album !== "none") {
				formData.append("albumId", newSong.album);
			}

			formData.append("audioFile", files.audio);
			formData.append("imageFile", files.image);

			await axiosInstance.post("/admin/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			// refresh the song list so user sees the new entry
			useMusicStore.getState().fetchSongs();

			setNewSong({
				title: "",
				artist: "",
				album: "",
				genre: "Pop",
				duration: "0",
				isPremium: false,
				premiumTier: "Featured",
			});

			setFiles({
				audio: null,
				image: null,
			});
			toast.success("Song added successfully");
		} catch (error: any) {
			if (error.response?.status === 401) {
				toast.error("Unauthorized. Please sign in as an admin.");
			} else {
				toast.error("Failed to add song: " + error.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-emerald-500 hover:bg-emerald-600 text-black'>
					<Plus className='mr-2 h-4 w-4' />
					Add Song
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Add New Song</DialogTitle>
					<DialogDescription>Add a new song to your music library</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						hidden
						aria-label='Audio file upload'
						onChange={(e) => setFiles((prev) => ({ ...prev, audio: e.target.files![0] }))}
					/>

					<input
						type='file'
						ref={imageInputRef}
						className='hidden'
						accept='image/*'
						aria-label='Image file upload'
						onChange={(e) => setFiles((prev) => ({ ...prev, image: e.target.files![0] }))}
					/>

					{/* image upload area */}
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => imageInputRef.current?.click()}
					>
						<div className='text-center'>
							{files.image ? (
								<div className='space-y-2'>
									<div className='text-sm text-emerald-500'>Image selected:</div>
									<div className='text-xs text-zinc-400'>{files.image.name.slice(0, 20)}</div>
								</div>
							) : (
								<>
									<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
										<Upload className='h-6 w-6 text-zinc-400' />
									</div>
									<div className='text-sm text-zinc-400 mb-2'>Upload artwork</div>
									<Button variant='outline' size='sm' className='text-xs'>
										Choose File
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Audio upload */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Audio File</label>
						<div className='flex items-center gap-2'>
							<Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
								{files.audio ? files.audio.name.slice(0, 20) : "Choose Audio File"}
							</Button>
						</div>
					</div>

					{/* other fields */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title</label>
						<Input
							value={newSong.title}
							onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={newSong.artist}
							onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Genre</label>
						<Select
							value={newSong.genre}
							onValueChange={(value) => setNewSong({ ...newSong, genre: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select genre' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								{genres.map((genre) => (
									<SelectItem key={genre} value={genre}>
										{genre}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<div className='flex items-center justify-between gap-4 rounded-lg border border-zinc-700 bg-zinc-900/90 p-4'>
							<div>
								<p className='text-sm font-semibold text-white'>Premium item</p>
								<p className='text-xs text-zinc-500'>Mark this track as premium to make it available in the premium catalog.</p>
							</div>
							<Switch
								checked={newSong.isPremium}
								onCheckedChange={(checked) => setNewSong({ ...newSong, isPremium: checked })}
							/>
						</div>

						{newSong.isPremium && (
							<div className='space-y-2'>
								<label className='text-sm font-medium'>Premium Tier</label>
								<Select
									value={newSong.premiumTier}
									onValueChange={(value) => setNewSong({ ...newSong, premiumTier: value })}
								>
									<SelectTrigger className='bg-zinc-800 border-zinc-700'>
										<SelectValue placeholder='Select tier' />
									</SelectTrigger>
									<SelectContent className='bg-zinc-800 border-zinc-700'>
										<SelectItem value='Featured'>Featured</SelectItem>
										<SelectItem value='Exclusive'>Exclusive</SelectItem>
										<SelectItem value='Top Premium'>Top Premium</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select
							value={newSong.album}
							onValueChange={(value) => setNewSong({ ...newSong, album: value })}
						>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setSongDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? "Uploading..." : "Add Song"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddSongDialog;
