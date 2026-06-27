import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CaseProvider } from "@/lib/caseStore";
import { TopBar } from "@/components/TopBar";
import { SsoModal } from "@/components/SsoModal";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fineprint — systemic AI defense for tenants",
  description:
    "Fineprint is the B2B platform Legal Aid organizations and tenant unions use to catch predatory lease clauses at scale, with role-gated approval and a verifiable audit trail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${ibmPlexMono.variable}`}>
      <body style={{ minHeight: "100vh", background: "#F3F1EB", color: "#17150F" }}>
        <CaseProvider>
          <TopBar />
          {children}
          <SsoModal />
        </CaseProvider>
      </body>
    </html>
  );
}
