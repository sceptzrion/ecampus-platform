"use client";

import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar di kiri */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {/* Navbar di atas */}
        <Navbar />

        {/* Konten */}
        <main className="flex-1 bg-[#F1F2F4]">{children}</main>
      </div>
    </div>
  );
}
