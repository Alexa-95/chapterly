import Link from "next/link";
import { count, isNotNull } from "drizzle-orm";
import { books } from "@/db/schema";
import { getDb } from "@/lib/db";
import { MONTHS_SHORT, booksWord, pagesWord } from "@/lib/format";
import { getFinishedBooks, pagesPerMonth } from "@/lib/stats";
import BarChart from "@/components/BarChart";

export const metadata = { title: "Stats" };

function topCounts(values: (string | null)[], limit = 5) {
  const counts = new Map<string, number>();
  for (const v of values) {
    for (const item of (v ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const thisYear = new Date().getFullYear();
  const year = Number((await searchParams).year) || thisYear;

  const [finished, pagesByMonth, [{ total }], ratingRows] = await Promise.all([
    getFinishedBooks(),
    pagesPerMonth(year),
    getDb().select({ total: count() }).from(books),
    getDb().select({ rating: books.rating }).from(books).where(isNotNull(books.rating)),
  ]);

  const years = [...new Set([thisYear, ...finished.map((b) => b.finishedAt!.getFullYear())])].sort((a, b) => b - a);
  const inYear = finished.filter((b) => b.finishedAt!.getFullYear() === year);

  const booksByMonth = Array(12).fill(0) as number[];
  for (const b of inYear) booksByMonth[b.finishedAt!.getMonth()]++;

  const pagesInYear = inYear.reduce((s, b) => s + (b.pageCount ?? 0), 0);
  const ratings = ratingRows.map((r) => r.rating!);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";
  const durations = inYear
    .filter((b) => b.startedAt)
    .map((b) => Math.max(1, Math.round((b.finishedAt!.getTime() - b.startedAt!.getTime()) / 86_400_000)));
  const avgDays = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({ n, c: ratings.filter((r) => r === n).length }));
  const maxDist = Math.max(1, ...ratingDist.map((d) => d.c));

  return (
    <div className="stack-lg">
      <header className="page-head section-head">
        <div>
          <h1>Stats</h1>
          <p className="muted">Your year in numbers.</p>
        </div>
        <nav className="chips">
          {years.map((y) => (
            <Link key={y} href={`/stats?year=${y}`} className={`chip${y === year ? " on" : ""}`}>
              {y}
            </Link>
          ))}
        </nav>
      </header>

      <div className="tiles">
        <div className="tile card"><span className="tile-value">{inYear.length}</span><span className="muted small">read in {year}</span></div>
        <div className="tile card"><span className="tile-value">{pagesInYear.toLocaleString("en-US")}</span><span className="muted small">pages in finished books</span></div>
        <div className="tile card"><span className="tile-value">{avgRating}</span><span className="muted small">average rating</span></div>
        <div className="tile card"><span className="tile-value">{avgDays ?? "—"}</span><span className="muted small">days per book (average)</span></div>
      </div>

      <div className="detail-grid">
        <section className="card stack">
          <h2>Books read</h2>
          <BarChart
            caption={`Books finished per month in ${year}`}
            data={booksByMonth.map((v, i) => ({ label: MONTHS_SHORT[i], value: v, hint: booksWord(v) }))}
          />
        </section>
        <section className="card stack">
          <h2>Pages read</h2>
          <BarChart
            caption={`Pages logged as progress in ${year}`}
            data={pagesByMonth.map((v, i) => ({ label: MONTHS_SHORT[i], value: v, hint: pagesWord(v) }))}
          />
        </section>
      </div>

      <div className="detail-grid three">
        <section className="card stack">
          <h2>Rating distribution</h2>
          <ul className="hbars">
            {ratingDist.map((d) => (
              <li key={d.n}>
                <span className="small">{d.n}★</span>
                <div className="hbar-track"><div className="hbar" style={{ width: `${(d.c / maxDist) * 100}%` }} /></div>
                <span className="small muted">{d.c}</span>
              </li>
            ))}
          </ul>
        </section>
        <TopList title="Favourite authors" items={topCounts(finished.map((b) => b.authors))} />
        <TopList title="Genres" items={topCounts(finished.map((b) => b.categories))} />
      </div>

      <p className="muted small">Total in library: {booksWord(total)}.</p>
    </div>
  );
}

function TopList({ title, items }: { title: string; items: [string, number][] }) {
  return (
    <section className="card stack">
      <h2>{title}</h2>
      {items.length ? (
        <ol className="top-list">
          {items.map(([name, n]) => (
            <li key={name}>
              <span>{name}</span>
              <span className="muted small">{n}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted small">Will appear once you finish your first books.</p>
      )}
    </section>
  );
}
