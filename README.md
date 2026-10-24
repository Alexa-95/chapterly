# Chapterly — reading journal

An app for tracking your books, reading and your own reviews.

**Features:** book search (Open Library, with Google Books as a fallback), shelves (statuses + custom shelves), reading goals, ratings and reviews, stats, activity history.

**Stack:** Next.js 16 (App Router, Server Actions) · Open Library API · Google Books API · Cloudflare D1 · Drizzle ORM · OpenNext (deployed to Cloudflare Workers)

## Running locally

```bash
npm install
cp .dev.vars.example .dev.vars        # add your GOOGLE_BOOKS_API_KEY
npm run db:migrate:local               # creates the tables in the local D1 database (.wrangler/)
npm run dev                            # http://localhost:3000
```

### Google Books API key

1. Go to https://console.cloud.google.com/ and create a project.
2. *APIs & Services → Library* → search for **Books API** → **Enable**.
3. *APIs & Services → Credentials* → **Create credentials → API key**.
4. Paste the key into `.dev.vars`: `GOOGLE_BOOKS_API_KEY=your_key`.

## Database changes

1. Edit `src/db/schema.ts`.
2. `npm run db:generate` — Drizzle creates a new migration in `drizzle/`.
3. `npm run db:migrate:local` (local) or `npm run db:migrate:remote` (production).

## Deploying to Cloudflare

```bash
npx wrangler login
npx wrangler d1 create chapterly-db     # copy the database_id into wrangler.jsonc
npm run db:migrate:remote
npx wrangler secret put GOOGLE_BOOKS_API_KEY
npm run deploy
```

## Structure

```
src/
  app/            pages: dashboard, search, shelves, books/[id], goals, stats, history
  components/     covers, stars, progress bar, goal ring, chart
  db/schema.ts    tables: books, shelves, shelf_books, goals, activity
  lib/            actions.ts (Server Actions), catalog.ts (search across sources), open-library.ts,
                  google-books.ts, queries.ts, stats.ts
drizzle/          SQL migrations
```

The app is single-user (no login) — all data goes into a single D1 database.
