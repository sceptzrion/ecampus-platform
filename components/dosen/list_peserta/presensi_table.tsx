"use client";

import React from "react";
import Image from "next/image";

/* =========================
   Dummy data (statis dulu)
   ========================= */
type Status = "hadir" | "tidak" | "manual" | "pending" | "not_started";

type Student = {
  id: string;
  name: string;
  nim: string;
  hadirCount: number;
  statuses: Status[];
};

const DATES = ["18 Agustus 2025", "1 September 2025", "15 September 2025", "29 September 2025"];

const STUDENTS: Student[] = [
  { id: "1", name: "ALIF FADILLAH UMMAR", nim: "2210631170004", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "2", name: "RISMA AULIYA SALSABILLA", nim: "2210631170100", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "3", name: "SITI ZULHI NIRMA SAIDAH", nim: "2210631170103", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "4", name: "SOPIAN SYAURI", nim: "2210631170104", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "5", name: "ALUSTINA SUCI MANAH", nim: "2210631170006", hadirCount: 2, statuses: ["hadir","hadir","tidak","pending"] },
  { id: "6", name: "MUHAMAD IKHSAN RIZQI YANUAR", nim: "2210631170131", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "7", name: "ARI RIZWAN", nim: "2210631170008", hadirCount: 3, statuses: ["hadir","hadir","hadir","pending"] },
  { id: "8", name: "REIZA ALITHIAN SYACH", nim: "2210631170098", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "9", name: "AFRIDHO IKHSAN", nim: "2210631170002", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "10", name: "RIDHAKA GINA AMALIA", nim: "2210631170099", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "11", name: "IKHWAN PRATAMA HIDAYAT", nim: "2210631170126", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "12", name: "ANANTA ZIAUROHMAN AZ ZAKI", nim: "2210631170007", hadirCount: 2, statuses: ["hadir","tidak","hadir","pending"] },
  { id: "13", name: "MUHAMAD EKI BARKATAN SARI", nim: "2210631170130", hadirCount: 2, statuses: ["hadir","tidak","hadir","manual"] },
  { id: "14", name: "YESAYA ADHELYASA VAREEN TETUKO", nim: "2210631170107", hadirCount: 2, statuses: ["hadir","tidak","hadir","manual"] },
  { id: "15", name: "ALMA ALIFYA ZAFIRA", nim: "2210631170005", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "16", name: "MAHESWARA ABHISTA HAMDAN HAFIZ", nim: "2210631170128", hadirCount: 3, statuses: ["hadir","hadir","hadir","pending"] },
  { id: "17", name: "ADITYA DAFFA SYAHPUTRA", nim: "2210631170001", hadirCount: 3, statuses: ["hadir","hadir","hadir","manual"] },
  { id: "18", name: "TJOARGEN CHRISTOPER REDJA", nim: "2210631170106", hadirCount: 2, statuses: ["hadir","tidak","hadir","manual"] },
  { id: "19", name: "GUDANG GUNAWAN", nim: "2210631170124", hadirCount: 2, statuses: ["tidak","hadir","hadir","manual"] },
];

const TOPICS = ["perkenalan capstone project", "Pemilihan topik project", "Perancangan Project", "Implementasi Project"];

/* Siapa user yang sedang login? */
const CURRENT_USER_NIM = "2210631170131"; // ganti sesuai session/login kamu

/* =========================
   Badge & tombol status
   ========================= */
function StatusBadge({
  value,
  isSelf,
  onManualClick,
}: {
  value: Status;
  isSelf?: boolean;
  onManualClick?: () => void;
}) {
  if (value === "hadir")
    return (
      <span className="flex items-center place-self-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#1ABC9C] text-white font-bold">
        <Image src="/check_absen.png" alt="Hadir" width={10.5} height={10.5} />
        Hadir
      </span>
    );

  if (value === "tidak")
    return (
      <div className="flex flex-col items-center gap-0.75">
        <span className="flex items-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#f1556c] text-white font-bold">
          <Image src="/not_absen.png" alt="Tidak Hadir" width={10.5} height={10.5} />
          Tidak Hadir
        </span>
        <i className="text-xs text-[#6c757d]">-</i>
      </div>
    );

  if (value === "manual") {
    if (isSelf) {
      // HANYA untuk user sendiri → bisa klik, jadi "Ambil Presensi"
      return (
        <button
          type="button"
          className="flex items-center place-self-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#1ABC9C] text-white font-bold hover:brightness-95"
          onClick={onManualClick}
        >
          <Image src="/check_absen.png" alt="Hadir" width={10.5} height={10.5} />
          Hadir (Presensi Manual)
        </button>
      );
    }
    // Orang lain → non klik, tanpa ikon
    return (
      <span className="flex items-center place-self-center text-[10.5px] w-fit px-1.5 py-1 rounded-sm bg-[#BBBBBB] text-white font-bold">
        Belum Presensi
      </span>
    );
  }

  if (value === "pending")
    return (
      <span className="flex items-center place-self-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#1ABC9C] text-white font-bold hover:brightness-95 cursor-context-menu">
        <Image src="/check_absen.png" alt="Hadir" width={10.5} height={10.5} />
        Hadir (Presensi Manual)
      </span>
    );

  return (
    <div className="flex justify-center">
      <span title="Pertemuan belum dimulai" className="inline-flex items-center justify-center py-0.75 px-1 rounded bg-[#f1556c]">
        <Image src="/caution.png" alt="Belum dimulai" width={12} height={12} />
      </span>
    </div>
  );
}

