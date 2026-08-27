import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { HomeIcon, MessageCircle, Radio, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className='h-[100dvh] overflow-hidden bg-black text-white flex flex-col'>
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />
				{!isMobile && (
					<>
						<ResizablePanel id="left" order={1} defaultSize={20} minSize={10} maxSize={30} className="h-full min-h-0">
							<LeftSidebar />
						</ResizablePanel>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
					</>
				)}

				{/* Main content */}
				<ResizablePanel id="main" order={2} defaultSize={isMobile ? 100 : 60} className="h-full min-h-0">
					<Outlet />
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar */}
						<ResizablePanel id="right" order={3} defaultSize={20} minSize={0} maxSize={25} collapsedSize={0} className="h-full min-h-0">
							<FriendsActivity />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			<PlaybackControls />
			{isMobile && (
				<nav className='fixed bottom-20 left-0 right-0 z-20 grid grid-cols-5 border-t border-zinc-800 bg-zinc-950/95 px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] backdrop-blur-md'>
					{[
						{ to: "/", label: "Home", icon: HomeIcon },
						{ to: "/search", label: "Search", icon: Search },
						{ to: "/radio", label: "Radio", icon: Radio },
						{ to: "/chat", label: "Messages", icon: MessageCircle, signedIn: true },
						{ to: "/settings", label: "Settings", icon: Settings },
					].map(({ to, label, icon: Icon, signedIn }) => {
						const item = <Link key={to} to={to} className='flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] text-zinc-400 hover:text-white'><Icon className='size-5' /><span>{label}</span></Link>;
						return signedIn ? <SignedIn key={to}>{item}</SignedIn> : item;
					})}
				</nav>
			)}

		</div>
	);
};
export default MainLayout;
