# Smallroom: setup and operations

Smallroom is a Next.js 15 app (App Router, TypeScript, Tailwind v4) that serves at `foundrydocs.com/smallroom`. `basePath` is `/smallroom`, so every route and API in this document is relative to that.

GitHub `main` is the source of truth. Replit only hosts: it pulls `main` and never writes back.

## Placement

The FoundryDocs website repo (`SimonSliman/FoundryDocs`) is a Vite + React single page app, not Next.js. Smallroom therefore lives in its own repo and is mounted at `/smallroom` by the thing that fronts `foundrydocs.com`. See "Serving at foundrydocs.com/smallroom" below.

## Environment variables

| Name | Required | What it is |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres connection string, with `?sslmode=require`. |
| `RESEND_API_KEY` | yes | Resend API key. Without it every send is logged in `sr_email_log` with an error and nothing goes out. |
| `ADMIN_PASSWORD` | yes | Single operator password for `/admin` and for `POST /api/admin/migrate`. |
| `APP_URL` | yes | Public URL including the base path, e.g. `https://foundrydocs.com/smallroom`. Used in every link in every email. |
| `MAIL_FROM` | yes | e.g. `Simon at Smallroom <simon@foundrydocs.com>`. Must be on a domain verified in Resend. |
| `MAIL_REPLY_TO` | yes | Where replies go, e.g. `simon@foundrydocs.com`. Also used as the organizer in `.ics` files. |
| `ADMIN_NOTIFY_EMAIL` | yes | Gets `admin_new_table` and the "Send test email" batch. |
| `NEXT_PUBLIC_BASE_PATH` | no | Defaults to `/smallroom`. Only change it if the mount path changes. Build time. |
| `PRICE_CENTS` | no | Default `90000`. |
| `FOUNDING_DISCOUNT_CENTS` | no | Default `90000`. |
| `MAP_TILE_URL` | no | Default OpenStreetMap tiles. |
| `SENDER_FIRST_NAME` | no | Signature on emails. Default `Simon`. |
| `PORT` | no | Replit sets this. `npm start` honours it. |

Copy `.env.example` to `.env.local` for local work.

## Database

Postgres on Neon. Plain SQL through `pg`. Tables: `sr_tables`, `sr_invitations`, `sr_interest`, `sr_email_log`, plus `sr_migrations` which records what has run.

Migrations are named, whitelisted and idempotent: `sr_001_tables`, `sr_002_invitations`, `sr_003_interest`, `sr_004_email_log`. They only run through the endpoint below. Running it twice is safe.

### Run the migrations from the Replit shell

```sh
curl -s -X POST "$APP_URL/api/admin/migrate" \
  -H "Authorization: Bearer $ADMIN_PASSWORD"
```

Expected on first run:

```json
{"ok":true,"applied":["sr_001_tables","sr_002_invitations","sr_003_interest","sr_004_email_log"],"skipped":[],"known":[...]}
```

To run a subset, pass `{"names":["sr_004_email_log"]}` as a JSON body. Unknown names are rejected. `GET` on the same URL lists known migrations. The `x-admin-password` header works instead of `Authorization` if that is easier.

## Email (Resend)

- Everything goes through Resend. Open and click tracking are not used (the API sends no tracking options and the emails contain no images). Each email has a plain text part and a minimal HTML part with one link.
- `MAIL_FROM` must use a domain that is verified in the Resend account. Check at resend.com under Domains. The records Resend asks for are usually: one TXT for domain verification, one TXT for DKIM (`resend._domainkey`), and an MX plus TXT for the `send` subdomain used for bounces. A DMARC TXT at `_dmarc` (`v=DMARC1; p=none;`) is optional but helps inbox placement.
- If no domain is verified yet, `onboarding@resend.dev` works but only delivers to the Resend account owner's own address. Use it for the "Send test email" button and nothing else.
- Every send, successful or not, is logged in `sr_email_log` and shown at the bottom of each table in admin.

Templates and triggers:

| Key | To | Trigger |
|---|---|---|
| `host_created` | Host | Table created in the host flow (or admin "New table" with the box ticked) |
| `admin_new_table` | `ADMIN_NOTIFY_EMAIL` | Table created in the host flow |
| `guest_invite` | Guest | Admin clicks Send invite, optional personal note |
| `guest_confirmed` | Guest | Guest taps I'll be there (`.ics` attached once a final time is set) |
| `guest_final_details` | Confirmed guests | Admin clicks Send final details (`.ics` attached) |
| `guest_reminder` | Confirmed guests | Admin clicks Send reminder |
| `host_update` | Host | A guest confirms, joins the waitlist or declines |

"Send test email" on any table sends all seven to `ADMIN_NOTIFY_EMAIL` with `[test]` in the subject.

## Routes

| Route | Who |
|---|---|
| `/` | Landing page for companies |
| `/host`, `/host?template=<id>` | Three step host flow |
| `/host/done/[manageToken]` | After creating |
| `/m/[manageToken]` | Host's read only table page |
| `/i/[inviteToken]` | Guest invitation, one tap confirm |
| `/join` | Ask to be invited to a future table |
| `/terms`, `/privacy` | Legal |
| `/admin` | Operator screen (password) |

APIs: `GET /api/cities?q=`, `GET /api/cities/in-view?bbox=w,s,e,n&minPop=`, `POST /api/tables`, `POST /api/join`, `POST /api/invite/[token]`, `GET /api/invite/[token]/ics`, `POST /api/admin/migrate`.

## Seat logic

`seat_target` defaults to 7 and includes the host. Guests are accepted until there are `seat_target` accepted guests (so `seat_target + 1` people with the host). After that a new accept goes to `waitlist` and the guest sees "This table is full. You are first in line if a seat opens."

## Cities

`data/cities.json` (committed, about 5 MB) holds every city with population 15,000 or more: name, ASCII name, region, country, coordinates, population, timezone. It is read on the server only; the browser only ever receives search results.

Source: GeoNames cities15000 (CC BY 4.0, credited in the footer). Rebuild with `npm run build-cities`. The script downloads from geonames.org when reachable and otherwise falls back to the copy bundled in the `cities-15000-structured` npm package; region names come from GeoNames admin1 codes or the `datasets/world-cities` mirror.

## Serving at foundrydocs.com/smallroom

The app expects to be reached at `https://foundrydocs.com/smallroom` and serves all its own routes and assets under that prefix. Two ways to get there:

1. **Replit as origin.** Deploy this repo on Replit (the `.replit` file builds and starts it). Then point `foundrydocs.com/smallroom/*` at the Replit deployment with a reverse proxy or a path based rewrite at whatever serves `foundrydocs.com` today (Cloudflare Worker or Rule, Vercel `rewrites`, nginx `location /smallroom/`). The proxy must pass the path through unchanged, including the `/smallroom` prefix.
2. **Run it on the same host as the FoundryDocs site** and let that host's web server forward `/smallroom/*` to the Node process on its port.

If you would rather use a subdomain (`smallroom.foundrydocs.com`), set `NEXT_PUBLIC_BASE_PATH=` (empty) and `APP_URL=https://smallroom.foundrydocs.com` before building.

## Local development

```sh
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000/smallroom
curl -X POST http://localhost:3000/smallroom/api/admin/migrate -H "Authorization: Bearer $ADMIN_PASSWORD"
```

`npm run typecheck`, `npm run lint` and `npm run build` should all pass before pushing to `main`.

## Design tokens

Colours, radii and button heights live in `lib/tokens.ts` and as CSS variables at the top of `app/globals.css`. The original mockups are in `design-reference/smallroom/`.
