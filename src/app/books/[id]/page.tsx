import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { BOOK_STATUSES, books, shelfBooks, shelves } from "@/db/schema";
import { addBook, removeBook, saveReview, setStatus, toggleShelf, updateProgress } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { STATUS_LABELS, formatDate } from "@/lib/format";
import { getVolume } from "@/lib/google-books";
import BookCover from "@/components/BookCover";
import ProgressBar from "@/components/ProgressBar";
import StarRating from "@/components/StarRating";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const book = await db.query.books.findFirst({ where: eq(books.id, id) });

  if (!book) {
    const volume = await getVolume(id);
    if (!volume) notFound();
    return (
      <article className="book-detail">
        <BookCover title={volume.title} thumbnail={volume.thumbnail} size="lg" />
        <div className="stack">
          <h1>{volume.title}</h1>
          <p className="muted lead">{volume.authors.join(", ") || "Autor nieznany"}</p>
          <Meta published={volume.publishedDate} pages={volume.pageCount} categories={volume.categories.join(", ")} />
          <div className="row">
            <form action={addBook.bind(null, volume, "want")}>
              <button className="btn btn-primary">+ Chcę przeczytać</button>
            </form>
            <form action={addBook.bind(null, volume, "reading")}>
              <button className="btn">Zaczynam czytać</button>
            </form>
            <form action={addBook.bind(null, volume, "read")}>
              <button className="btn btn-ghost">Już przeczytane</button>
            </form>
          </div>
          {volume.description && <p className="description">{volume.description}</p>}
        </div>
      </article>
    );
  }

  const [allShelves, memberships] = await Promise.all([
    db.select().from(shelves).orderBy(asc(shelves.name)),
    db.select({ shelfId: shelfBooks.shelfId }).from(shelfBooks).where(eq(shelfBooks.bookId, id)),
  ]);
  const onShelf = new Set(memberships.map((m) => m.shelfId));

  return (
    <article className="book-detail">
      <div className="stack">
        <BookCover title={book.title} thumbnail={book.thumbnail} size="lg" />
        <form action={removeBook.bind(null, book.id)}>
          <button className="btn btn-small btn-ghost btn-danger">Usuń z biblioteki</button>
        </form>
      </div>

      <div className="stack-lg">
        <div className="stack">
          <h1>{book.title}</h1>
          <p className="muted lead">{book.authors ?? "Autor nieznany"}</p>
          <Meta published={book.publishedDate} pages={book.pageCount} categories={book.categories} />
        </div>

        <div className="segmented" role="group" aria-label="Status">
          {BOOK_STATUSES.map((s) => (
            <form key={s} action={setStatus.bind(null, book.id, s)}>
              <button className={book.status === s ? "active" : undefined} aria-pressed={book.status === s}>
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        </div>

        <div className="detail-grid">
          <section className="card stack">
            <h2>Postęp</h2>
            {book.pageCount ? (
              <>
                <ProgressBar value={book.currentPage} max={book.pageCount} label="Postęp czytania" />
                <p className="small muted">
                  Strona {book.currentPage} z {book.pageCount} ({Math.round((book.currentPage / book.pageCount) * 100)}%)
                </p>
              </>
            ) : (
              <p className="small muted">Brak informacji o liczbie stron — wpisz, na której jesteś.</p>
            )}
            <form action={updateProgress.bind(null, book.id)} className="row">
              <input type="number" name="currentPage" min={0} max={book.pageCount ?? undefined} defaultValue={book.currentPage} className="input-narrow" aria-label="Aktualna strona" />
              <button className="btn btn-small">Zapisz stronę</button>
            </form>
            <p className="tiny muted">
              {book.startedAt && `Rozpoczęto ${formatDate(book.startedAt)}`}
              {book.finishedAt && ` · Ukończono ${formatDate(book.finishedAt)}`}
            </p>
          </section>

          <section className="card stack">
            <h2>Ocena</h2>
            <StarRating bookId={book.id} value={book.rating} />
            <h2>Półki</h2>
            {allShelves.length ? (
              <div className="chips">
                {allShelves.map((s) => (
                  <form key={s.id} action={toggleShelf.bind(null, book.id, s.id)}>
                    <button className={`chip${onShelf.has(s.id) ? " on" : ""}`}>
                      {onShelf.has(s.id) ? "✓ " : "+ "}
                      {s.name}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <p className="small muted">Utwórz własne półki w zakładce „Półki”.</p>
            )}
          </section>
        </div>

        <section className="card stack">
          <h2>Moja recenzja</h2>
          <form action={saveReview.bind(null, book.id)} className="stack">
            <textarea name="review" rows={6} defaultValue={book.review ?? ""} placeholder="Co zostało z Tobą po tej lekturze?" />
            <div>
              <button className="btn btn-primary btn-small">Zapisz recenzję</button>
            </div>
          </form>
        </section>

        {book.description && (
          <section className="stack">
            <h2>O książce</h2>
            <p className="description">{book.description}</p>
          </section>
        )}
      </div>
    </article>
  );
}

function Meta({ published, pages, categories }: { published: string | null; pages: number | null; categories: string | null }) {
  const parts = [published && `Wydano: ${published}`, pages && `${pages} stron`, categories].filter(Boolean);
  return parts.length ? <p className="small muted">{parts.join(" · ")}</p> : null;
}
