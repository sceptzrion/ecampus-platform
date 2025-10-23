"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidelink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dosen/dashboard";

  const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <>
      {/* Judul section disembunyikan saat collapsed */}
      <li
        className={`py-2.5 px-5 text-[11px] font-semibold tracking-wider text-[#6e768e] ${
          collapsed ? "hidden" : "block"
        }`}
      >
        {title}
      </li>
      {children}
    </>
  );

  return (
    <ul className={`flex flex-col text-[#6e768e] ${collapsed ? "pt-0" : "pt-5"}`}>
      <Section title="MENU">
        <NavItem
          href="/dosen/dashboard"
          label="Dashboard"
          icon={isDashboard ? "/cubes.png" : "/dashboard-inactive.png"}
          active={isDashboard}
          collapsed={collapsed}
        />
      </Section>

      <Section title="PRAPERKULIAHAN">
        <NavItem
          href="/dosen/rps"
          label="RPS"
          icon="/checklist.png"
          active={pathname.startsWith("/dosen/rps")}
          collapsed={collapsed}
        />
      </Section>

      <Section title="PERKULIAHAN">
        <NavItem
          href="/dosen/pengajaran"
          label="Pengajaran"
          icon="/biodata.png"
          active={pathname.startsWith("/dosen/pengajaran")}
          collapsed={collapsed}
        />
        <NavItem
          href="/dosen/perwalian"
          label="Perwalian"
          icon="/hasil_checklist.png"
          active={pathname.startsWith("/dosen/perwalian")}
          collapsed={collapsed}
        />
      </Section>
    </ul>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  withBg,
  collapsed,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  withBg?: boolean;
  collapsed: boolean;
}) {
  return (
    <li className={`px-3 text-[15px] ${collapsed ? "py-0" : "py-1"}`}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center rounded-sm ${collapsed ? "py-[15px] justify-center" : "pl-2.5 pr-2 py-2"} transition-colors ${
          active ? "text-[#15B2C5] font-medium" : "hover:text-[#15B2C5]"
        }`}
        title={collapsed ? label : undefined} // tooltip saat collapsed
      >
        {withBg ? (
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded bg-[#6E768E] ${collapsed ? "mr-0" : "mr-3"}`}>
            <Image src={icon} alt={label} width={13} height={13} />
          </span>
        ) : (
          <Image className={`${collapsed ? "mr-0" : "mr-3"}`} src={icon} alt={label} {...(collapsed ? { width: 21, height: 21 } : { width: 18, height: 18 })} />
        )}

        {/* Teks disembunyikan saat collapsed */}
        <span
          className={`whitespace-nowrap transition-opacity duration-150 ${
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          }`}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}
