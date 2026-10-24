import type { ActivityType, BookStatus } from "@/db/schema";

export const STATUS_LABELS: Record<BookStatus, string> = {
  want: "Want to read",
  reading: "Reading",
  read: "Read",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  added: "Added to library",
  started: "Started reading",
  progress: "Read",
  finished: "Finished",
  rated: "Rated",
  reviewed: "Wrote a review",
};

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dateFmt = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatTime = (d: Date) => timeFmt.format(d);

/** English plural: 1 book, 2 books. */
export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

export const booksWord = (n: number) => `${n} ${plural(n, "book", "books")}`;
export const pagesWord = (n: number) => `${n} ${plural(n, "page", "pages")}`;

export function describeActivity(a: { type: ActivityType; value: number | null }) {
  const base = ACTIVITY_LABELS[a.type];
  if (a.type === "progress" && a.value) return `${base} ${pagesWord(a.value)}`;
  if (a.type === "rated" && a.value) return `${base} ${a.value}★`;
  return base;
}
