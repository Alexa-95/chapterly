import Link from "next/link";
import { inArray } from "drizzle-orm";
import { books } from "@/db/schema";
import { addBook } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/format";
import { GoogleBooksError, searchBooks, type BookResult } from "@/lib/google-books";
import BookCover from "@/components/BookCover";

export const metadata = { title: "Szukaj" };

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
          ? "Przekroczono limit zapytań Google Books. Dodaj klucz GOOGLE_BOOKS_API_KEY do pliku .dev.vars (instrukcja w README)."
          : "Nie udało się połączyć z Google Books. Spróbuj ponownie za chwilę.";
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
        <h1>Wyszukiwarka książek</h1>
        <p className="muted">Szukaj po tytule, autorze lub ISBN — wyniki pochodzą z Google Books.</p>
      </header>

      <form className="search-bar" action="/search">
        <input name="q" defaultValue={q} placeholder="np. Olga Tokarczuk, „Lalka”, 9788308049393" autoFocus />
        <button className="btn btn-primary" type="submit">Szukaj</button>
      </form>

      {error && <p className="notice">{error}</p>}
      {q && !error && !results.length && <p className="muted">Nic nie znaleziono dla „{q}”.</p>}

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
                  {r.authors.join(", ") || "Autor nieznany"}
                  {r.publishedDate && ` · ${r.publishedDate.slice(0, 4)}`}
                  {r.pageCount ? ` · ${r.pageCount} str.` : ""}
                </p>
                <div className="row">
                  {status ? (
                    <span className="badge">✓ {STATUS_LABELS[status]}</span>
                  ) : (
                    <>
                      <form action={addBook.bind(null, r, "want")}>
                        <button className="btn btn-small">+ Chcę przeczytać</button>
                      </form>
                      <form action={addBook.bind(null, r, "reading")}>
                        <button className="btn btn-small btn-ghost">Zaczynam czytać</button>
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
