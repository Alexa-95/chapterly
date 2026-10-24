import { Suspense } from "react";
import Form from "next/form";
import Link from "next/link";
import { inArray } from "drizzle-orm";
import { books } from "@/db/schema";
import { addBook } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/format";
import { searchBooks, type BookResult } from "@/lib/catalog";
import { GoogleBooksError } from "@/lib/google-books";
import BookCover from "@/components/BookCover";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";

  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>Book search</h1>
        <p className="muted">Search by title, author or ISBN — results come from Open Library and Google Books.</p>
      </header>

      <Form className="search-bar" action="/search">
        <input name="q" defaultValue={q} placeholder="e.g. Olga Tokarczuk, “Flights”, 9780525534198" autoFocus />
        <button className="btn btn-primary" type="submit">Search</button>
      </Form>

      {/* key={q} shows the loader again for every new query */}
      {q && (
        <Suspense key={q} fallback={<ResultsLoading q={q} />}>
          <Results q={q} />
        </Suspense>
      )}
    </div>
  );
}

async function Results({ q }: { q: string }) {
  let results: BookResult[] = [];
  let error: string | null = null;
  try {
    results = await searchBooks(q);
  } catch (e) {
    error =
      e instanceof GoogleBooksError && (e.status === 429 || e.status === 403)
        ? "Google Books request limit exceeded. Add a GOOGLE_BOOKS_API_KEY to .dev.vars (see the README)."
        : "Couldn't connect to the book search. Please try again in a moment.";
  }

  if (error) return <p className="notice">{error}</p>;
  if (!results.length) return <p className="muted">Nothing found for “{q}”.</p>;

  const owned = await getDb()
    .select({ id: books.id, status: books.status })
    .from(books)
    .where(inArray(books.id, results.map((r) => r.id)));
  const statusOf = new Map(owned.map((b) => [b.id, b.status]));

  return (
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
  );
}

function ResultsLoading({ q }: { q: string }) {
  return (
    <div className="stack" role="status" aria-live="polite">
      <p className="searching muted">
        <span className="spinner" aria-hidden />
        Searching for “{q}”…
      </p>
      <ul className="results" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="result card skeleton">
            <div className="cover cover-sm" />
            <div className="result-body skeleton-lines">
              <span />
              <span />
              <span />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
