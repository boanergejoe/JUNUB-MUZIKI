
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = ({ search, setSearch }: { search: string; setSearch: (value: string) => void }) => {
	const { isAdmin } = useAuthStore();
	const { isLoaded, isSignedIn } = useAuth();
	return (
		<div
			className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 sticky top-0 bg-zinc-900/90 backdrop-blur-md z-10"
		>
			<div className="flex gap-2 items-center">
				<img src="/Junub%20Muziki.png" className="size-8 rounded-md object-cover" alt="Junub Muziki logo" />
				<span className="font-semibold tracking-wide">Junub Muziki</span>
			</div>
			<div className="flex-1 flex items-center justify-center">
				<input
					type="text"
					placeholder="Search songs or artists..."
					className="w-full sm:w-96 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>
			<div className="flex items-center gap-4 justify-end">
				{isLoaded && isSignedIn && isAdmin && (
					<Link
						to="/admin/dashboard"
						aria-label="Open admin dashboard"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"h-10 shrink-0 border-zinc-600 bg-zinc-800 px-3 text-sm font-semibold text-white hover:border-emerald-400 hover:bg-zinc-700"
						)}
					>
						<LayoutDashboardIcon className="mr-2 size-4" />
						Admin Dashboard
					</Link>
				)}
				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>
				<SignedIn>
					<UserButton />
				</SignedIn>
			</div>
		</div>
	);
};
export default Topbar;
