"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { activity, books, goals, shelfBooks, shelves, type BookStatus } from "@/db/schema";
import { getDb } from "@/lib/db";
import type { BookResult } from "@/lib/catalog";

function refresh() {
  revalidatePath("/", "layout");
}

export async function addBook(book: BookResult, status: BookStatus = "want") {
  const db = getDb();
  const inserted = await db
    .insert(books)
    .values({
      id: book.id,
      title: book.title,
      authors: book.authors.join(", ") || null,
      thumbnail: book.thumbnail,
      description: book.description,
      pageCount: book.pageCount,
      publishedDate: book.publishedDate,
      categories: book.categories.join(", ") || null,
    })
    .onConflictDoNothing()
    .returning({ id: books.id });

  if (inserted.length) {
    await db.insert(activity).values({ bookId: book.id, type: "added" });
  }
  if (status !== "want") await setStatus(book.id, status);
  refresh();
}

export async function setStatus(bookId: string, status: BookStatus) {
  const db = getDb();
  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book || book.status === status) return;

  const now = new Date();
  if (status === "reading") {
    await db
      .update(books)
      .set({ status, startedAt: book.startedAt ?? now, finishedAt: null })
      .where(eq(books.id, bookId));
    await db.insert(activity).values({ bookId, type: "started" });
  } else if (status === "read") {
    await db
      .update(books)
      .set({
        status,
        startedAt: book.startedAt ?? now,
        finishedAt: now,
        currentPage: book.pageCount ?? book.currentPage,
      })
      .where(eq(books.id, bookId));
    await db.insert(activity).values({ bookId, type: "finished" });
  } else {
    await db.update(books).set({ status, finishedAt: null }).where(eq(books.id, bookId));
  }
  refresh();
}

export async function updateProgress(bookId: string, formData: FormData) {
  const db = getDb();
  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book) return;

  let page = Math.max(0, Math.round(Number(formData.get("currentPage")) || 0));
  if (book.pageCount) page = Math.min(page, book.pageCount);
  const delta = page - book.currentPage;
  if (delta === 0) return;

  await db.update(books).set({ currentPage: page }).where(eq(books.id, bookId));
  if (delta > 0) await db.insert(activity).values({ bookId, type: "progress", value: delta });

  if (book.status !== "reading" && book.status !== "read") await setStatus(bookId, "reading");
  if (book.pageCount && page >= book.pageCount) await setStatus(bookId, "read");
  refresh();
}

export async function rateBook(bookId: string, rating: number) {
  const db = getDb();
  const value = rating >= 1 && rating <= 5 ? rating : null;
  await db.update(books).set({ rating: value }).where(eq(books.id, bookId));
  if (value) await db.insert(activity).values({ bookId, type: "rated", value });
  refresh();
}

export async function saveReview(bookId: string, formData: FormData) {
  const db = getDb();
  const review = String(formData.get("review") ?? "").trim() || null;
  await db.update(books).set({ review }).where(eq(books.id, bookId));
  if (review) await db.insert(activity).values({ bookId, type: "reviewed" });
  refresh();
}

export async function removeBook(bookId: string) {
  await getDb().delete(books).where(eq(books.id, bookId));
  refresh();
  redirect("/shelves");
}

export async function createShelf(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await getDb().insert(shelves).values({ name: name.slice(0, 60) });
  refresh();
}

export async function deleteShelf(shelfId: number) {
  await getDb().delete(shelves).where(eq(shelves.id, shelfId));
  refresh();
}

export async function toggleShelf(bookId: string, shelfId: number) {
  const db = getDb();
  const where = and(eq(shelfBooks.bookId, bookId), eq(shelfBooks.shelfId, shelfId));
  const existing = await db.select().from(shelfBooks).where(where).limit(1);
  if (existing.length) await db.delete(shelfBooks).where(where);
  else await db.insert(shelfBooks).values({ bookId, shelfId });
  refresh();
}

export async function setGoal(formData: FormData) {
  const year = Number(formData.get("year"));
  const target = Math.round(Number(formData.get("target")));
  if (!year || !(target > 0)) return;
  await getDb()
    .insert(goals)
    .values({ year, target })
    .onConflictDoUpdate({ target: goals.year, set: { target } });
  refresh();
}
