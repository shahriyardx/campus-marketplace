# Campus Marketplace

A student-to-student listing board for used academic items — textbooks,
calculators, lab gear. Buyers and sellers arrange everything in chat and meet in
person. **No payments are processed by this site.**

## Stack

| Layer     | Choice                                                   |
| --------- | ---------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, React Compiler)          |
| Auth      | Firebase Auth (Google + email/password) via session cookies |
| Database  | MongoDB + Mongoose                                          |
| API       | tRPC 11 + TanStack Query + SuperJSON                        |
| UI        | Tailwind 4 + shadcn/ui (`radix-nova`) + lucide + Poppins    |
| Images    | imgbb, proxied through `/api/upload`                        |
| Tooling   | bun, Biome                                                  |

## Setup

1. **Install and start Mongo**

   ```bash
   bun install
   docker compose up -d
   ```

2. **Create a Firebase project**
   - Enable the **Google** and **Email/Password** sign-in providers.
   - Add `localhost` under Authorized domains.
   - Generate a service-account key (Project settings → Service accounts).

3. **Fill `.env`** — copy `.env.example` and set every value. `IMGBB_API_KEY`
   comes from <https://api.imgbb.com/>; photo upload returns a 500 until it is set.

4. **Seed the categories, then run**

   ```bash
   bun run db:seed
   bun dev
   ```

## Scripts

| Command             | What it does                                  |
| ------------------- | ----------------------------------------------- |
| `bun dev`           | Dev server on <http://localhost:3000>            |
| `bun run build`     | Production build                                 |
| `bun run db:seed`   | Upserts the item categories (safe to re-run)     |
| `bun run lint`      | Biome check                                      |
| `bun run format`    | Biome format                                     |

> The seed script runs under `node`, not `bun` — bun's `node:v8` shim is
> incomplete and `bson` fails to load on it.

## How it fits together

- `src/models/` — Mongoose schemas. Import them from `src/models/index.ts` so
  every model is registered before a `populate()` runs.
- `src/lib/session.ts` — verifies the Firebase session cookie and loads the
  Mongo user. Used by both server components and the tRPC context.
- `src/trpc/routers/` — one router per domain. `protectedProcedure` requires a
  session; ownership is re-checked per listing before any write.
- `src/lib/schemas.ts` — zod schemas shared by the forms and the procedures, so
  client and server validation cannot drift.

## Design system

Warm paper background, ink text, and a single rust accent — no second accent
colour. Structure comes from hairline rules and spacing rather than shadows.

Poppins is the only typeface. `--font-sans`, `--font-display` and `--font-mono`
in `globals.css` all point at it, so `font-display` is a **weight and tracking
role** (600, `-0.03em`), not a different family. Two utilities carry the rest:

| Utility       | Use                                                            |
| ------------- | ---------------------------------------------------------------- |
| `label-caps`  | Small uppercase eyebrows and metadata rows                        |
| `numeric`     | Prices and counts — tabular figures so columns align down a grid  |

The category index and the how-it-works card share one trick: a 1px gap over a
border-coloured background draws the dividing rules for free.

### Things worth knowing

- **MongoDB has no cascade delete.** `listing.remove` deletes the listing's
  favorites, conversations and messages by hand.
- **imgbb's `delete_url` is a web page, not an API.** Removing a photo drops our
  reference only; the file stays on imgbb.
- **Messaging polls every 5 seconds.** No websockets, deliberately.
- Local Mongo is a single node, so there is no replica set and **transactions
  are unavailable**. Nothing in the code relies on them.
