"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footermain";

type User = { id: number; name: string; email: string; role: string };

export default function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  // helper: set flag + redirect login
  const goLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("preLoginRedirect", "1");
    }
    router.replace("/auth/login?unauthorized=1");
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // proteksi: wajib login + role student
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
      if (!raw) return goLogin();

      const parsed: User = JSON.parse(raw);
      if (!parsed?.role || parsed.role !== "student") {
        localStorage.removeItem("authUser");
        return goLogin();
      }
      setUser(parsed);
    } catch {
      localStorage.removeItem("authUser");
      goLogin();
    } finally {
      setLoading(false);
    }
  }, [router]);

  const toggleSidebar = () => {
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) setCollapsed(v => !v);
    else setMobileOpen(v => !v);
  };

  if (loading) {
    return (
      <div className="min-h-svh grid place-items-center text-gray-500">
        Memuat...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-svh bg-[#F1F2F4]">
      <Navbar collapsed={collapsed} mobileOpen={mobileOpen} onToggleSidebar={toggleSidebar} user={user} />
      {mobileOpen && (
        <div className="fixed inset-0 z-[1400] bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
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
