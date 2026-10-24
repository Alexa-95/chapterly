import type { BookResult } from "@/lib/google-books";

const API = "https://openlibrary.org";
const FIELDS = "key,title,subtitle,author_name,first_publish_year,number_of_pages_median,cover_i,subject";
const HEADERS = { "User-Agent": "Chapterly (reading journal)" };

/** Open Library work IDs look like "OL2097670W"; Google Books volume IDs never do. */
export const isOpenLibraryId = (id: string) => /^OL\d+W$/.test(id);

type Doc = {
  key: string;
  title?: string;
  subtitle?: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
};

export class OpenLibraryError extends Error {
  constructor(public status: number) {
    super(`Open Library API: ${status}`);
  }
}

function toResult(d: Doc, description: string | null = null): BookResult {
  return {
    id: d.key.replace("/works/", ""),
    title: [d.title, d.subtitle].filter(Boolean).join(": ") || "Untitled",
    authors: d.author_name ?? [],
    thumbnail: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    description,
    pageCount: d.number_of_pages_median ?? null,
    publishedDate: d.first_publish_year ? String(d.first_publish_year) : null,
    categories: (d.subject ?? []).slice(0, 3),
  };
}

async function search(q: string, limit: number) {
  const url = new URL(`${API}/search.json`);
  url.searchParams.set("q", q);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) throw new OpenLibraryError(res.status);
  return ((await res.json()) as { docs: Doc[] }).docs;
}

export async function searchOpenLibrary(query: string): Promise<BookResult[]> {
  // A bare ISBN only matches with the isbn: prefix
  const isbn = query.replace(/[\s-]/g, "");
  const q = /^(\d{9}[\dX]|\d{13})$/i.test(isbn) ? `isbn:${isbn}` : query;
  return (await search(q, 24)).map((d) => toResult(d));
}

export async function getWork(id: string): Promise<BookResult | null> {
  const [docs, work] = await Promise.all([
    search(`key:/works/${id}`, 1).catch(() => []),
    fetch(`${API}/works/${id}.json`, { headers: HEADERS, next: { revalidate: 86400 } })
      .then((r) => (r.ok ? (r.json() as Promise<{ description?: string | { value: string } }>) : null))
      .catch(() => null),
  ]);
  if (!docs.length) return null;
  const d = work?.description;
  return toResult(docs[0], (typeof d === "string" ? d : d?.value)?.trim() || null);
}
