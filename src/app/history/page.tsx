import Link from "next/link";
import { describeActivity, formatDate, formatTime } from "@/lib/format";
import { getActivityFeed, type FeedItem } from "@/lib/queries";
import BookCover from "@/components/BookCover";

export const metadata = { title: "Historia" };

export default async function HistoryPage() {
  const feed = await getActivityFeed(300);

  const days = new Map<string, FeedItem[]>();
  for (const item of feed) {
    const key = formatDate(item.createdAt);
    days.set(key, [...(days.get(key) ?? []), item]);
  }

  return (
    <div className="stack-lg">
      <header className="page-head">
        <h1>Historia</h1>
        <p className="muted">Dziennik Twoich czytelniczych chwil.</p>
      </header>

      {feed.length === 0 && (
        <div className="empty card">
          <p>Historia jest jeszcze pusta.</p>
          <Link href="/search" className="link">Dodaj pierwszą książkę →</Link>
        </div>
      )}

      {[...days.entries()].map(([day, items]) => (
        <section key={day} className="stack">
          <h2 className="day">{day}</h2>
          <ul className="history card">
            {items.map((a) => (
              <li key={a.id}>
                <Link href={`/books/${a.bookId}`}>
                  <BookCover title={a.title} thumbnail={a.thumbnail} size="sm" />
                </Link>
                <div>
                  <p>{describeActivity(a)}</p>
                  <Link href={`/books/${a.bookId}`} className="link small">{a.title}</Link>
                </div>
                <time className="muted tiny">{formatTime(a.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
