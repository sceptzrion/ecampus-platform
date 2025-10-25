"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;
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
  const starts = (base: string) => (p: string) => p === base || p.startsWith(base + "/");

  const isDevToolsEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "1" || process.env.NODE_ENV !== "production";

  const menuItems: Item[] = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: pathname === "/admin/dashboard" ? "/cubes.png" : "/dashboard-inactive.png",
      isActive: (p) => p === "/admin/dashboard",
    },
  ];

  const masterItems: Item[] = [
    { href: "/admin/users", label: "Users", icon: "/biodata.png", isActive: starts("/admin/users") },
    { href: "/admin/rooms", label: "Rooms", icon: "/calender.png", isActive: starts("/admin/rooms") },
    { href: "/admin/classes", label: "Classes", icon: "/biodata.png", isActive: starts("/admin/classes") },
  ];

  const infraItems: Item[] = [
    { href: "/admin/readers", label: "RFID Readers", icon: "/hasil_checklist.png", isActive: starts("/admin/readers") },
  ];

  const presenceItems: Item[] = [
    { href: "/admin/attendance", label: "Attendance", icon: "/checklist.png", isActive: starts("/admin/attendance") },
    { href: "/admin/rfid-logs", label: "RFID Logs", icon: "/hasil_checklist.png", isActive: starts("/admin/rfid-logs") },
  ];

  const settingsItems: Item[] = [
    { href: "/admin/settings", label: "Settings", icon: "/dropdown.png", isActive: starts("/admin/settings") },
  ];

  // tampilkan Dev Tools jika aktif
  if (isDevToolsEnabled) {
    settingsItems.unshift({
      href: "/admin/dev-tools",
      label: "Dev Tools",
      icon: "/dashboard-inactive.png",
      isActive: starts("/admin/dev-tools"),
    });
  }

  return (
    <ul className={`flex flex-col text-[#6e768e] ${collapsed ? "pt-0" : "pt-5"}`}>
      <Section title="MENU" collapsed={collapsed}>
        {menuItems.map((it) => (
          <NavItem key={it.href} {...it} active={it.isActive(pathname)} collapsed={collapsed} />
        ))}
      </Section>

      <Section title="DATA MASTER" collapsed={collapsed}>
        {masterItems.map((it) => (
          <NavItem key={it.href} {...it} active={it.isActive(pathname)} collapsed={collapsed} />
        ))}
      </Section>

      <Section title="INFRASTRUKTUR" collapsed={collapsed}>
        {infraItems.map((it) => (
          <NavItem key={it.href} {...it} active={it.isActive(pathname)} collapsed={collapsed} />
        ))}
      </Section>

      <Section title="PRESENSI" collapsed={collapsed}>
        {presenceItems.map((it) => (
          <NavItem key={it.href} {...it} active={it.isActive(pathname)} collapsed={collapsed} />
        ))}
      </Section>

      <Section title="PENGATURAN" collapsed={collapsed}>
        {settingsItems.map((it) => (
          <NavItem key={it.href} {...it} active={it.isActive(pathname)} collapsed={collapsed} />
        ))}
      </Section>
    </ul>
  );
}
