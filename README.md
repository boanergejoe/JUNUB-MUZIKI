# Junub Muziki

Junub Muziki is a full-stack music streaming and social application. It provides a responsive desktop and mobile listening experience with ordered queues, playlists, search, Premium access, real-time chat, friends activity, and an admin catalog.

## Features

- Browse featured, trending, popular, radio, album, artist, and genre content.
- Search songs and artists with multi-word queries. Press Enter to submit a search.
- Use the search filter button to browse by genre.
- Play a collection with `Play all`; songs continue in the displayed order.
- Open a song from a collection and continue through the remaining songs in that collection.
- Control play/pause, next, previous, shuffle, repeat, volume, and the playback queue.
- Create playlists, add/remove songs, delete playlists, and play playlist songs in order.
- Like songs and access the Liked Songs collection.
- Browse Premium plans and access premium-only music after payment.
- Chat with other users and view online status and friends activity.
- Admins can create, edit, and delete songs and albums, including premium metadata.
- Responsive mobile navigation with Home, Search, Radio, Messages, Premium, and Settings.

## Project Structure

```text
backend/   Express API, MongoDB models, Clerk auth, Cloudinary, PesaPal, Socket.io
frontend/  React + TypeScript + Vite application
```

Important frontend areas:

- `frontend/src/pages` contains route pages.
- `frontend/src/components` contains shared UI.
- `frontend/src/layout` contains navigation, sidebars, and playback controls.
- `frontend/src/stores` contains Zustand state for music, playback, playlists, auth, chat, users, and Premium.

## Requirements

- Node.js 20 or newer
- MongoDB database
- Clerk application
- Cloudinary account for uploaded artwork and audio
- PesaPal credentials for Premium payments

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ADMIN_EMAIL=admin@example.com
NODE_ENV=development

CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret

# optional: comma-separated frontend origins allowed by CORS
FRONTEND_URL=https://junub-muziki-drq1.vercel.app
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# Backend origin (or full .../api URL). The deployed default is
# https://junub-muziki.vercel.app/api when this is omitted.
VITE_API_URL=https://junub-muziki.vercel.app
```

Do not commit real credentials. Use the same Clerk publishable key in both applications.

## Local Development

Install dependencies from the repository root:

```bash
npm install
npm run install
```

Start the backend and frontend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

The frontend runs on Vite's development port and the API runs on `http://localhost:5000`.

## Build and Production

Build the frontend:

```bash
npm run build --prefix frontend
```

Build the complete Render deployment from the repository root:

```bash
npm run build
npm start
```

The backend serves the built frontend in production and exposes `/health` for health checks. Configure the environment variables above in the hosting provider.

When the frontend and backend are deployed as **separate** Vercel projects, the frontend uses `VITE_API_URL` (default `https://junub-muziki.vercel.app/api`) for HTTP requests and the same origin for Socket.IO. The backend must allow the frontend origin via `FRONTEND_URL`/CORS. Redeploy both projects after changing these values.

## Seed Data

Run the seed scripts from the backend package:

```bash
npm run seed:albums --prefix backend
npm run seed:songs --prefix backend
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Home and featured music |
| `/songs` | Searchable song catalog |
| `/search?q=...` | Song and album search results |
| `/search?genre=...` | Genre-filtered songs |
| `/albums/:albumId` | Album details and ordered playback |
| `/artists/:artistName` | Artist songs |
| `/playlists` | User playlist library |
| `/playlists/:playlistId` | Playlist management and ordered playback |
| `/liked` | Liked Songs |
| `/radio` | Mood and genre radio discovery |
| `/premium` | Premium plans and payment entry |
| `/settings` | Account, notifications, privacy, quality, and taste settings |
| `/admin/dashboard` | Admin catalog, statistics, Premium songs, songs, and albums |

## Playback Behavior

Selecting `Play all` creates a queue in the same order as the visible collection. Selecting an individual card starts the queue at that song and continues forward through the remaining collection. Shuffle and repeat are separate playback controls; normal playback advances sequentially and stops at the end unless Repeat All is enabled.

Playback actions require authentication. Premium songs also require an active Premium subscription.

## Validation Commands

```bash
npm run build --prefix frontend
npm run lint --prefix frontend
```

The backend can be syntax-checked with Node's `--check` command when controller or route files change.

## Current Scope

The application intentionally does not implement Spotify's external Web API, podcast episodes, collaborative playlists, offline synchronization, cross-device playback, or mobile-native applications. These are future extensions, not required for the current Junub Muziki workflow.
