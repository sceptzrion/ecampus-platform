"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidelink() {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard/dashboard-akademik";

  return (
    <ul className="flex flex-col text-[#7D849A]">
      {/* MENU */}
      <li className="py-2.5 px-5 text-[11px] font-semibold tracking-wider text-[#9A9FB0]">
        MENU
      </li>
      <NavItem
        href="/dashboard/dashboard-akademik"
        label="Dashboard"
        icon={isDashboard ? "/cubes.png" : "/dashboard-inactive.png"}
        active={isDashboard}
      />

      {/* DATA DASAR */}
      <li className="py-2.5 px-5 text-[11px] font-semibold tracking-wider text-[#9A9FB0]">
        DATA DASAR
      </li>
      <NavItem
        href="/biodata-mahasiswa"
        label="Biodata Mahasiswa"
        icon="/biodata.png"
        active={pathname.startsWith("/biodata-mahasiswa")}
      />

      {/* PRAPERKULIAHAN */}
      <li className="py-2.5 px-5 text-[11px] font-semibold tracking-wider text-[#9A9FB0]">
        PRAPERKULIAHAN
      </li>
      <NavItem
        href="/registrasi/detail"
        label="Registrasi"
        icon="/biodata.png"
        active={pathname.startsWith("/registrasi/detail")}
      />
      <NavItem
        href="/krs-mahasiswa"
        label="Rencana Studi"
        icon="/checklist.png"
        active={pathname.startsWith("/krs-mahasiswa")}
      />

      {/* PERKULIAHAN */}
      <li className="py-2.5 px-5 text-[11px] font-semibold tracking-wider text-[#9A9FB0]">
        PERKULIAHAN
      </li>
      <NavItem
        href="/jadwal_perkuliahan"
        label="Jadwal Perkuliahan"
        icon="/checklist.png"
        active={pathname.startsWith("/jadwal_perkuliahan")}
      />
      <NavItem
        href="/hasil-studi"
        label="Hasil Studi"
        icon="/hasil_checklist.png"
        active={pathname.startsWith("/hasil-studi")}
      />

      {/* TUGAS AKHIR */}
      <li className="py-2.5 px-5 text-[11px] font-semibold tracking-wider text-[#9A9FB0]">
        TUGAS AKHIR
      </li>
      <NavItem
        href="/tugas-akhir-mahasiswa"
        label="Tugas Akhir"
        icon="/tukhir.png"
        active={pathname.startsWith("/tugas-akhir-mahasiswa")}
        withBg
      />
    </ul>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  withBg,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  withBg?: boolean;
}) {
  return (
    <li className="py-3 px-5 text-[15px]">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-row items-center transition-colors ${
          active ? "text-[#15B2C5] font-medium" : "hover:text-[#15B2C5]"
        }`}
      >
        {withBg ? (
          <span className="ml-[3px] mr-2.5 inline-flex items-center justify-center w-5 h-5 rounded bg-[#6E768E]">
            <Image src={icon} alt={label} width={13} height={13} />
          </span>
        ) : (
          <Image
            className="ml-[3px] mr-2.5"
            src={icon}
            alt={label}
            width={18}
            height={18}
          />
        )}
        <span>{label}</span>
      </Link>
    </li>
  );
}
