# LinkMe Frontend

Next.js 15 + React 19 + TypeScript frontend for the LinkMe creator platform.

Companion backend: [link-me-backend](../link-me-backend) (Express API on port 4000).

## Layout

```
link-me-frontend/
├── src/
│   ├── app/           # Next.js App Router (51 routes)
│   ├── components/    # UI components
│   ├── views/         # Page-level views
│   ├── stores/        # Zustand stores
│   └── lib/           # API client, sockets, hooks
├── packages/shared/   # @link-me/shared (DTOs + Zod schemas)
├── public/
└── next.config.ts     # API rewrites to backend
```

## Prerequisites

- Node.js 20+
- [link-me-backend](../link-me-backend) running on port 4000

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev    # http://localhost:3000
```

In a separate terminal, start the backend:

```bash
cd ../link-me-backend
docker compose up -d
npm install && npm run dev
```

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Local dev | Production |
|----------|-----------|------------|
| `API_URL` | `http://localhost:4000` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | `/api` | `/api` or full API URL |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:4000` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | Same |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Same |
| `NEXT_PUBLIC_AGORA_APP_ID` | Agora app ID | Same |

### How API routing works

- **Development:** Browser calls `/api/*` → Next.js rewrites to `API_URL/api/v1/*` (backend).
- **Production:** Set `API_URL` to your backend origin; keep `NEXT_PUBLIC_API_URL=/api` if using Next.js rewrites on the same deployment, or point it directly at the API.
- **WebSockets:** Connect directly to `NEXT_PUBLIC_SOCKET_URL` (backend origin).

Ensure the backend `CORS_ORIGIN` includes your frontend URL.

## Scripts

```bash
npm run dev          # Fast Turbopack dev (PWA disabled)
npm run dev:pwa      # Webpack dev with PWA install / service worker
npm run preview:pwa  # Production build + start (closest to Vercel PWA)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # oxlint
```

## Stack

- Next.js 15 (App Router, Turbopack in dev)
- React 19, TypeScript 6
- Tailwind CSS 4, shadcn/ui
- Zustand, TanStack React Query
- Socket.IO client (chat, calls, live)
- Serwist PWA (production, or locally via `npm run dev:pwa` / `npm run preview:pwa`)
