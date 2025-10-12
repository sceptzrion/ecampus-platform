"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footermain";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) setCollapsed(v => !v);
    else setMobileOpen(v => !v);
  };

  return (
    <div className="min-h-svh bg-[#F1F2F4]">
      <Navbar collapsed={collapsed} mobileOpen={mobileOpen} onToggleSidebar={toggleSidebar} />
      {mobileOpen && <div className="fixed inset-0 z-[1400] bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className="pt-[70px]">
        <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className={`px-4 sm:px-7 transition-[margin] duration-200 ease-out ml-0 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"}`}>
          <main className="min-h-[calc(100svh-70px)] overflow-x-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
