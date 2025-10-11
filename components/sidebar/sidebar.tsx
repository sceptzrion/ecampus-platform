"use client";

import Sidelink from "@/components/sidebar/sidelink";

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <aside
      id="app-sidebar"
      className={[
        "fixed left-0 top-[70px] z-[1500] h-[calc(100svh-70px)] bg-white border-r border-[#e9ecef]",
        "transition-transform duration-200 ease-out overflow-hidden",
        // MOBILE: default hidden, slide-in saat open
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "w-[240px]",                 // lebar saat mobile open
        // DESKTOP: selalu terlihat, lebar collapse/expand, dan tidak pakai translate
        "lg:translate-x-0 lg:w-auto",
      ].join(" ")}
      // width desktop diatur lewat child wrapper biar tidak bentrok dengan mobile width
    >
      <div
        className={[
          "h-full overflow-y-auto",
          "hidden lg:block",                       // wrapper desktop
          collapsed ? "lg:w-[72px]" : "lg:w-[240px]",
        ].join(" ")}
      >
        <Sidelink collapsed={collapsed} />
      </div>

      {/* Versi mobile punya container sendiri (tampil hanya saat mobile) */}
      <div className="h-full overflow-y-auto lg:hidden">
        <Sidelink collapsed={false} />
      </div>
    </aside>
  );
}
