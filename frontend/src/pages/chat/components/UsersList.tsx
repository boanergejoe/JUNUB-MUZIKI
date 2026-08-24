import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";

const UsersList = () => {
	const { users, selectedUser, isLoading, setSelectedUser, onlineUsers, unreadCounts } = useChatStore();

	return (
		<div className='h-full min-h-0 border-r border-zinc-800'>
			<div className='flex flex-col h-full'>
				<div className='sticky top-0 z-10 bg-zinc-900 p-4 border-b border-zinc-800'>
					<span className='font-semibold'>Contacts</span>
				</div>
				<ScrollArea className='min-h-0 flex-1 pt-4'>
					<div className='space-y-2 p-4'>
						{isLoading ? (
							<UsersListSkeleton />
						) : (
							users.map((user) => (
								<button
									key={user._id}
									onClick={() => setSelectedUser(user)}
									className={`flex items-center justify-center lg:justify-start gap-3 p-3
										rounded-lg cursor-pointer transition-colors w-full text-left
					${selectedUser?.clerkId === user.clerkId ? "bg-zinc-800" : "hover:bg-zinc-800/50"}`}
								>
									<div className='relative'>
										<Avatar className='size-8 md:size-12'>
											<AvatarImage src={user.imageUrl} />
											<AvatarFallback>{user.fullName[0]}</AvatarFallback>
										</Avatar>
										{/* online indicator */}
										<div
											className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-zinc-900
                        ${onlineUsers.has(user.clerkId) ? "bg-green-500" : "bg-zinc-500"}`}
										/>
									</div>

									<div className='flex-1 min-w-0 lg:block hidden'>
										<span className='font-medium truncate'>{user.fullName}</span>
										<span className={`ml-2 text-xs ${onlineUsers.has(user.clerkId) ? "text-green-500" : "text-zinc-500"}`}>
											{onlineUsers.has(user.clerkId) ? "Active" : "Offline"}
										</span>
									</div>
									{unreadCounts.get(user.clerkId) ? (
										<span className='ml-auto text-xs bg-red-500 text-white rounded-full px-2'>
											{unreadCounts.get(user.clerkId)}
										</span>
									) : null}
								</button>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default UsersList;
