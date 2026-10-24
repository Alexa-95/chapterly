# Chapterly — dziennik czytelniczy

Aplikacja do śledzenia książek, czytania i własnych recenzji.

**Funkcje:** wyszukiwarka książek (Google Books), półki (statusy + własne półki), cele czytelnicze, oceny i recenzje, statystyki, historia aktywności.

**Stack:** Next.js 16 (App Router, Server Actions) · Google Books API · Cloudflare D1 · Drizzle ORM · OpenNext (deploy na Cloudflare Workers)

## Uruchomienie lokalne

```bash
npm install
cp .dev.vars.example .dev.vars        # wpisz klucz GOOGLE_BOOKS_API_KEY
npm run db:migrate:local               # tworzy tabele w lokalnej bazie D1 (.wrangler/)
npm run dev                            # http://localhost:3000
```

### Klucz Google Books API

1. Wejdź na https://console.cloud.google.com/ i utwórz projekt.
2. *APIs & Services → Library* → wyszukaj **Books API** → **Enable**.
3. *APIs & Services → Credentials* → **Create credentials → API key**.
4. Wklej klucz do `.dev.vars`: `GOOGLE_BOOKS_API_KEY=twój_klucz`.

## Zmiany w bazie

1. Edytuj `src/db/schema.ts`.
2. `npm run db:generate` — Drizzle tworzy nową migrację w `drizzle/`.
3. `npm run db:migrate:local` (lokalnie) lub `npm run db:migrate:remote` (produkcja).

## Wdrożenie na Cloudflare

```bash
npx wrangler login
npx wrangler d1 create chapterly-db     # skopiuj database_id do wrangler.jsonc
npm run db:migrate:remote
npx wrangler secret put GOOGLE_BOOKS_API_KEY
npm run deploy
```

## Struktura

```
src/
  app/            strony: pulpit, search, shelves, books/[id], goals, stats, history
  components/     okładki, gwiazdki, pasek postępu, pierścień celu, wykres
  db/schema.ts    tabele: books, shelves, shelf_books, goals, activity
  lib/            actions.ts (Server Actions), google-books.ts, queries.ts, stats.ts
drizzle/          migracje SQL
```

Aplikacja jest jednoosobowa (bez logowania) — wszystkie dane trafiają do jednej bazy D1.
