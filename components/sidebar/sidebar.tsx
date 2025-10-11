"use client";

import Sidelink from "@/components/sidebar/sidelink";

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={[
        "fixed left-0 top-[70px] z-[1500] h-[calc(100svh-70px)] bg-white border-r border-[#e9ecef]",
        "transition-[width] duration-200 ease-out overflow-hidden",
        collapsed ? "w-[70px]" : "w-[240px]",
      ].join(" ")}
    >
      {/* scroll bila tinggi melebihi viewport */}
      <div className="h-full overflow-y-auto">
        <Sidelink collapsed={collapsed} />
      </div>
    </aside>
  );
}
