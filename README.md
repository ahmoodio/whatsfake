# WhatsFake — Deploy Guide

This repo contains:
- `client/` — React + Vite SPA for the UI.
- `server/` — Node.js + Express + Socket.IO backend with simple file uploads.

The recommended setup is: host the frontend on Vercel, and the backend on a Node host such as Render/Railway/Fly. Vercel is excellent for static frontends but not suited for long‑lived WebSocket servers and persistent file storage.

## Local Development
- Server
  - `cd server && npm install && node index.js`
  - Server listens on `http://localhost:3000` (or `PORT`).
- Client
  - `cd client && npm install && npm run dev`
  - Create `client/.env` with `VITE_API_URL=http://localhost:3000`.

## Frontend on Vercel
This repo includes `vercel.json` so Vercel knows how to build and route the SPA.
- Build command: `npm run build` (at repo root; it builds `client/`).
- Output directory: `client/dist`.
- SPA routing: static assets are served first; all other routes fall back to `index.html`.

Steps
1) Push to GitHub (see “Git commands” below).
2) In Vercel → New Project → Import your repo → Root directory is the repo root.
3) Verify settings (derived from `vercel.json`):
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
4) Add Environment Variable in Vercel → Project → Settings → Environment Variables:
   - `VITE_API_URL` = your backend URL (e.g., `https://whatsfake-server.onrender.com`).
5) Deploy (or re‑deploy after changes).

## Backend on Render (recommended)
Use the provided `render.yaml` for one‑click setup, or create a service manually.

Option A — One‑click IaC (render.yaml)
- Connect your GitHub repo in Render.
- New → Blueprint → select this repo → Render reads `render.yaml` and creates a Web Service:
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node index.js`
  - Disk mounted at `server/uploads` so files persist restarts.
- After the first deploy, copy the public URL and (optionally) set `PUBLIC_BASE_URL` to that value in the service’s environment (the server also derives it from the request+proxy).

Option B — Manual service
- New → Web Service → Select repo.
- Root Directory: `server`
- Environment: Node
- Build Command: `npm install`
- Start Command: `node index.js`
- Add a Disk: mount to `/opt/render/project/src/server/uploads` (1–2 GB is fine for testing).
- Optional env vars:
  - `PUBLIC_BASE_URL` = public URL of your service (helps when generating upload URLs behind proxies).
  - Later you can restrict CORS by adjusting the server or setting `CORS_ORIGIN` and wiring it up.

## Configure the Client → Server URL
- In Vercel: set `VITE_API_URL` to your server URL.
- Locally: `client/.env` with `VITE_API_URL=http://localhost:3000`.

## Git Commands (push to GitHub)
From the repo root:
```
# if not already a git repo
git init

# ensure build and uploads aren’t tracked
git rm -r --cached client/dist server/uploads || true

git add -A
git commit -m "Deployment: Vercel SPA routing + server deploy docs"

git branch -M main
git remote add origin https://github.com/<your-username>/whatsfake.git
# or set to your existing origin if already connected
git push -u origin main
```

## Verify After Deploy
- Open your Vercel URL and check DevTools → Network:
  - `/assets/*.js` and `.css` load with 200.
  - API calls and Socket.IO connect to `VITE_API_URL`.
- File upload returns a URL under your server’s domain (not localhost).

## Troubleshooting
- Blank page on Vercel: confirm `vercel.json` exists and routes include `{ handle: "filesystem" }` before SPA fallback.
- 404 on assets: ensure Output Directory is `client/dist` and Vercel didn’t override build settings.
- Socket not connecting: check that your server host allows WebSockets (Render does) and that `VITE_API_URL` matches exact scheme+host.
- Uploads missing after deploy: make sure a persistent disk is attached at `server/uploads`.

## Files of Interest
- `vercel.json` — build and SPA routing for Vercel.
- `server/index.js` — Express + Socket.IO backend; derives `PUBLIC_BASE_URL` or uses request host for upload URLs; uses `process.env.PORT`.
- `render.yaml` — Render Blueprint to provision the Node server and a persistent disk for uploads.

