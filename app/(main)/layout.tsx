"use client";

import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footermain";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-screen overflow-x-hidden">
      <div className="flex flex-row w-full">
        {/* Navbar di atas */}
        <Navbar />

        <div className="flex max-w-screen w-full">
        {/* Sidebar di kiri */}
        <div className="">
        <Sidebar />
        </div>

        {/* Area kanan */}
        <div className="flex flex-col max-w-screen w-[calc(100%-240px)] bg-[#F1F2F4] mt-[70px] px-7">
            {/* Konten */}
            <main className="overflow-x-auto">{children}</main>

            {/* Footer (ikut margin kiri/atas) */}
            <Footer />

          {/* Konten + footer, dengan margin kiri/atas */}
        </div>

        </div>

      </div>
    </div>
  );
}
