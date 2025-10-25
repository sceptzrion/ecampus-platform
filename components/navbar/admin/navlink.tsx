"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  user: { name: string; email: string; role: string };
};

const Navlink = ({ user }: Props) => {
  const [open, setOpen] = useState(false);
  const [nowStr, setNowStr] = useState<string>("");
  const dropdownRef = useRef<HTMLLIElement>(null);
  const router = useRouter();

  // === Realtime clock (Hari, dd/mm/yyyy | hh.mm.ss) ===
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hari = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        timeZone: "Asia/Jakarta",
      }).format(d);

      const tanggal = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(d)
        .replaceAll("-", "/"); // dd/mm/yyyy

      const waktu = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(d)
        .replace(/:/g, "."); // hh.mm.ss

      setNowStr(`${hari}, ${tanggal} | ${waktu}`);
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // === Tutup dropdown kalau klik di luar ===
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReload = () => {
    router.refresh();
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setOpen(false);
    router.push("/auth/login");
  };

  const roleLabel =
    user.role === "staff"
      ? "Dosen"
      : user.role === "student"
      ? "Mahasiswa"
      : user.role === "admin"
      ? "Admin"
      : "Pengguna";

  return (
    <ul className="flex items-center text-[#6C757D] text-[14px] leading-1.5 font-normal">
      {/* Waktu realtime di kiri */}
      <li className="px-[15px] hidden md:flex items-center font-mono tabular-nums">
        {nowStr}
      </li>

      {/* Tahun ajaran */}
      <li className="text-[14px] px-[15px] flex flex-row gap-1 items-center">
        <Link href="#" className="flex flex-row gap-1 items-center">
          <Image src="/calender.png" alt="calender" width={18} height={18} />
          <span className="hidden lg:flex">2025/2026 Ganjil</span>
        </Link>
      </li>

      <li className="text-[14px] px-[15px] flex items-center">
        <Link href="#" className="flex flex-row gap-1 items-center">
          <Image src="/id.png" alt="bahasa" width={23.81} height={16} />
          <span className="hidden md:flex">id</span>
        </Link>
      </li>

      <li className="text-[14px] px-[15px] flex items-center">
        <span className="flex flex-row gap-1 items-center">
          <Image src="/lock.png" alt="role" width={15} height={15} />
          <span className="hidden md:flex">{roleLabel}</span>
        </span>
      </li>

      {/* Dropdown user */}
      <li
        ref={dropdownRef}
        className="relative text-[14px] px-[15px] flex items-center cursor-pointer"
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-row gap-1 items-center focus:outline-none"
        >
          <Image
            className="rounded-full"
            src="/foto_dosen.jpg"
            alt="foto"
            width={32}
            height={32}
          />
          <span className="hidden md:flex ml-1">{user.name}</span>
          <Image
            src="/dropdown.png"
            className="hidden md:flex"
            alt="dropdown"
            width={10}
            height={10}
          />
        </button>

        <div
          className={`
            absolute right-0 top-full mt-5 w-42.5 p-1.25 bg-white border border-gray-200 
            rounded-md shadow-sm z-50 transform transition-all duration-200 ease-out
            ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
          `}
        >
          <p className="block px-5 py-3.75 text-xs font-bold text-[#343A40]">
            Selamat datang!
          </p>

          <button
            type="button"
            onClick={handleReload}
            className="w-full text-left px-4 py-2 text-sm text-[#6c757d] hover:bg-gray-50"
          >
            <div className="flex flex-row gap-1.25">
              <Image src="/loop.png" alt="reload" width={20} height={15} />
              <p>Muat ulang</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-[#6c757d] hover:bg-gray-50"
          >
            <div className="flex flex-row gap-1.25">
              <Image src="/logout.png" alt="logout" width={18} height={15} />
              <p>Keluar</p>
            </div>
          </button>
        </div>
      </li>
    </ul>
  );
};

export default Navlink;
