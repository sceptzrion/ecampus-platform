"use client";

import Image from "next/image";
import Navlink from "@/components/navbar/navlink";

export default function Navbar({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-[2000] h-[70px] bg-white">
      <div className="flex h-full items-center justify-between pr-3">
        {/* Kiri: Rail logo (center) + Burger */}
        <div className="flex items-center gap-2">
          {/* RAIL LOGO: lebarnya mengikuti lebar sidebar */}
          <div
            className={`relative transition-[width] duration-200 ease-out`}
            style={{ width: collapsed ? 72 : 240 }}
            aria-hidden="false"
          >
            {/* Isi rail selalu di-center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[14px] text-[#7669E0]">
                <Image
                  src="/logo_usk.png"
                  alt="UNSIKA"
                  width={28.73}
                  height={35}
                  priority
                />
                {/* Teks hanya muncul saat sidebar OPEN */}
                <span
                  className={`font-medium tracking-wide transition-opacity duration-150 ${
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  }`}
                >
                  SISKA
                </span>
              </div>
            </div>
          </div>

          {/* BURGER: tidak mengganggu posisi center logo */}
          <button
            type="button"
            aria-label="Toggle sidebar"
            aria-pressed={collapsed}
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded"
          >
            <Image src="/burger_menu.png" alt="menu" width={24} height={24} />
          </button>
        </div>

        {/* Kanan: link/aksi user */}
        <Navlink />
      </div>
    </header>
  );
}
