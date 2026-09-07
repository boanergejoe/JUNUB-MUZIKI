export interface Song {
	_id: string;
	title: string;
	artist: string;
	genre: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	likesCount: number;
	isPremium: boolean;
	premiumTier?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	genre: string;
	songs: Song[];
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
}

export interface Playlist {
	_id: string;
	title: string;
	userId: string;
	songs: Song[];
	createdAt: string;
	updatedAt: string;
}
