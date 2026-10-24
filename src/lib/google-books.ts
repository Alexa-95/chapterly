import { getEnv } from "@/lib/db";

const API = "https://www.googleapis.com/books/v1/volumes";

export type BookResult = {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  description: string | null;
  pageCount: number | null;
  publishedDate: string | null;
  categories: string[];
};

type Volume = {
  id: string;
  volumeInfo: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    publishedDate?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

function toResult(v: Volume): BookResult {
  const info = v.volumeInfo;
  const thumb = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
  return {
    id: v.id,
    title: [info.title, info.subtitle].filter(Boolean).join(": ") || "Bez tytułu",
    authors: info.authors ?? [],
    thumbnail: thumb ? thumb.replace(/^http:/, "https:") : null,
    description: info.description ? stripHtml(info.description) : null,
    pageCount: info.pageCount ?? null,
    publishedDate: info.publishedDate ?? null,
    categories: info.categories ?? [],
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function withKey(url: URL) {
  const key = getEnv().GOOGLE_BOOKS_API_KEY;
  if (key) url.searchParams.set("key", key);
  return url;
}

export class GoogleBooksError extends Error {
  constructor(public status: number) {
    super(`Google Books API: ${status}`);
  }
}

export async function searchBooks(query: string): Promise<BookResult[]> {
  const url = new URL(API);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "24");
  url.searchParams.set("printType", "books");
  const res = await fetch(withKey(url), { next: { revalidate: 3600 } });
  if (!res.ok) throw new GoogleBooksError(res.status);
  const data = (await res.json()) as { items?: Volume[] };
  return (data.items ?? []).map(toResult);
}

export async function getVolume(id: string): Promise<BookResult | null> {
  const res = await fetch(withKey(new URL(`${API}/${encodeURIComponent(id)}`)), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  return toResult((await res.json()) as Volume);
}
