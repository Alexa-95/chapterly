import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

// Every page reads from the D1 database at request time
export const dynamic = "force-dynamic";

const serif = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-serif", weight: ["400", "500", "600"] });
const sans = Nunito_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Chapterly — reading journal", template: "%s · Chapterly" },
  description: "Track your books, reading and your own reviews.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <div className="backdrop" aria-hidden />
        <Nav />
        <main className="container">{children}</main>
        <footer className="footer">
          <span>Chapterly</span> · every chapter counts
        </footer>
      </body>
    </html>
  );
}
