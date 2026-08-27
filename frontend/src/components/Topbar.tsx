
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { Home, LayoutDashboardIcon, Search, SlidersHorizontal, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = ({ search, setSearch }: { search: string; setSearch: (value: string) => void }) => {
	const { isAdmin } = useAuthStore();
	const { isLoaded, isSignedIn } = useAuth();
	return (
		<div className="sticky top-0 z-10 flex items-center gap-2 bg-black px-3 py-3 backdrop-blur-md sm:gap-3 sm:px-5">
			<Link to="/" aria-label="Junub Muziki home" className="hidden shrink-0 sm:block">
				<img src="/Junub%20Muziki.png" className="size-10 rounded-full object-cover" alt="Junub Muziki logo" />
			</Link>
			<Link to="/" aria-label="Home" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700">
				<Home className="size-5" />
			</Link>
			<div className="relative flex min-w-0 flex-1 items-center sm:max-w-[570px]">
				<Search className="absolute left-3 size-5 text-zinc-400" />
				<input
					type="text"
					placeholder="What do you want to play?"
					className="h-11 w-full rounded-full border border-transparent bg-zinc-800 pl-11 pr-11 text-sm text-white outline-none transition focus:border-zinc-500 focus:bg-zinc-700"
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<SlidersHorizontal className="absolute right-3 size-5 text-zinc-400" />
			</div>
			<div className="ml-auto flex items-center gap-3">
				<div className="hidden items-center gap-4 border-r border-zinc-700 pr-4 text-sm font-semibold text-zinc-300 lg:flex">
					<Link to="/premium" className="hover:text-white">Premium</Link>
					<Link to="/settings" className="hover:text-white">Support</Link>
					<Link to="/songs" className="hover:text-white">Download</Link>
				</div>
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
					<UserButton appearance={{ elements: { userButtonAvatarBox: "size-9" } }} />
				</SignedIn>
				{!isSignedIn && <UserRound className="hidden size-5 text-zinc-400 sm:block" />}
			</div>
		</div>
	);
};
export default Topbar;
