"use client";

import Image from "next/image";
import Navlink from "@/components/navbar/admin/navlink";

type User = { id: number; name: string; email: string; role: string };

export default function Navbar({
  collapsed,
  mobileOpen,
  onToggleSidebar,
  user,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  user: User; // <<< baru
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-[2000] h-[70px] bg-white border-b border-[#e9ecef]">
      <div className="flex h-full items-center justify-between pr-3">
        {/* Kiri: rail + burger */}
        <div className="flex items-center ml-3.5 lg:ml-0 gap-9 lg:gap-2">
          {/* RAIL LOGO — desktop */}
          <div
            className="relative hidden lg:block transition-[width] duration-200 ease-out"
            style={{ width: collapsed ? 72 : 240 }}
            aria-hidden="false"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 text-[14px] text-[#7669E0]">
                <Image src="/logo_usk.png" alt="UNSIKA" width={28.73} height={35} priority />
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

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center">
            <Image src="/logo_usk.png" alt="UNSIKA" width={28.73} height={35} priority />
          </div>

          {/* Burger */}
          <button
            type="button"
            aria-label="Toggle sidebar"
            aria-controls="app-sidebar"
            aria-expanded={mobileOpen || !collapsed}
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded"
          >
            <Image src="/burger_menu.png" alt="menu" width={24} height={24} />
          </button>
        </div>

        {/* Kanan */}
        <Navlink user={user} />
      </div>
    </header>
  );
}
