import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard - SISKA",
  description: "Sistem Akademik Terintegrasi Unsika",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <div className="flex flex-col">
          <Navbar />
          <Sidebar />
        </div>
        <main className="bg-[#F1F2F4] min-h-screen">{children}</main>
      </body>
    </html>
  );
}
