import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty card">
      <h1>This page didn't survive</h1>
      <p className="muted">Maybe it fell out of the book?</p>
      <Link href="/" className="link">Back to the dashboard →</Link>
    </div>
  );
}
