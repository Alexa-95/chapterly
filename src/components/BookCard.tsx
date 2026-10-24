import Link from "next/link";
import type { Book } from "@/db/schema";
import BookCover from "@/components/BookCover";
import ProgressBar from "@/components/ProgressBar";
import StarRating from "@/components/StarRating";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.id}`} className="book-card">
      <BookCover title={book.title} thumbnail={book.thumbnail} />
      <div className="book-card-body">
        <h3>{book.title}</h3>
        {book.authors && <p className="muted">{book.authors}</p>}
        {book.status === "reading" && book.pageCount ? (
          <>
            <ProgressBar value={book.currentPage} max={book.pageCount} />
            <p className="tiny muted">
              {book.currentPage} / {book.pageCount} str.
            </p>
          </>
        ) : null}
        {book.status === "read" && book.rating ? <StarRating value={book.rating} readOnly /> : null}
      </div>
    </Link>
  );
}
