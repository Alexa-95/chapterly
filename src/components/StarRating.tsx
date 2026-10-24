"use client";

import { useState, useTransition } from "react";
import { rateBook } from "@/lib/actions";

type Props = { bookId?: string; value: number | null; readOnly?: boolean };

export default function StarRating({ bookId, value, readOnly }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [current, setCurrent] = useState(value ?? 0);
  const [pending, startTransition] = useTransition();
  const shown = hover ?? current;

  if (readOnly || !bookId) {
    return (
      <span className="stars stars-static" aria-label={`Ocena ${value ?? 0} na 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= (value ?? 0) ? "on" : undefined}>★</span>
        ))}
      </span>
    );
  }

  const choose = (n: number) => {
    const next = n === current ? 0 : n;
    setCurrent(next);
    startTransition(() => rateBook(bookId, next));
  };

  return (
    <span className="stars" onMouseLeave={() => setHover(null)} data-pending={pending || undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= shown ? "on" : undefined}
          onMouseEnter={() => setHover(n)}
          onClick={() => choose(n)}
          aria-label={`Oceń na ${n}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
