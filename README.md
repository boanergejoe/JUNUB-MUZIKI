<h1 align="center">Junub Muziki</h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

[Watch Full Tutorial on Youtube](https://youtu.be/4sbklcQ0EXc)

About This Course:

-   🎸 Listen to music, play next and previous songs
-   🔈 Update the volume with a slider
-   🎧 Admin dashboard to create albums and songs
-   💬 Real-time Chat App integrated into Spotify
-   👨🏼‍💼 Online/Offline status
-   👀 See what other users are listening to in real-time
-   📊 Aggregate data for the analytics page
-   🚀 And a lot more...

### Setup .env file in _backend_ folder

```bash
PORT=...
MONGODB_URI=...
ADMIN_EMAIL=...
NODE_ENV=...

CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_CLOUD_NAME=...


CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

PESAPAL_CONSUMER_KEY=...
PESAPAL_CONSUMER_SECRET=...
```

### Setup .env file in _frontend_ folder

```bash
VITE_CLERK_PUBLISHABLE_KEY=...
```

### Render deployment

Create one Render Web Service from the repository root. Use `npm install && npm run build` as the build command and `npm start` as the start command. Add the backend variables above in Render's environment settings, including `PORT` (Render supplies this automatically) and `MONGODB_URI`. The backend serves the built frontend in production and exposes `/health` for health checks.

---

### 🚗 Quick Navigation
- **/playlists** – create and manage your personal playlists.
- **/liked** – view and play your Liked Songs collection.
- **/songs** – browse the catalog and use the search box; the server-side search mirrors Spotify's Search API (see comments in `song.controller.js`).

### ⚠️ Remaining Spotify Features (Future Work)
This clone implements the core music, playlists, and social features used in the tutorial, but many of Spotify’s capabilities are still missing:

- Podcasts & episodes
- Artist/album/detail pages with discographies
- Collaborative playlists and following other users
- Offline sync / caching
- Rich social sharing (links, stories)
- “Radio” stations and recommendation engines
- Full Spotify Web API integration (currently comments reference the API but no tokens/requests)
- Mobile apps, playback across devices, and more

The list above matches the original roadmap; these items require significant backend and frontend work. They are intentionally left as future enhancements rather than part of this exercise.

For reference, the Spotify Web API endpoint used for playlists is documented here:
https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists

Continue adding comments in code whenever you implement Spotify‑like behavior so you know where real API calls would go.

