"use client";

import { useEffect, useState } from "react";

type User = { id: number; name: string; email: string; role: string };

export default function DashboardAkademik() {
  const [nameUpper, setNameUpper] = useState<string>("PENGGUNA");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const u = JSON.parse(raw) as User;
        if (u?.name) setNameUpper(String(u.name).toUpperCase());
      }
      document.title = "Dashboard - SISKA";
    } catch {}
  }, []);

  return (
    <>
      <div className="flex flex-row h-[75px] justify-between items-center">
        <h1 className="text-xl font-semibold text-[#323a46] leading-[75px]">Dashboard</h1>
        <p className="hidden md:flex text-[#ACB4C8] font-normal text-[14px]">Dashboard</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 p-6 bg-white rounded-xs">
          <h2 className="text-lg font-bold text-[#343A40]">
            Selamat datang {nameUpper}!
          </h2>
          <p className="text-sm font-normal text-[#6c756d] leading-6">
            Anda masuk sebagai Mahasiswa (IF).
          </p>
        </div>
            <div className="flex flex-col gap-4 p-6 bg-white rounded-xs">
                <div className="text-center gap-2.5 mt-2.5 flex flex-col">
                    <h2 className="text-lg font-bold text-[#343A40]">Pengumuman Terbaru</h2>
                    <p className="text-sm font-normal text-[#6c756d]">Simak pembaruan dan pengumuman terbaru</p>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <a href="#" className="text-[#6658DD] text-lg font-bold leading-7">PENYESUAIAN UANG KULIAH TUNGGAL BAGI MAHASISWA ANGKATAN TAHUN 2019 - 2024 UNIVERSITAS SINGAPERBANGSA KARAWANG</a>
                        <p className="text-sm text-[#A7B3B9] leading-6">PENYESUAIAN UANG KULIAH TUNGGAL BAGI MAHASISWA ANGKATAN TAHUN 2019 - 2024 UNIVERSITAS SINGAPERBANGSA KARAWANG</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <a href="#" className="text-[#6658DD] text-lg font-bold leading-7">NOMOR POKOK MAHASISWA (NPM) MAHASISWA BARU LULUSAN JALUR SELEKSI NASIONAL BERDASARKAN TES (SNBT) TAHUN 2025 DI UNIVERSITAS SINGAPERBANGSA KARAWANG</a>
                        <p className="text-sm text-[#A7B3B9] leading-6">NOMOR POKOK MAHASISWA (NPM) MAHASISWA BARU LULUSAN JALUR SELEKSI NASIONAL BERDASARKAN TES (SNBT) TAHUN 2025 DI UNIVERSITAS SINGAPERBANGSA KARAWANG</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <a href="#" className="text-[#6658DD] text-lg font-bold leading-7">NOMOR POKOK MAHASISWA (NPM) MAHASISWA BARU LULUSAN JALUR SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP) TAHUN 2025 DI UNIVERSITAS SINGAPERBANGSA KARAWANG</a>
                        <p className="text-sm text-[#A7B3B9] leading-6">NOMOR POKOK MAHASISWA (NPM) MAHASISWA BARU LULUSAN JALUR SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP) TAHUN 2025 DI UNIVERSITAS SINGAPERBANGSA KARAWANG</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <a href="#" className="text-[#6658DD] text-lg font-bold leading-7">NOMOR POKOK MAHASISWA (NPM) MAHASISWA BARU LULUSAN JALUR SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN-PTKIN) TAHUN 2025 DI UNIVERSITAS SINGAPERBANGSA KARAWANG</a>
                        <p className="text-sm text-[#A7B3B9] leading-6">NOMOR POKOK MAHASISWA (NPM) MAHASISWA BARU LULUSAN JALUR SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN-PTKIN) TAHUN 2025 DI UNIVERSITAS SINGAPERBANGSA KARAWANG</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <a href="#" className="text-[#6658DD] text-lg font-bold leading-7">PERPANJANGAN PEMBAYARAN UANG KULIAH TUNGGAL BAGI MAHASISWA SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP) DAN MAHASISWA SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN PTKIN) TAHUN ANGKATAN 2025</a>
                        <p className="text-sm text-[#A7B3B9] leading-6">PERPANJANGAN PEMBAYARAN UANG KULIAH TUNGGAL BAGI MAHASISWA SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP) DAN MAHASISWA SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN PTKIN) TAHUN ANGKATAN 2025</p>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}
