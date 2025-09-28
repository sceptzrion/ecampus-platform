"use client";

import React, { useState } from "react";
import Image from "next/image";

/* ---------- Types ---------- */
type RpsRow = {
  id: string;
  author: string;
  createdAt: string; // sudah berformat “14 Agustus 2024”
  isPublic: boolean;
};

/* ---------- Dummy rows (statis dulu) ---------- */
const ROWS: RpsRow[] = [
  { id: "1", author: "Budi Arif Dermawan, S.Kom., M.Kom.", createdAt: "14 Agustus 2024", isPublic: true },
  { id: "2", author: "Sofi Defiyanti, S.Kom., M.Kom.", createdAt: "22 Agustus 2024", isPublic: true },
  { id: "3", author: "Betha Nurina Sari, S.Kom., M.Kom.", createdAt: "22 Agustus 2024", isPublic: true },
];

/* ---------- Small UI atoms ---------- */
function PublicBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-sm font-bold text-[10.5px] bg-[#1abc9c] text-white">
      <Image src="/public.png" alt="Publik" width={12} height={12} />
      Publik
    </span>
  );
}

function MutedText({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] text-[#98A6AD]">{children}</div>;
}

function CellTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-semibold text-[#343A40]">{children}</div>;
}

/* ---------- Row ---------- */
function RpsTableRow({ row }: { row: RpsRow }) {
  return (
    <tr className="border-b border-[#DEE2E6] hover:bg-[#EEF4F7] transition-colors">
      <td className="px-4 py-4 align-top">
        <button
          className="px-3 py-1.5 text-xs rounded bg-[#E9ECEF] text-[#6C757D] cursor-pointer hover:bg-[#6C757D] hover:text-[#ffffff]  transition "
        >
          Detail
        </button>
      </td>

      <td className="px-4 py-2 align-top">
        <CellTitle>{row.author}</CellTitle>
        <MutedText>Dibuat pada tanggal : {row.createdAt}</MutedText>
      </td>

      <td className="px-4 py-4 align-top">
        <PublicBadge visible={row.isPublic} />
      </td>

      <td className="px-4 py-4 align-top" />
    </tr>
  );
}

/* ---------- Main Component ---------- */
export default function DaftarRps() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <>
      {/* Alert dismissible */}
      {showAlert && (
        <div
          role="alert"
          className="flex flex-col bg-[#F1556C2E] text-[#A93C4C] px-5 py-5.5 gap-2.5 mb-4 rounded-sm"
        >
          <div className="flex flex-row justify-between">
            <h2 className="text-lg font-bold">Whops</h2>
            <button
              onClick={() => setShowAlert(false)}
              aria-label="Tutup peringatan"
              className="p-1 rounded hover:bg-[#f2c6cc66] transition"
            >
              <Image src="/close.png" alt="" width={20} height={20} />
            </button>
          </div>
          <p className="text-sm mb-2">
            Dosen pengampu belum melakukan set RPS pada jadwal ini
          </p>
        </div>
      )}

      {/* Card + Table */}
      <section className="flex flex-col p-6 bg-white rounded-sm gap-6">
        <h3 className="bg-[#F3F7F9] p-3 text-center text-[15px] font-bold">
          DAFTAR RPS
        </h3>

        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-sm text-[#343A40] font-bold bg-[#F3F7F9] border-b-2 border-[#DEE2E6]">
              <th className="px-4 py-3 w-[120px]">Extra</th>
              <th className="px-4 py-3">Dibuat Oleh</th>
              <th className="px-4 py-3 w-[120px]">Publik?</th>
              <th className="px-4 py-3 w-[120px]">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {ROWS.map((row) => (
              <RpsTableRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
