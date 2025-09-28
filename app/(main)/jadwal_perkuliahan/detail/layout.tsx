import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Jadwal",
};

export default function JadwalDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-row h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">
          Detail Jadwal
        </h1>
        <div className="flex flex-row gap-2.5 text-[14px] font-normal">
          <a href="/dashboard/dashboard-akademik" className="text-[#6c757d]">
            Dashboard
          </a>
          <span className="text-[#6c757d]">&gt;</span>
          <a href="/jadwal_perkuliahan" className="text-[#6c757d]">
            Perkuliahan
          </a>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Detail Jadwal</span>
        </div>
      </div>

      {/* Body Section */}
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </>
  );
}
