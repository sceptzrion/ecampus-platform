"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer/footerauth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true); // 👈 untuk menahan render login

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const user = JSON.parse(raw);
        // redirect sesuai domain
        if (user?.email?.endsWith?.("@staff.unsika.ac.id")) {
          router.replace("/dosen/dashboard");
        } else if (user?.email?.endsWith?.("@student.unsika.ac.id")) {
          router.replace("/dashboard/dashboard-akademik");
        } else {
          router.replace("/dashboard/dashboard-akademik");
        }
        return; // hentikan render login
      }
    } catch {
      localStorage.removeItem("authUser");
    } finally {
      setChecking(false); // selesai cek
    }
  }, [router]);

  // selama pengecekan, tampilkan layar kosong / loader
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00acc1] text-white">
        Loading...
      </div>
    );
  }

  // render halaman login hanya kalau belum login
  return (
    <main className="min-h-screen p-3 sm:p-0 flex flex-col items-center justify-center bg-[#00acc1]">
      <div className="flex flex-col w-full sm:w-[516px] md:w-[456px] xl:w-[416px] h-full mt-18 mb-24 rounded-sm p-9 bg-white">
        {children}
      </div>
      <Footer />
    </main>
  );
}
