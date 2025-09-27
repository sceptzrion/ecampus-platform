// app/layout.tsx
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SISKA",
    template: "%s - SISKA",
  },
  description: "Sistem Akademik Terintegrasi UNSIKA",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${nunito.className} antialiased`}>{children}</body>
    </html>
  );
}