/* =========================
   Table Component
   ========================= */
export default function PresensiTable({
  onManual,
  currentUserNim = CURRENT_USER_NIM, // bisa override via props kalau perlu
}: {
  onManual?: (s: { id: string; name: string; nim: string }) => void;
  currentUserNim?: string;
}) {
  return (
    <table className="w-full border-collapse">
      <thead className="bg-[#F3F7F9]">
        <tr className="text-left text-sm text-[#343A40] font-bold border-b-2 border-[#DEE2E6]">
          <th className="lg:sticky lg:left-0 bg-[#F3F7F9] px-4 py-3">No</th>
          <th className="lg:sticky lg:left-12.5 bg-[#F3F7F9] px-4 py-3">Nama</th>
          <th className="lg:sticky lg:left-46.5 bg-[#F3F7F9] px-4 py-3">Jumlah Kehadiran</th>
          {DATES.map((d, idx) => (
            <th key={idx} className="px-4 py-3 whitespace-nowrap">
              <div className="flex flex-col gap-1 items-center">
                <div className="text-center text-[15px] font-bold">{d}</div>
                <div className="flex flex-col items-center gap-2">
                  <button className="flex items-center gap-1 text-[10.5px] px-1 py-0.5 rounded-md bg-[#6658DD] text-white hover:brightness-95">
                    <Image src="/edit.png" alt="Edit" width={11.5} height={11.5} />
                    Edit
                  </button>
                  <span className="flex items-center text-[9px] px-1.25 py-0.25 rounded bg-[#43BFE5] text-white">
                    Belum Diakhiri
                  </span>
                </div>
              </div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {STUDENTS.map((s, rowIdx) => {
          const isSelf = s.nim === currentUserNim;
          return (
            <tr key={s.id} className="border-b-2 border-[#EAECEF] hover:bg-[#F8FAFB] transition-colors">
              <td className="lg:sticky lg:left-0 bg-white px-4 py-4 text-sm text-[#6c757d]">{rowIdx + 1}</td>

              <td className="lg:sticky lg:left-12.5 bg-white px-4 py-3">
                <div className="text-[15px] font-bold text-[#343A40]">{s.name}</div>
                <span className="inline-block text-[9px] font-semibold tracking-wide text-white bg-[#6658DD] px-1 py-0.25 rounded-sm">
                  {s.nim}
                </span>
              </td>

              <td className="lg:sticky lg:left-46.5 bg-white px-4 py-4 text-sm text-[#6c757d]">{s.hadirCount}</td>

              {DATES.map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-4 align-middle">
                  <StatusBadge
                    value={s.statuses[colIdx]}
                    isSelf={isSelf}
                    onManualClick={
                      isSelf ? () => onManual?.({ id: s.id, name: s.name, nim: s.nim }) : undefined
                    }
                  />
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>

      <tfoot>
        <tr className="bg-[#F3F7F9] border-t-2 border-[#EAECEF]">
          <td className="lg:sticky lg:left-0 bg-[#F3F7F9] px-4 py-3" />
          <td className="lg:sticky lg:left-12.5 bg-[#F3F7F9] px-4 py-3 font-bold text-[#6c757d] text-sm">Topik</td>
          <td className="lg:sticky lg:left-46.5 bg-[#F3F7F9] px-4 py-3" />
          {DATES.map((_, idx) => (
            <td key={idx} className="px-4 py-3 text-[#6c757d] text-center text-xs">
              {TOPICS[idx] ?? ""}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}
