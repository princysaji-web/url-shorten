# Link Shortener (Phase 1)

Internal URL shortener and QR code generator built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- Email/password login via Supabase Auth
- Create short links with optional UTM parameters
- Server-side public redirects at `/{shortCode}`
- Click tracking (no raw IP storage)
- QR code preview and PNG download (generated client-side)
- Dashboard stats and link management (search, filter, enable/disable)

## Requirements

- Node.js 20+
- A Supabase project

## Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SHORT_LINK_DOMAIN=https://www.cs.net
```

`SUPABASE_SERVICE_ROLE_KEY` is used only on the server for public redirects and click inserts. Never put it in client code.

## Database setup

1. Open the Supabase SQL Editor (or use the Supabase CLI).
2. Run the migration in [`supabase/migrations/20260717100000_create_links_and_clicks.sql`](supabase/migrations/20260717100000_create_links_and_clicks.sql).
3. Create at least one Auth user (Authentication → Users → Add user) for login.

With the CLI:

```bash
npx supabase db push
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are sent to `/login`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

## Auth flow

1. User submits email/password on `/login`.
2. Supabase Auth sets a session cookie via `@supabase/ssr`.
3. Middleware refreshes the session and protects `/dashboard` and `/links/**`.
4. Logout clears the session and returns to `/login`.

## Short URL redirect flow

1. `GET /{shortCode}` hits [`app/[shortCode]/route.ts`](app/[shortCode]/route.ts).
2. Server validates the code shape and reserved names.
3. Service-role client looks up the link.
4. Inactive → `410`; missing → `404`.
5. Click row inserted (`user_agent`, `referer`).
6. Destination built with UTMs via `buildDestinationUrl`.
7. `302` redirect to the final URL.

## Manual test checklist

- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Authenticated user can create a link with and without UTMs
- [ ] Invalid destination URLs are rejected
- [ ] Short URL redirects and increments click count
- [ ] Disabled link returns 410
- [ ] Unknown short code returns 404
- [ ] Destination query params and hash are preserved
- [ ] QR preview and PNG download work
- [ ] Copy short URL works
- [ ] Service role key is not present in client bundles

## Phase 2 (not implemented)

Meeting links, HubSpot forms, campaign workflows, roles/admin, advanced analytics.
