import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { SessionSwitcher } from "@/components/SessionSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fineprint — systemic AI defense for tenants",
  description:
    "Fineprint is the B2B platform Legal Aid organizations and tenant unions use to catch predatory lease clauses at scale, with role-gated approval and a verifiable audit trail.",
};

const navLinks = [
  { href: "/connect", label: "Connect" },
  { href: "/watch", label: "Watch" },
  { href: "/audit", label: "Audit log" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SessionProvider>
          <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-20">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
              <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-seal text-paper text-sm font-bold">
                  F
                </span>
                Fineprint
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-ink-muted">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-seal transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <SessionSwitcher />
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink-muted">
            Fineprint — Scalekit × Actian × Render Hackathon, June 27. Running on mock adapters.
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
