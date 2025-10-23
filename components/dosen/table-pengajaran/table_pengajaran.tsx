"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PengajaranTable() {
  const router = useRouter();

  // Dummy data jadwal
  const jadwal = [
    {
      id: 1,
      nama: "PEMROGRAMAN BERBASIS MOBILE",
      kode: "#2315520003",
      sks: "3 SKS",
      mode: "Offline",
      ruang: "Ruang Kuliah 1 (KULIAH1)",
      waktu: "Senin, 07:00 - 08:40 WIB",
      kelas: "D - 2315520003",
    },
    {
      id: 2,
      nama: "FRAMEWORK PEMROGRAMAN WEB",
      kode: "#2315520045",
      sks: "3 SKS",
      mode: "Offline",
      ruang: "Ruang Kuliah 1 (KULIAH1)",
      waktu: "Senin, 07:00 - 08:40 WIB",
      kelas: "ULANG - 2315520045",
    },
    {
      id: 3,
      nama: "Pengantar Literasi Digital",
      kode: "#2318620214",
      sks: "2 SKS",
      mode: "Offline",
      ruang: "Ruang Kuliah 1 (KULIAH1)",
      waktu: "Senin, 07:00 - 08:40 WIB",
      kelas: "G23 - 2318620214",
    },
  ];

  const goDetail = () => {
    router.push("/dosen/pengajaran/detail-jadwal");
  };

  return (
    <>
      <table className="min-w-max w-full">
        <thead>
          <tr className="text-left text-[#6c757d] text-sm  border-b-2 border-[#EAECEF]">
            <th className="w-[40px] py-3">#</th>
            <th className="w-[350px]">Nama Mata Kuliah</th>
            <th className="w-[260px]">Ruang & Waktu</th>
            <th className="w-[200px]">Kelas</th>
            <th className="w-[100px] text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {jadwal.map((item, index) => (
            <tr
              key={item.id}
              className="bg-white hover:bg-gray-50 text-sm border-b-2 border-[#EAECEF] rounded"
            >
              <td className="text-[#6c757d] text-sm">{index + 1}</td>
              <td className="py-2.5">
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-[#323a46]">
                    {item.nama}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="bg-[#69737A] text-white font-bold text-[10px] px-1.25 py-0.5 flex items-center justify-center rounded text-xs">
                      {item.kode}
                    </span>
                    <span className="bg-[#41BFE5] text-white font-bold text-[10px] px-1.25 py-0.5 flex items-center justify-center rounded text-xs">
                      {item.sks}
                    </span>
                    <span className="bg-[#16BC99] text-white font-bold text-[10px] px-1.25 py-0.5 flex items-center justify-center rounded text-xs">
                      {item.mode}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-1">
                <div className="flex flex-col text-[11px] font-extrabold text-gray-700 w-fit bg-[#F6B841] rounded-sm px-1 py-0.5">
                  <div className="flex items-center gap-0.5">
                    <Image src="/building.png" alt="ruang" width={17} height={17} />
                    <span>{item.ruang}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Image src="/calendar-black.png" alt="clock" width={14} height={14} />
                    <span>{item.waktu}</span>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className="bg-[#6759E0] text-white font-bold text-[10px] px-1 py-0.5 rounded flex items-center justify-center w-fit flex-row gap-1">
                  <Image src="/biodata-white.png" alt="kelas" width={16} height={16} />
                  {item.kelas}
                </span>
              </td>
              <td className="py-1.5 text-center">
                <button
                  type="button"
                  onClick={goDetail}
                  aria-label="Lihat detail jadwal"
                  className="bg-[#F6B841] hover:bg-[#e0a800] text-white rounded p-2.5 transition"
                >
                  <Image src="/eye.png" alt="view" width={13} height={13} className="mx-auto" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
