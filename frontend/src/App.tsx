// NOTE: this demo covers core playback, playlists, likes and chat. remaining
// Spotify features such as podcasts, detailed artist/album pages,
// collaborative playlists, offline sync, social sharing, radio/recommendations
// and full Spotify Web API integration are not implemented and are left as
// future work per README.
// see https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import SongsPage from "./pages/songs/SongsPage";
import PlaylistsPage from "./pages/playlists/PlaylistsPage";
import PlaylistPage from "./pages/playlists/PlaylistPage";
import LikedSongsPage from "./pages/liked/LikedSongsPage";
import PremiumPage from "./pages/premium/PremiumPage";
import PaymentDetailsPage from "./pages/premium/PaymentDetailsPage";
import ArtistPage from "./pages/artist/ArtistPage";
import SearchPage from "./pages/search/SearchPage";
import SettingsPage from "./pages/settings/SettingsPage";
import RadioPage from "./pages/radio/RadioPage";
import PremiumDashboard from "./pages/premium/PremiumDashboard";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";

function App() {
	return (
		<>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				<Route path='/admin' element={<AdminPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/songs' element={<SongsPage />} />
					<Route path='/playlists' element={<PlaylistsPage />} />
					<Route path='/playlists/:playlistId' element={<PlaylistPage />} />
					<Route path='/liked' element={<LikedSongsPage />} />
					<Route path='/premium' element={<PremiumPage />} />
					<Route path='/premium/payment-details' element={<PaymentDetailsPage />} />
					<Route path='/premium/dashboard' element={<PremiumDashboard />} />
					<Route path='/artists/:artistName' element={<ArtistPage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/settings' element={<SettingsPage />} />
					<Route path='/radio' element={<RadioPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;
