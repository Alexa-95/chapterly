import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

// Wszystkie strony czytają z bazy D1 w czasie żądania
export const dynamic = "force-dynamic";

const serif = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-serif", weight: ["400", "500", "600"] });
const sans = Nunito_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Chapterly — dziennik czytelniczy", template: "%s · Chapterly" },
  description: "Śledź książki, czytanie i własne recenzje.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <div className="backdrop" aria-hidden />
        <Nav />
        <main className="container">{children}</main>
        <footer className="footer">
          <span>Chapterly</span> · każdy rozdział się liczy
        </footer>
      </body>
    </html>
  );
}
