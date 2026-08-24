import Topbar from "@/components/Topbar";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import UsersList from "./components/UsersList";
import ChatHeader from "./components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageInput from "./components/MessageInput";

const formatTime = (date: string) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};
const ChatPage = () => {
	const { user } = useUser();
	const { messages, selectedUser, fetchUsers, fetchMessages, users, unreadCounts, setSelectedUser } = useChatStore();
	const [search, setSearch] = useState("");
	// ref to keep scroll pinned at bottom of conversation
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (user) fetchUsers();
	}, [fetchUsers, user]);

	useEffect(() => {
		if (selectedUser) fetchMessages(selectedUser.clerkId);
	}, [selectedUser, fetchMessages]);

	// show toast when a new incoming message arrives (even for active conversation)
	useEffect(() => {
		if (!user) return;
		if (messages.length === 0) return;
		const last = messages.at(-1);
		if (!last) return;
		// only consider messages not sent by current user
		if (last.senderId !== user.id) {
			const sender = users.find((u) => u.clerkId === last.senderId);
			const senderName = sender?.fullName || "someone";
			const isActive = selectedUser?.clerkId === last.senderId;
			toast(`New message from ${senderName}${isActive ? "" : " ( reply)"}`);
		}
	}, [messages, user, users, selectedUser]);

	// scroll to bottom when messages update or chat changes
	useEffect(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, selectedUser]);



	return (
		<main className='flex h-full min-h-0 flex-col rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 overflow-hidden relative'>
			<Topbar search={search} setSearch={setSearch} />

			{/* container switches to flex column on small screens and becomes a two-col grid at lg+ */}
			<div className='flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[300px_1fr]'>
				{/* mobile user carousel - horizontal avatars */}
				<div className='lg:hidden border-b border-zinc-800'>
					<ScrollArea className='overflow-x-auto py-2'>
						<div className='flex gap-4 px-4'>
							{users.map((u) => (
								<button
									key={u._id}
									onClick={() => setSelectedUser(u)}
									className={`relative flex-shrink-0 ${selectedUser?.clerkId === u.clerkId ? "ring-2 ring-white" : ""
										}`}
								>
									<Avatar className='size-8'>
										<AvatarImage src={u.imageUrl} />
										<AvatarFallback>{u.fullName[0]}</AvatarFallback>
									</Avatar>
									{unreadCounts.get(u.clerkId) ? (
										<span className='absolute top-0 right-0 text-[10px] bg-red-500 text-white rounded-full px-1'>
											{unreadCounts.get(u.clerkId)}
										</span>
									) : null}
								</button>
							))}
						</div>
					</ScrollArea>
				</div>

				{/* sidebar for larger screens */}
				<div className='hidden lg:block'>
					<UsersList />
				</div>

				{/* chat message */}
				<div className='flex flex-col flex-1'>
					{selectedUser ? (
						<>

							{/* Messages */}
							<ScrollArea className='min-h-0 flex-1 relative overflow-y-auto'>
								<div className='sticky top-0 z-10 bg-zinc-900'>
									<ChatHeader />
								</div>
								<div className='p-4 space-y-4 pt-0'>
									{messages.map((message) => (
										<div
											key={message._id}
											className={`flex items-start gap-3 ${message.senderId === user?.id ? "flex-row-reverse" : ""
												}`}
										>
											<Avatar className='size-8'>
												<AvatarImage
													src={
														message.senderId === user?.id
															? user.imageUrl
															: selectedUser.imageUrl
													}
												/>
											</Avatar>

											<div
												className={`rounded-lg p-3 max-w-[70%]
													${message.senderId === user?.id ? "bg-green-500" : "bg-zinc-800"}
												`}
											>
												<p className='text-sm'>{message.content}</p>
												<span className='text-xs text-zinc-300 mt-1 block'>
													{formatTime(message.createdAt)}
												</span>
											</div>
										</div>
									))}
									<div ref={bottomRef} />
								</div>
								{(unreadCounts.get(selectedUser?.clerkId) ?? 0) > 0 && (
									<div className='absolute bottom-20 right-4 z-10'>
										<button
											className='bg-red-500 text-white rounded-full px-3 py-1 shadow-lg flex items-center gap-2 animate-bounce'
											onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
										>
											<span className='font-bold'>{unreadCounts.get(selectedUser?.clerkId)}</span>
											<span>New</span>
										</button>
									</div>
								)}
							</ScrollArea>

							<MessageInput />
						</>
					) : (
						<NoConversationPlaceholder />
					)}
				</div>
			</div>
		</main>
	);
};
export default ChatPage;

const NoConversationPlaceholder = () => (
	<div className='flex flex-col items-center justify-center h-full space-y-6'>
		<img src='/Junub%20Muziki.png' alt='Junub Muziki' className='size-16 animate-bounce rounded-md object-cover' />
		<div className='text-center'>
			<h3 className='text-zinc-300 text-lg font-medium mb-1'>No conversation selected</h3>
			<p className='text-zinc-500 text-sm'>Choose a friend to start chatting</p>
		</div>
	</div>
);
