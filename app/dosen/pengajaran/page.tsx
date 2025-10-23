import type { Metadata } from "next";
import Image from "next/image";
import PengajaranTable from "@/components/dosen/table-pengajaran/table_pengajaran";

export const metadata: Metadata = {
  title: "Pengajaran",
};

export default function Pengajaran() {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-row h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">
           Pengajaran
        </h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <a href="/dosen/dashboard" className="text-[#6c757d]">
            Dashboard
          </a>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Pengajaran</span>
        </div>
      </div>

      {/* Switch View */}
      <div className="flex flex-col gap-4 p-6 bg-white rounded-xs mb-6">
        <div className="flex w-fit border-0">
          {/* Calendar View Button */}
          <a className="group flex items-center justify-center gap-1.5 px-3.5 py-1.75 text-sm font-medium bg-[#6658DD2E] text-[#6658DD] hover:bg-[#6658DD] hover:text-white rounded-r-xs cursor-pointer">
            <Image
              src="/burger-purple.png"
              width={14}
              height={21}
              alt="list"
              className="block group-hover:hidden"
            />
            <Image
              src="/burger-white.png"
              width={14}
              height={21}
              alt="list"
              className="hidden group-hover:block"
            />
            <span>List View</span>
          </a>

          {/* Calendar View Button */}
          <a className="group flex items-center justify-center gap-1.5 px-3.5 py-1.75 text-sm font-medium bg-[#6658DD2E] text-[#6658DD] hover:bg-[#6658DD] hover:text-white rounded-r-xs cursor-pointer">
            <Image
              src="/calendar-purple.png"
              width={20}
              height={18}
              alt="calendar-purple"
              className="block group-hover:hidden"
            />
            <Image
              src="/calendar-white.png"
              width={20}
              height={18}
              alt="calendar-white"
              className="hidden group-hover:block"
            />
            <span>Calendar View</span>
          </a>

          {/* Table View Button */}
          <a className="flex items-center justify-center gap-1.5 px-3.5 py-1.75 text-sm font-medium bg-[#6658DD] text-white rounded-l-xs">
            <Image src="/table_view.png" width={14} height={21} alt="list" />
            <span>Table View</span>
          </a>
        </div>
      </div>
      <div className="bg-white rounded-xs px-6 py-5 w-full">
        <div className="overflow-x-auto">
            <PengajaranTable />
        </div>
      </div>
    </>
  );
}
