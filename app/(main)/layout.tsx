"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footermain";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false); // desktop: false=240px, true=72px
  const [mobileOpen, setMobileOpen] = useState(false); // mobile: default hidden

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((v) => !v);      // desktop behavior
    } else {
      setMobileOpen((v) => !v);     // mobile behavior
    }
  };

  return (
    <div className="min-h-svh bg-[#F1F2F4]">
      {/* Navbar fixed di atas, tinggi 70px */}
      <Navbar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Overlay hanya untuk mobile saat sidebar terbuka */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1400] bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="pt-[70px]">
        {/* Sidebar: tahu dua mode */}
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Konten kanan:
            - mobile: ml-0
            - desktop: ml 72/240 mengikuti collapsed  */}
        <div
          className={`px-4 sm:px-7 transition-[margin] duration-200 ease-out ml-0 ${
            collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
          }`}
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
