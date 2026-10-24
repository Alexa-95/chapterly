import Link from "next/link";
import { asc, count, desc, eq } from "drizzle-orm";
import { BOOK_STATUSES, books, shelfBooks, shelves, type Book, type BookStatus } from "@/db/schema";
import { createShelf, deleteShelf } from "@/lib/actions";
import { getDb } from "@/lib/db";
import { STATUS_LABELS } from "@/lib/format";
import BookCard from "@/components/BookCard";

export const metadata = { title: "Shelves" };

export default async function ShelvesPage({ searchParams }: { searchParams: Promise<{ shelf?: string }> }) {
  const db = getDb();
  const selected = (await searchParams).shelf ?? "reading";

  const [statusCounts, customShelves] = await Promise.all([
    db.select({ status: books.status, n: count() }).from(books).groupBy(books.status),
    db
      .select({ id: shelves.id, name: shelves.name, n: count(shelfBooks.bookId) })
      .from(shelves)
      .leftJoin(shelfBooks, eq(shelfBooks.shelfId, shelves.id))
      .groupBy(shelves.id)
      .orderBy(asc(shelves.name)),
  ]);
  const countOf = new Map(statusCounts.map((s) => [s.status, s.n]));

  const isStatus = (BOOK_STATUSES as readonly string[]).includes(selected);
  const custom = isStatus ? undefined : customShelves.find((s) => String(s.id) === selected);

  let list: Book[] = [];
  if (isStatus) {
    list = await db.query.books.findMany({
      where: eq(books.status, selected as BookStatus),
      orderBy: selected === "read" ? desc(books.finishedAt) : desc(books.addedAt),
    });
  } else if (custom) {
    list = (
      await db
        .select({ book: books })
        .from(shelfBooks)
        .innerJoin(books, eq(shelfBooks.bookId, books.id))
        .where(eq(shelfBooks.shelfId, custom.id))
        .orderBy(asc(books.title))
    ).map((r) => r.book);
  }

  const title = isStatus ? STATUS_LABELS[selected as BookStatus] : custom?.name ?? "Shelf";

  return (
    <div className="shelves-layout">
      <aside className="shelf-nav card">
        <p className="eyebrow">Statuses</p>
        {BOOK_STATUSES.map((s) => (
          <Link key={s} href={`/shelves?shelf=${s}`} className={selected === s ? "active" : undefined}>
            <span>{STATUS_LABELS[s]}</span>
            <span className="count">{countOf.get(s) ?? 0}</span>
          </Link>
        ))}

        <p className="eyebrow">My shelves</p>
        {customShelves.map((s) => (
          <Link key={s.id} href={`/shelves?shelf=${s.id}`} className={selected === String(s.id) ? "active" : undefined}>
            <span>{s.name}</span>
            <span className="count">{s.n}</span>
          </Link>
        ))}
        <form action={createShelf} className="new-shelf">
          <input name="name" placeholder="New shelf…" maxLength={60} required />
          <button className="btn btn-small" aria-label="Add shelf">+</button>
        </form>
      </aside>

      <section className="stack">
        <div className="section-head">
          <h1>{title}</h1>
          {custom && (
            <form action={deleteShelf.bind(null, custom.id)}>
              <button className="btn btn-small btn-ghost">Delete shelf</button>
            </form>
          )}
        </div>
        {list.length ? (
          <div className="grid">
            {list.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        ) : (
          <div className="empty card">
            <p>This shelf is still empty.</p>
            {custom ? (
              <p className="muted small">Add books to this shelf from their details page.</p>
            ) : (
              <Link href="/search" className="link">Add a book from search →</Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
