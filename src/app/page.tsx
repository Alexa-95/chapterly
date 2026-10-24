import Link from "next/link";
import { and, desc, eq, gte } from "drizzle-orm";
import { books, goals } from "@/db/schema";
import { getDb } from "@/lib/db";
import { getActivityFeed } from "@/lib/queries";
import { booksWord, describeActivity, formatDate, pagesWord } from "@/lib/format";
import BookCard from "@/components/BookCard";
import GoalRing from "@/components/GoalRing";

export default async function Dashboard() {
  const db = getDb();
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);

  const [reading, readThisYear, goal, recent, wantCount] = await Promise.all([
    db.query.books.findMany({ where: eq(books.status, "reading"), orderBy: desc(books.startedAt) }),
    db.query.books.findMany({ where: and(eq(books.status, "read"), gte(books.finishedAt, yearStart)) }),
    db.query.goals.findFirst({ where: eq(goals.year, year) }),
    getActivityFeed(6),
    db.$count(books, eq(books.status, "want")),
  ]);

  const pagesThisYear = readThisYear.reduce((s, b) => s + (b.pageCount ?? 0), 0);

  return (
    <div className="stack-lg">
      <section className="hero">
        <div>
          <p className="eyebrow">{formatDate(new Date())}</p>
          <h1>Miło Cię widzieć przy lekturze</h1>
          <p className="muted lead">
            W tym roku przeczytano {booksWord(readThisYear.length)} — to {pagesWord(pagesThisYear)}.
          </p>
          <div className="row">
            <Link href="/search" className="btn btn-primary">Znajdź książkę</Link>
            <Link href="/shelves" className="btn">Moje półki</Link>
          </div>
        </div>
        <div className="hero-goal card">
          {goal ? (
            <>
              <GoalRing done={readThisYear.length} target={goal.target} />
              <p className="muted small">Cel na {year}</p>
            </>
          ) : (
            <>
              <p className="muted small">Nie masz jeszcze celu na {year}.</p>
              <Link href="/goals" className="btn btn-small">Ustal cel</Link>
            </>
          )}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Teraz czytam</h2>
          <span className="muted small">{wantCount} w kolejce</span>
        </div>
        {reading.length ? (
          <div className="grid">
            {reading.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        ) : (
          <div className="empty card">
            <p>Żadna książka nie jest teraz otwarta.</p>
            <Link href="/search" className="link">Poszukaj czegoś na dziś →</Link>
          </div>
        )}
      </section>

      <section>
        <div className="section-head">
          <h2>Ostatnio</h2>
          <Link href="/history" className="link small">Cała historia →</Link>
        </div>
        {recent.length ? (
          <ul className="timeline card">
            {recent.map((a) => (
              <li key={a.id}>
                <span className="dot" />
                <span>
                  {describeActivity(a)} ·{" "}
                  <Link href={`/books/${a.bookId}`} className="link">{a.title}</Link>
                </span>
                <time className="muted tiny">{formatDate(a.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Tu pojawią się Twoje czytelnicze chwile.</p>
        )}
      </section>
    </div>
  );
}
