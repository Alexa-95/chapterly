import Link from "next/link";
import { inArray } from "drizzle-orm";
import { books } from "@/db/schema";
import { addBook } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/format";
import { GoogleBooksError, searchBooks, type BookResult } from "@/lib/google-books";
import BookCover from "@/components/BookCover";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";

  let results: BookResult[] = [];
  let error: string | null = null;
  if (q) {
    try {
      results = await searchBooks(q);
    } catch (e) {
      error =
        e instanceof GoogleBooksError && (e.status === 429 || e.status === 403)
          ? "Google Books request limit exceeded. Add a GOOGLE_BOOKS_API_KEY to .dev.vars (see the README)."
          : "Couldn't connect to Google Books. Please try again in a moment.";
    }
  }

  const owned = results.length
    ? await getDb()
        .select({ id: books.id, status: books.status })
        .from(books)
        .where(inArray(books.id, results.map((r) => r.id)))
    : [];
  const statusOf = new Map(owned.map((b) => [b.id, b.status]));

  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>Book search</h1>
        <p className="muted">Search by title, author or ISBN — results come from Google Books.</p>
      </header>

      <form className="search-bar" action="/search">
        <input name="q" defaultValue={q} placeholder="e.g. Olga Tokarczuk, “Flights”, 9780525534198" autoFocus />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      {error && <p className="notice">{error}</p>}
      {q && !error && !results.length && <p className="muted">Nothing found for “{q}”.</p>}

      <ul className="results">
        {results.map((r) => {
          const status = statusOf.get(r.id);
          return (
            <li key={r.id} className="result card">
              <Link href={`/books/${r.id}`}>
                <BookCover title={r.title} thumbnail={r.thumbnail} size="sm" />
              </Link>
              <div className="result-body">
                <Link href={`/books/${r.id}`} className="result-title">{r.title}</Link>
                <p className="muted small">
                  {r.authors.join(", ") || "Unknown author"}
                  {r.publishedDate && ` · ${r.publishedDate.slice(0, 4)}`}
                  {r.pageCount ? ` · ${r.pageCount} pages` : ""}
                </p>
                <div className="row">
                  {status ? (
                    <span className="badge">✓ {STATUS_LABELS[status]}</span>
                  ) : (
                    <>
                      <form action={addBook.bind(null, r, "want")}>
                        <button className="btn btn-small">+ Want to read</button>
                      </form>
                      <form action={addBook.bind(null, r, "reading")}>
                        <button className="btn btn-small btn-ghost">Start reading</button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
