"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "/", label: "Pulpit" },
  { href: "/search", label: "Szukaj" },
  { href: "/shelves", label: "Półki" },
  { href: "/goals", label: "Cele" },
  { href: "/stats", label: "Statystyki" },
  { href: "/history", label: "Historia" },
];

export default function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <Logo />
          <span>Chapterly</span>
        </Link>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
