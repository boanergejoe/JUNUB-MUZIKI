import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import PremiumSongsTable from "./PremiumSongsTable";
import AddSongDialog from "./AddSongDialog";

const PremiumTabContent = () => {
	return (
		<Card className='bg-emerald-950/10 border-emerald-700/30'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Award className='h-5 w-5 text-emerald-500' />
							Premium Library
						</CardTitle>
						<CardDescription>Manage premium songs and premium-worthy items for your service.</CardDescription>
					</div>
					<AddSongDialog />
				</div>
			</CardHeader>

			<CardContent>
				<div className='space-y-6'>
					<div className='rounded-xl border border-emerald-500/20 bg-zinc-900/70 p-4 text-sm text-zinc-300'>
						<p className='font-semibold text-white'>Premium management</p>
						<p>
							Use this workspace to create high-quality tracks, label them as premium content, and deliver a fully curated premium experience to your listeners.
						</p>
					</div>
					<PremiumSongsTable />
				</div>
			</CardContent>
		</Card>
	);
};

export default PremiumTabContent;
