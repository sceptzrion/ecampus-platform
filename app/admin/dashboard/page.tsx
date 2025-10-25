"use client";

import { useEffect, useState } from "react";

type User = { id: number; name: string; email: string; role: string };

export default function DashboardDosen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // ubah title halaman manual
    document.title = "Dashboard - SISKA";

    // ambil data user dari localStorage
    const stored = localStorage.getItem("authUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <>
      <div className="flex flex-row h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">
          Dashboard
        </h1>
        <p className="hidden md:flex text-[#ACB4C8] font-normal text-[14px]">
          Dashboard
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xs">
          <h2 className="text-lg font-bold text-[#343A40]">
            Selamat datang {user ? user.name : "Pengguna"}!
          </h2>
          <p className="text-sm font-normal text-[#6c756d] leading-6">
            Anda masuk sebagai Admin.
          </p>
        </div>
      </div>
    </>
  );
}
