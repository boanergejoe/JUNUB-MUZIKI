import { useEffect, useState } from "react";
import { usePremiumStore } from "@/stores/usePremiumStore";
import { axiosInstance } from "@/lib/axios";
import { Download, Play } from "lucide-react";
import toast from "react-hot-toast";

interface PremiumSong {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	audioUrl: string;
	premiumTier: string;
}

const PremiumDashboard = () => {
	const { isPremium, checkPremiumStatus } = usePremiumStore();
	const [premiumSongs, setPremiumSongs] = useState<PremiumSong[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	useEffect(() => {
		checkPremiumStatus();
		fetchPremiumSongs();
	}, [checkPremiumStatus]);

	const fetchPremiumSongs = async () => {
		try {
			setIsLoading(true);
			const res = await axiosInstance.get("/songs/search?isPremium=true");
			setPremiumSongs(res.data);
		} catch (error) {
			console.error("Error fetching premium songs:", error);
			toast.error("Failed to load premium songs");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDownload = async (song: PremiumSong) => {
		if (!isPremium) {
			toast.error("You must be a premium user to download songs");
			return;
		}

		try {
			setDownloadingId(song._id);
			const response = await axiosInstance.get(`/songs/${song._id}/download`);
			const downloadUrl = response.data?.downloadUrl;

			if (!downloadUrl) {
				throw new Error("Download URL not available");
			}

			const link = document.createElement("a");
			link.href = downloadUrl;
			link.setAttribute("download", `${song.title}-${song.artist}.mp3`);
			document.body.appendChild(link);
			link.click();
			link.remove();

			toast.success(`Downloaded: ${song.title}`);
		} catch (error) {
			console.error("Error downloading song:", error);
			toast.error("Failed to download song");
		} finally {
			setDownloadingId(null);
		}
	};

	if (!isPremium) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
				<h1 className="text-3xl font-bold text-red-500 mb-4">Premium Access Required</h1>
				<p className="text-lg text-zinc-300 mb-6">You must be a premium user to access this dashboard.</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-900 text-white">
			<div className="max-w-6xl mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold text-green-400 mb-2">Welcome to Premium!</h1>
				<p className="text-lg text-zinc-300 mb-8">Enjoy unlimited music, exclusive features, and more.</p>

				{/* Premium Features */}
				<div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full mb-12">
					<h2 className="text-2xl font-bold text-white mb-6">Premium Features</h2>
					<ul className="space-y-4 grid grid-cols-1 md:grid-cols-2">
						<li className="text-xl text-white flex items-center gap-3">
							<span className="text-green-400">✓</span>
							Ad-free music listening
						</li>
						<li className="text-xl text-white flex items-center gap-3">
							<span className="text-green-400">✓</span>
							Download to listen offline
						</li>
						<li className="text-xl text-white flex items-center gap-3">
							<span className="text-green-400">✓</span>
							Play songs in any order
						</li>
						<li className="text-xl text-white flex items-center gap-3">
							<span className="text-green-400">✓</span>
							High audio quality
						</li>
						<li className="text-xl text-white flex items-center gap-3">
							<span className="text-green-400">✓</span>
							Unlimited skips
						</li>
						<li className="text-xl text-white flex items-center gap-3">
							<span className="text-green-400">✓</span>
							Exclusive premium content
						</li>
					</ul>
				</div>

				{/* Premium Songs */}
				<div>
					<h2 className="text-3xl font-bold text-white mb-6">Premium Songs & Albums</h2>
					{isLoading ? (
						<div className="text-center text-zinc-400">Loading premium content...</div>
					) : premiumSongs.length === 0 ? (
						<div className="text-center text-zinc-400">No premium songs available yet</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{premiumSongs.map((song) => (
								<div key={song._id} className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
									<img
										src={song.imageUrl}
										alt={song.title}
										className="w-full h-48 object-cover"
									/>
									<div className="p-4">
										<h3 className="text-xl font-bold text-white mb-2 truncate">{song.title}</h3>
										<p className="text-zinc-400 mb-4 truncate">{song.artist}</p>
										<div className="flex items-center justify-between mb-3">
											<span className="text-sm bg-purple-600 px-3 py-1 rounded-full text-white">
												{song.premiumTier}
											</span>
										</div>
										<div className="flex gap-2">
											<button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
												<Play className="h-4 w-4" />
												Play
											</button>
											<button
												onClick={() => handleDownload(song)}
												disabled={downloadingId === song._id}
												className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Download className="h-4 w-4" />
												{downloadingId === song._id ? "..." : "Download"}
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PremiumDashboard;
