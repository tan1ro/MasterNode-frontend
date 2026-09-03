# MasterNode Frontend

Next.js web app for [MasterNode.ai](https://masternode.in). Chat, pipeline runs, assistants, billing, and the marketing site — talking to the [MasterNode backend](https://github.com/tan1ro/MasterNode-backend) API.

Next.js 14 · React 18 · TypeScript · Tailwind · Auth.js

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in secrets
npm run dev                  # http://localhost:3000
```

Minimum local values in `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | FastAPI origin (`http://localhost:8000`) |
| `AUTH_SESSION_SECRET` | Signed session cookie (`openssl rand -base64 32`) |

The app probes `/health` on each origin in `NEXT_PUBLIC_API_URL` (comma-separated) and uses the first MasterNode FastAPI that responds. Browser calls go through `/api/backend` by default so the browser never hits CORS.

Run the API from the sibling repo: [MasterNode-backend](https://github.com/tan1ro/MasterNode-backend).

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run build:local` | Production build allowing localhost API |
| `npm start` | Serve production build |
| `npm test` | Vitest |
| `npm run typecheck` | `tsc --noEmit` |

Deployed on Vercel (`vercel.json`). Desktop installers under `public/downloads/` are gitignored; pack them from [MasterNode-desktop](https://github.com/tan1ro/MasterNode-desktop).

## License

Proprietary. Internal use for MasterNode unless a separate license is granted.
