"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footermain";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false); // false = 240px, true = 72px

  return (
    <div className="min-h-svh bg-[#F1F2F4]">
      {/* Navbar fixed di atas, tinggi 70px */}
      <Navbar
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((v) => !v)}
      />

      {/* Body area: padding top = tinggi navbar */}
      <div className="pt-[70px]">
        {/* Sidebar fixed kiri; konten pakai margin-left yang berubah */}
        <Sidebar collapsed={collapsed} />

        <div
          className={`transition-[margin] duration-200 ease-out px-7`}
          // ml 240 saat expanded, 72 saat collapsed
          style={{ marginLeft: collapsed ? 72 : 240 }}
        >
          <main className="min-h-[calc(100svh-70px)] overflow-x-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
