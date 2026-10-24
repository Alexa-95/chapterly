import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty card">
      <h1>Ta strona się nie zachowała</h1>
      <p className="muted">Może kartka wypadła z książki?</p>
      <Link href="/" className="link">Wróć na pulpit →</Link>
    </div>
  );
}
