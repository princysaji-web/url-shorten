# Link Shortener (Phase 1)

Internal URL shortener and QR code generator built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- Email/password login via Supabase Auth
- Organizations (e.g. CareStack, VoiceStack) with shared link data
- Roles: `admin` (add/manage members) and `member` (view/create/edit org links)
- Admins add members in the UI (no invite email); new users set their own password via a shared setup link
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

`SUPABASE_SERVICE_ROLE_KEY` is used only on the server for public redirects, click inserts, and sending invites. Never put it in client code.

`NEXT_PUBLIC_SHORT_LINK_DOMAIN` is the public app origin for short URLs and member password-setup redirects.

### Supabase Auth URL settings

Member setup links are app-owned (`/auth/callback?token_hash=…`) and no longer use
`supabase.co/auth/v1/verify`, so **Site URL localhost does not affect them**.

Still set **Site URL** to `NEXT_PUBLIC_SHORT_LINK_DOMAIN` in Supabase for other auth emails.

## Database setup

1. Open the Supabase SQL Editor (or use the Supabase CLI).
2. Run migrations in order under [`supabase/migrations/`](supabase/migrations/), including organizations:
   - `20260717100000_create_links_and_clicks.sql`
   - `20260717110000_short_code_generation.sql`
   - `20260720120000_organizations.sql`
3. The organizations migration seeds a **CareStack** org, attaches existing users as admins, and assigns existing links to it.

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

## Auth + organization flow

1. User signs in on `/login`.
2. Links and dashboard stats are scoped to the **active organization** (cookie `active_org_id`).
3. Any user can create an organization (`/organizations/new`) and becomes its admin.
4. Admins add members from `/organization` by email (no invite email). New users get a copyable setup link to set their own password.
5. Members open the setup link → `/auth/set-password` → then use the app login.
6. Members share all org links; only admins can add/remove or change roles.

## Short URL redirect flow

1. `GET /{shortCode}` hits [`app/[shortCode]/route.ts`](app/[shortCode]/route.ts).
2. Server validates the code shape and reserved names.
3. Looks up the link via Next.js Data Cache (`unstable_cache`, tag `link-{shortCode}`, 1h revalidate). Cache misses query Supabase with the service-role client.
4. Inactive → `410`; missing → `404`.
5. Click row inserted into Supabase (`user_agent`, `referer`) — always written, never cached.
6. Destination built with UTMs via `buildDestinationUrl`.
7. `302` redirect to the final URL.

Link update/disable calls `updateTag` so destination and `is_active` changes apply on the next redirect.

## Manual test checklist

- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Authenticated user can create an organization
- [ ] Org members see the same shared links
- [ ] Admin can add an existing or new member from Organization
- [ ] New member can sign in and see shared org links
- [ ] Admin can remove a member or change role
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

Meeting links, HubSpot forms, campaign workflows, advanced analytics.
