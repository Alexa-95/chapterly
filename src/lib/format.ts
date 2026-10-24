import type { ActivityType, BookStatus } from "@/db/schema";

export const STATUS_LABELS: Record<BookStatus, string> = {
  want: "Chcę przeczytać",
  reading: "Czytam",
  read: "Przeczytane",
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  added: "Dodano do biblioteki",
  started: "Rozpoczęto czytanie",
  progress: "Przeczytano",
  finished: "Ukończono",
  rated: "Oceniono",
  reviewed: "Napisano recenzję",
};

export const MONTHS_SHORT = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (d: Date) => dateFmt.format(d);
export const formatTime = (d: Date) => timeFmt.format(d);

/** Polska odmiana: 1 książka, 2 książki, 5 książek. */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const booksWord = (n: number) => `${n} ${plural(n, "książka", "książki", "książek")}`;
export const pagesWord = (n: number) => `${n} ${plural(n, "strona", "strony", "stron")}`;

export function describeActivity(a: { type: ActivityType; value: number | null }) {
  const base = ACTIVITY_LABELS[a.type];
  if (a.type === "progress" && a.value) return `${base} ${a.value} ${plural(a.value, "stronę", "strony", "stron")}`;
  if (a.type === "rated" && a.value) return `${base} na ${a.value}★`;
  return base;
}
