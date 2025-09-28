"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const goDetail = () => {
    router.push("/jadwal_perkuliahan/detail/capstone-project");
  };

  return (
    <div className="relative w-full bg-white border-l-3 border-[#6658dd] rounded-l-sm p-5 mb-5 overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-1 shadow-[-4px_0_10px_0_#6658DD]" />
      <h2 className="text-lg font-bold text-[#323a46] mb-3">{matkul}</h2>

      <div className="flex flex-wrap gap-1 text-[10.5px] text-sm mb-1.5">
        <span className="flex items-center justify-center gap-1 px-1 py-0.25 leading-0 font-bold bg-[#6658DD] text-white rounded-sm">
          <Image src="/qr-code.png" alt="kode" width={14} height={14} />
          {kode}
        </span>
        <span className="flex items-center justify-center gap-1 px-1 py-0.25 font-bold bg-[#6658DD] text-white rounded-sm">
          <Image src="/bookmark.png" alt="sks" width={14} height={14} />
          {sks} SKS
        </span>
        <span className="flex items-center justify-center gap-1 px-1 py-0.25 font-bold bg-[#6658DD] text-white rounded-sm">
          <Image src="/tag.png" alt="mode" width={14} height={14} />
          {mode}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-1 mb-1">
          <Image src="/clock.png" alt="Clock Icon" width={17} height={17} />
          <p className="text-sm font-semibold text-[#6C757D]">RUANG DAN WAKTU</p>
        </div>
        <p className="text-[13px] font-medium text-[#6658DD]">
          {ruang} - {hariJam}
        </p>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-1">
          <Image src="/calendar-gray.png" alt="kelas" width={17} height={17} />
          <p className="text-sm font-bold text-[#6C757D]">KELAS</p>
        </div>
        <span className="w-fit text-[10.5px] px-1 py-0.25 font-bold text-white bg-[#6658DD] rounded-sm">
          {kelas}
        </span>
      </div>

      {/* Detail Button */}
      <button
        type="button"
        onClick={goDetail}
        className="group mt-2 px-3 py-2 text-xs bg-[#6658DD2E] text-[#6658DD] rounded-sm hover:bg-[#6658DD] hover:text-white transition flex items-center gap-2"
      >
        <Image src="/eye.png" alt="eye icon" width={16} height={16} className="block group-hover:hidden" />
        <Image src="/eye-white.png" alt="eye white icon" width={16} height={16} className="hidden group-hover:block" />
        Detail Jadwal
      </button>
    </div>
  );
};

export default Jadwal;
