"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Navlink = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Tutup dropdown kalau klik di luar area dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ul className="flex text-[#6C757D] text-[14px] leading-1.5 font-normal">
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
        <Link href="#" className="flex flex-row gap-1 items-center">
          <Image src="/lock.png" alt="prodi" width={15} height={15} />
          <span className="hidden md:flex">Mahasiswa (IF)</span>
        </Link>
      </li>

      {/* Dropdown User */}
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
            src="/pas_foto.jpg"
            alt="foto"
            width={32}
            height={32}
          />
          <span className="hidden md:flex ml-1">MUHAMAD IKHSAN RIZQI YANUAR</span>
          <Image src="/dropdown.png" className="hidden md:flex" alt="dropdown" width={10} height={10} />
        </button>

        {/* Dropdown menu dengan animasi */}
        <div
          className={`
            absolute right-0 top-full mt-5 w-42.5 p-1.25 bg-white border border-gray-200 
            rounded-md shadow-sm z-50 transform transition-all duration-200 ease-out
            ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
          `}
        >
          <p
            className="block px-5 py-3.75 text-xs font-bold text-[#343A40]"
          >
            Selamat datang !
          </p>
          <Link
            href="/#"
            className="block px-4 py-2 text-sm text-[#6c757d]"
          >
            <div className="flex flex-row gap-1.25">
                <Image src="/loop.png" alt="settings" width={20} height={15} />
                <p>Muat ulang</p>
            </div>
          </Link>
          <Link
            href="/auth/login"
            className="block px-4 py-2 text-sm text-[#6c757d]"
          >
            <div className="flex flex-row gap-1.25">
                <Image src="/logout.png" alt="settings" width={18} height={15} />
                <p>Keluar</p>
            </div>
          </Link>
        </div>
      </li>
    </ul>
  );
};

export default Navlink;
