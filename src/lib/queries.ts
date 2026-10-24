import { desc, eq } from "drizzle-orm";
import { activity, books } from "@/db/schema";
import { getDb } from "@/lib/db";

/** Aktywność razem z tytułem i okładką książki, od najnowszej. */
export function getActivityFeed(limit?: number) {
  const q = getDb()
    .select({
      id: activity.id,
      type: activity.type,
      value: activity.value,
      createdAt: activity.createdAt,
      bookId: books.id,
      title: books.title,
      thumbnail: books.thumbnail,
    })
    .from(activity)
    .innerJoin(books, eq(activity.bookId, books.id))
    .orderBy(desc(activity.createdAt), desc(activity.id));
  return limit ? q.limit(limit) : q;
}

export type FeedItem = Awaited<ReturnType<typeof getActivityFeed>>[number];
