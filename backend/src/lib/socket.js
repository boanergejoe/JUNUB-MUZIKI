import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:3000",
			credentials: true,
		},
	});

	const userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}
	const djRooms = new Map();

	io.on("connection", (socket) => {
		socket.on("dj_join", ({ roomId, userId }) => {
			if (!roomId || !userId) return;
			socket.join(`dj:${roomId}`);
			if (!djRooms.has(roomId)) djRooms.set(roomId, new Map());
			socket.emit("dj_state", Array.from(djRooms.get(roomId).values()));
		});

		socket.on("dj_add", ({ roomId, song, userId }) => {
			if (!roomId || !song?._id || !userId) return;
			const room = djRooms.get(roomId) || new Map();
			const item = room.get(song._id) || { song, votes: 0, voters: [], addedBy: userId };
			if (!item.voters.includes(userId)) item.voters.push(userId);
			item.votes = item.voters.length;
			room.set(song._id, item);
			djRooms.set(roomId, room);
			io.to(`dj:${roomId}`).emit("dj_state", Array.from(room.values()).sort((a, b) => b.votes - a.votes));
		});

		socket.on("dj_remove", ({ roomId, songId, userId }) => {
			const room = djRooms.get(roomId);
			const item = room?.get(songId);
			if (!room || !item || item.addedBy !== userId) return;
			room.delete(songId);
			io.to(`dj:${roomId}`).emit("dj_state", Array.from(room.values()).sort((a, b) => b.votes - a.votes));
		});

		socket.on("dj_vote", ({ roomId, songId, userId, direction }) => {
			const item = djRooms.get(roomId)?.get(songId);
			if (!item || !userId || ![-1, 1].includes(direction)) return;
			item.voters = item.voters.filter((id) => id !== userId);
			if (direction > 0) item.voters.push(userId);
			item.votes = item.voters.length;
			io.to(`dj:${roomId}`).emit("dj_state", Array.from(djRooms.get(roomId).values()).sort((a, b) => b.votes - a.votes));
		});
		socket.on("user_connected", (userId) => {
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			// broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			socket.emit("users_online", Array.from(userSockets.keys()));

			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("send_message", async (data) => {
			try {
				const { senderId, receiverId, content } = data;

				const message = await Message.create({
					senderId,
					receiverId,
					content,
				});

				// send to receiver in realtime, if they're online
				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			let disconnectedUserId;
			for (const [userId, socketId] of userSockets.entries()) {
				// find disconnected user
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				io.emit("user_disconnected", disconnectedUserId);
			}
		});
	});
};
