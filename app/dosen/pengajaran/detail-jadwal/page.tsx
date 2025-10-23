import React from 'react'
import CardBody from '@/components/detail-jadwal/card_body'
import NavJadwal from '@/components/dosen/navs/nav_jadwal'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Jadwal",
};

const page = () => {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-row h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">
          Detail Jadwal
        </h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <a href="/dosen/dashboard" className="text-[#6c757d]">
            Dashboard
          </a>
          <span className="text-[#6c757d]">&gt;</span>
          <a href="/dosen/pengajaran" className="text-[#6c757d]">
            Pengajaran
          </a>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Detail Jadwal</span>
        </div>
      </div>

      {/* Back button */}
      <div className="flex bg-white p-6 justify-end mb-6 rounded-sm">
        <a href="/dosen/pengajaran" className="text-[#6c757d] font-semibold bg-[#E5E6E8] hover:bg-[#D6D8DB] rounded-sm px-3 py-1.5 text-sm">Kembali</a>
      </div>

      <CardBody />

      <div className="mt-6 flex flex-col gap-6">
        <NavJadwal />
      </div>
    </>
  )
}

export default page