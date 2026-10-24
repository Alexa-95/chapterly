import { and, eq, gte, isNotNull, lt } from "drizzle-orm";
import { activity, books } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function getFinishedBooks() {
  return getDb().query.books.findMany({
    where: and(eq(books.status, "read"), isNotNull(books.finishedAt)),
  });
}

/** Liczba przeczytanych książek w podziale na lata. */
export async function finishedPerYear() {
  const finished = await getFinishedBooks();
  const perYear = new Map<number, number>();
  for (const b of finished) {
    const y = b.finishedAt!.getFullYear();
    perYear.set(y, (perYear.get(y) ?? 0) + 1);
  }
  return perYear;
}

/** Strony zapisane jako postęp w danym roku, w podziale na miesiące. */
export async function pagesPerMonth(year: number) {
  const rows = await getDb()
    .select({ value: activity.value, createdAt: activity.createdAt })
    .from(activity)
    .where(
      and(
        eq(activity.type, "progress"),
        gte(activity.createdAt, new Date(year, 0, 1)),
        lt(activity.createdAt, new Date(year + 1, 0, 1)),
      ),
    );
  const months = Array(12).fill(0) as number[];
  for (const r of rows) months[r.createdAt.getMonth()] += r.value ?? 0;
  return months;
}
