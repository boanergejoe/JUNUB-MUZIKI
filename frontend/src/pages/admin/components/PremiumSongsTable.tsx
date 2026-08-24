import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Award } from "lucide-react";

const PremiumSongsTable = () => {
	const { songs, isLoading, error, updateSong, deleteSong } = useMusicStore();
	const premiumSongs = songs.filter((song) => song.isPremium);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading premium songs...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}

	if (!premiumSongs.length) {
		return (
			<div className='rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-8 text-center text-zinc-400'>
				<p className='text-white font-semibold mb-2'>No premium songs yet</p>
				<p>Add a premium song from the Songs tab or create a new track with premium status.</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Artist</TableHead>
					<TableHead>Tier</TableHead>
					<TableHead>Added</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{premiumSongs.map((song) => (
					<TableRow key={song._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{song.title}</TableCell>
						<TableCell>{song.artist}</TableCell>
						<TableCell>{song.premiumTier || "Premium"}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{song.createdAt.split("T")[0]}
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex flex-wrap gap-2 justify-end'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => updateSong(song._id, { isPremium: false, premiumTier: null })}
								>
									Remove Premium
								</Button>
								<Button
									variant='ghost'
									size='sm'
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
									onClick={() => deleteSong(song._id)}
								>
									<Award className='size-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default PremiumSongsTable;
