import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const BOOK_STATUSES = ["want", "reading", "read"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

const now = sql`(unixepoch())`;

/** Książki w bibliotece użytkownika (id = identyfikator wolumenu Google Books). */
export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors"),
  thumbnail: text("thumbnail"),
  description: text("description"),
  pageCount: integer("page_count"),
  publishedDate: text("published_date"),
  categories: text("categories"),
  status: text("status", { enum: BOOK_STATUSES }).notNull().default("want"),
  currentPage: integer("current_page").notNull().default(0),
  rating: integer("rating"),
  review: text("review"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  finishedAt: integer("finished_at", { mode: "timestamp" }),
  addedAt: integer("added_at", { mode: "timestamp" }).notNull().default(now),
});

/** Własne półki, np. „Ulubione”, „Kryminały”. */
export const shelves = sqliteTable("shelves", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

export const shelfBooks = sqliteTable(
  "shelf_books",
  {
    shelfId: integer("shelf_id")
      .notNull()
      .references(() => shelves.id, { onDelete: "cascade" }),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.shelfId, t.bookId] })],
);

/** Roczne cele czytelnicze. */
export const goals = sqliteTable("goals", {
  year: integer("year").primaryKey(),
  target: integer("target").notNull(),
});

export const ACTIVITY_TYPES = ["added", "started", "progress", "finished", "rated", "reviewed"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Historia aktywności czytelniczej. */
export const activity = sqliteTable("activity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  type: text("type", { enum: ACTIVITY_TYPES }).notNull(),
  value: integer("value"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

export type Book = typeof books.$inferSelect;
export type Shelf = typeof shelves.$inferSelect;
export type Activity = typeof activity.$inferSelect;
