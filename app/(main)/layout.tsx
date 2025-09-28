"use client";

import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footermain";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen max-w-screen overflow-x-hidden">
      {/* Sidebar di kiri */}
      <Sidebar />

      {/* Area kanan */}
      <div className="flex flex-col flex-1">
        {/* Navbar di atas */}
        <Navbar />

        {/* Konten + footer, dengan margin kiri/atas */}
        <div className="flex flex-col flex-1 bg-[#F1F2F4] mt-[70px] ml-[240px] w-auto px-7">
          {/* Konten */}
          <main className="flex-1">{children}</main>

          {/* Footer (ikut margin kiri/atas) */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
