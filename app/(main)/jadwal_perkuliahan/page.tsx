import Footer from "@/components/footer";
import type { Metadata } from "next";
import Image from "next/image";
import Jadwal from "@/components/Jadwal_Card/jadwal";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardAkademik() {
  return (
    <div className="flex flex-col mt-[70px] ml-[240px] px-7 w-auto">
      {/* Header */}
      <div className="flex flex-row h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">
          Jadwal Perkuliahan
        </h1>
        <p className="text-[#ACB4C8] font-normal text-[14px]">
          Jadwal Perkuliahan
        </p>
      </div>

      {/* Switch View */}
      <div className="flex flex-col gap-4 p-6 bg-white rounded-xs">
        <div className="flex w-fit border-0">
          {/* List View Button */}
          <a className="flex items-center justify-center gap-1.5 min-w-[140px] h-[48px] text-base font-medium bg-[#6658DD] text-white rounded-l-xs">
            <Image src="/burger-white.png" width={18} height={18} alt="list" />
            <span>List View</span>
          </a>

          {/* Calendar View Button */}
          <a className="group flex items-center justify-center gap-1.5 min-w-[170px] h-[48px] text-base font-medium bg-[#6658DD2E] text-[#6658DD] hover:bg-[#6658DD] hover:text-white rounded-r-xs">
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full">
        <div className="flex w-full border my-8 bg-white border-gray-200 rounded overflow-hidden">
          <input
            type="text"
            placeholder="Mata Kuliah / Kode Kuliah"
            className="flex-1 px-4 py-2 text-sm text-[#323a46] focus:outline-none"
          />
          <button className="bg-[#6658DD] text-white text-sm font-medium px-6 py-2 rounded-r">
            Cari
          </button>
        </div>
      </div>

      {/* Jadwal Cards */}
      <main className="p-5">
        <Jadwal
          matkul="CAPSTONE PROJECT (FIK61575)"
          kode="2515520028"
          sks={3}
          mode="OFFLINE"
          ruang="FASILKOM 4.79-5"
          hariJam="Senin, 07:30 - 10:00 WIB"
          kelas="251-7A-22 - 251-7A-22"
        />
      </main>

      <main className="p-5">
        <Jadwal
          matkul="CAPSTONE PROJECT (FIK61575)"
          kode="2515520028"
          sks={3}
          mode="OFFLINE"
          ruang="FASILKOM 4.79-5"
          hariJam="Senin, 07:30 - 10:00 WIB"
          kelas="251-7A-22 - 251-7A-22"
        />
      </main>

      <Footer />
    </div>
  );
}
