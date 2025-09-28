"use client";
import Image from "next/image";

type JadwalProps = {
  matkul: string;
  kode: string;
  sks: number;
  mode: string; // Online / Offline
  ruang: string;
  hariJam: string;
  kelas: string;
};

const Jadwal = ({
  matkul,
  kode,
  sks,
  mode,
  ruang,
  hariJam,
  kelas,
}: JadwalProps) => {
  return (
    <div className="relative w-full bg-white shadow-md rounded-xl border border-gray-100 p-5 mb-5 overflow-hidden  ">
      {/* Shadow kiri */}
      <div className="absolute top-0 left-0 h-full w-1 shadow-[ -4px_0_10px_0_#6658DD ]"></div>

      {/* Mata Kuliah */}
      <h2 className="text-lg font-semibold text-[#323a46] mb-3">{matkul}</h2>

      {/* Kode, SKS, Mode */}
      <div className="flex flex-wrap gap-2 text-sm mb-4">
        {/* Kode */}
        <span className="flex items-center justify-center gap-1 px-3 py-1 font-bold bg-[#6658DD] text-white rounded-md">
          <Image src="/qr-code.png" alt="kode" width={14} height={14} />
          {kode}
        </span>

        {/* SKS */}
        <span className="flex items-center justify-center gap-1 px-3 py-1 font-bold bg-[#6658DD] text-white rounded-md">
          <Image src="/bookmark.png" alt="sks" width={14} height={14} />
          {sks} SKS
        </span>

        {/* Mode */}
        <span className="flex items-center justify-center gap-1 px-3 py-1 font-bold bg-[#6658DD] text-white rounded-md">
          <Image src="/tag.png" alt="mode" width={14} height={14} />
          {mode}
        </span>
      </div>

      {/* Ruang dan Waktu */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1">
          <Image src="/clock.png" alt="Clock Icon" width={17} height={17} />
          <p className="text-sm font-semibold text-[#6C757D]">
            RUANG DAN WAKTU
          </p>
        </div>
        <p className="text-sm text-[#6658DD]">
          {ruang} - {hariJam}
        </p>
      </div>

      {/* Kelas */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1.5">
          <Image src="/calendar-gray.png" alt="kelas" width={17} height={17} />
          <p className="text-sm font-semibold text-[#6C757D]">KELAS</p>
        </div>
        <span className="w-fit text-sm px-2 py-1 font-bold text-white bg-[#6658DD] rounded-md">
          {kelas}
        </span>
      </div>

      {/* Detail Button */}
      <button className="group mt-2 px-3 py-2 text-sm bg-[#6658DD2E] text-[#6658DD] rounded-md hover:bg-[#6658DD] hover:text-white transition flex items-center gap-2">
        {/* Icon Normal */}
        <Image
          src="/eye.png"
          alt="eye icon"
          width={16}
          height={16}
          className="block group-hover:hidden"
        />
        {/* Icon Saat Hover */}
        <Image
          src="/eye-white.png"
          alt="eye white icon"
          width={16}
          height={16}
          className="hidden group-hover:block"
        />
        Detail Jadwal
      </button>
    </div>
  );
};

export default Jadwal;
