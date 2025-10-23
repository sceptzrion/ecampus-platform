import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default function DashboardDosen() {
  return (
    <>
        <div className="flex flex-row h-[75px] justify-between items-center">
            <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">Dashboard</h1>
            <p className="hidden md:flex text-[#ACB4C8] font-normal text-[14px]">Dashboard</p>
        </div>
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 p-6 bg-white rounded-xs">
                <h2 className="text-lg font-bold text-[#343A40]">Selamat datang Gudang Gunawan!</h2>
                <p className="text-sm font-normal text-[#6c756d] leading-6">Anda masuk sebagai Dosen.</p>
            </div>
        </div>
    </>
  );
}
