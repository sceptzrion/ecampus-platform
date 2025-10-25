"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;                 // path icon di /public
  withBg?: boolean;
  isActive: (path: string) => boolean;
};

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
        className={`group flex items-center rounded-sm ${
          collapsed ? "py-[15px] justify-center" : "pl-2.5 pr-2 py-2"
        } transition-colors ${
          active ? "text-[#15B2C5] font-medium" : "hover:text-[#15B2C5]"
        }`}
        title={collapsed ? label : undefined}
      >
        {withBg ? (
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded bg-[#6E768E] ${
              collapsed ? "mr-0" : "mr-3"
            }`}
          >
            <Image src={icon} alt={label} width={13} height={13} />
          </span>
        ) : (
          <Image
            className={`${collapsed ? "mr-0" : "mr-3"}`}
            src={icon}
            alt={label}
            {...(collapsed ? { width: 21, height: 21 } : { width: 18, height: 18 })}
          />
        )}

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

function Section({
  title,
  collapsed,
  children,
}: {
  title: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
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
}

export default function Sidelink({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  // ────────────── MENU ──────────────
  const menuItems: Item[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: pathname === "/admin/dashboard" ? "/cubes.png" : "/dashboard-inactive.png",
      isActive: (p) => p === "/admin/dashboard",
    },
  ];

  // ────────────── DATA MASTER (CRUD) ──────────────
  // Sessions DIHAPUS (sudah dikelola dalam Classes)
  const masterItems: Item[] = [
    {
      href: "/admin/users",
      label: "Users",
      icon: "/biodata.png", // ganti sesuai icon-mu
      isActive: (p) => p.startsWith("/admin/users"),
    },
    {
      href: "/admin/classes",
      label: "Classes",
      icon: "/biodata.png", // ganti sesuai icon-mu
      isActive: (p) => p.startsWith("/admin/classes"),
    },
  ];

  // ────────────── PRESENSI ──────────────
  const presenceItems: Item[] = [
    {
      href: "/admin/attendance",
      label: "Attendance",
      icon: "/checklist.png",
      isActive: (p) => p.startsWith("/admin/attendance"),
    },
    {
      href: "/admin/rfid-logs",
      label: "RFID Logs",
      icon: "/hasil_checklist.png",
      isActive: (p) => p.startsWith("/admin/rfid-logs"),
    },
  ];

  // ────────────── PENGATURAN ──────────────
  const settingsItems: Item[] = [
    {
      href: "/admin/admins",
      label: "Admins",
      icon: "/lock.png",
      isActive: (p) => p.startsWith("/admin/admins"),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: "/dropdown.png", // siapkan icon /public/settings.png
      isActive: (p) => p.startsWith("/admin/settings"),
    },
  ];

  return (
    <ul className={`flex flex-col text-[#6e768e] ${collapsed ? "pt-0" : "pt-5"}`}>
      {/* MENU */}
      <Section title="MENU" collapsed={collapsed}>
        {menuItems.map((it) => (
          <NavItem
            key={it.href}
            href={it.href}
            label={it.label}
            icon={it.icon}
            active={it.isActive(pathname)}
            collapsed={collapsed}
          />
        ))}
      </Section>

      {/* DATA MASTER */}
      <Section title="DATA MASTER" collapsed={collapsed}>
        {masterItems.map((it) => (
          <NavItem
            key={it.href}
            href={it.href}
            label={it.label}
            icon={it.icon}
            active={it.isActive(pathname)}
            collapsed={collapsed}
          />
        ))}
      </Section>

      {/* PRESENSI */}
      <Section title="PRESENSI" collapsed={collapsed}>
        {presenceItems.map((it) => (
          <NavItem
            key={it.href}
            href={it.href}
            label={it.label}
            icon={it.icon}
            active={it.isActive(pathname)}
            collapsed={collapsed}
          />
        ))}
      </Section>

      {/* PENGATURAN */}
      <Section title="PENGATURAN" collapsed={collapsed}>
        {settingsItems.map((it) => (
          <NavItem
            key={it.href}
            href={it.href}
            label={it.label}
            icon={it.icon}
            active={it.isActive(pathname)}
            collapsed={collapsed}
          />
        ))}
      </Section>
    </ul>
  );
}
