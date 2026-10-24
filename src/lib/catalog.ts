import { getVolume, searchBooks as searchGoogle, type BookResult } from "@/lib/google-books";
import { getWork, isOpenLibraryId, searchOpenLibrary } from "@/lib/open-library";

export type { BookResult };

/** Open Library first (better coverage of Polish books), Google Books as a fallback. */
export async function searchBooks(query: string): Promise<BookResult[]> {
  try {
    return await searchOpenLibrary(query);
  } catch {
    return searchGoogle(query);
  }
}

export function getBook(id: string): Promise<BookResult | null> {
  return isOpenLibraryId(id) ? getWork(id) : getVolume(id);
}
