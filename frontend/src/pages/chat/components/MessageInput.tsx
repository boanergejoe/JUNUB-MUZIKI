import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useUser } from "@clerk/clerk-react";
import { Send } from "lucide-react";
import { useState } from "react";

const MessageInput = () => {
	const [newMessage, setNewMessage] = useState("");
	const { user } = useUser();
	const { selectedUser, sendMessage } = useChatStore();

	const handleSend = () => {
		const message = newMessage.trim();
		if (!selectedUser || !user || !message) return;
		sendMessage(selectedUser.clerkId, user.id, message);
		setNewMessage("");
	};

	return (
		<div className='shrink-0 border-t border-zinc-800 bg-zinc-900 p-3 sm:p-4'>
			<form className='flex gap-2' onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
				<Input
					type='text'
					placeholder='Type a message'
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					className='min-w-0 bg-zinc-800 border-none'
				/>

				<Button type='submit' size={'icon'} aria-label='Send message' disabled={!newMessage.trim()}>
					<Send className='size-4' />
				</Button>
			</form>
		</div>
	);
};
export default MessageInput;
