"use client";

import React from "react";
import Image from "next/image";

/* =========================
   Types (siap nyambung DB)
   ========================= */
export type AttendanceDB =
  | { status: "present" }                                    // RFID/auto
  | { status: "present_manual" }                             // hadir manual (sudah dikonfirmasi)
  | { status: "absent"; reason?: "permit" | "sick" | "other" | "none" }; // tidak hadir + reason

export type Session = {
  id: string;
  dateLabel: string;          // contoh: "18 Agustus 2025"
  startAt?: string;           // ISO, opsional (kalau belum ada di mock)
  endAt?: string;             // ISO, opsional
  topic?: string | null;
};

export type Student = {
  id: string;
  name: string;
  nim: string;
  attendance?: Record<string, AttendanceDB | undefined>; // key: sessionId
};

export type PresensiTableProps = {
  sessions?: Session[];                                       // optional; jika tidak ada -> dummy
  students?: Student[];                                       // optional; jika tidak ada -> dummy
  currentUserNim?: string;                                    // nim user login; untuk tombol self manual
  onEditSession?: (sessionId: string) => void;                // klik "Edit" di header kolom
  onManual?: (s: { id: string; name: string; nim: string }) => void; // klik Ambil Presensi
};

/* =========================
   Dummy fallback (biar tidak breaking)
   ========================= */
const FALLBACK_SESSIONS: Session[] = [
  { id: "s1", dateLabel: "18 Agustus 2025" },
  { id: "s2", dateLabel: "1 September 2025" },
  { id: "s3", dateLabel: "15 September 2025" },
  { id: "s4", dateLabel: "29 September 2025" },
];

const FALLBACK_STUDENTS: Student[] = [
  { id: "1",  name: "ALIF FADILLAH UMMAR",              nim: "2210631170004" },
  { id: "2",  name: "RISMA AULIYA SALSABILLA",          nim: "2210631170100" },
  { id: "3",  name: "SITI ZULHI NIRMA SAIDAH",          nim: "2210631170103" },
  { id: "4",  name: "SOPIAN SYAURI",                    nim: "2210631170104" },
  { id: "5",  name: "ALUSTINA SUCI MANAH",              nim: "2210631170006" },
  { id: "6",  name: "MUHAMAD IKHSAN RIZQI YANUAR",      nim: "2210631170131" },
];

/* =========================
   Waktu & Status Resolver
   ========================= */
function isBetween(now: Date, start?: string, end?: string) {
  if (!start || !end) return false;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const n = now.getTime();
  return n >= s && n <= e;
}
function isBefore(now: Date, start?: string) {
  if (!start) return false;
  return now.getTime() < new Date(start).getTime();
}
function isAfter(now: Date, end?: string) {
  if (!end) return false;
  return now.getTime() > new Date(end).getTime();
}

/**
 * Tentukan "UI status" per sel berdasarkan:
 *  - record attendance dari DB (jika ada)
 *  - waktu sesi (belum mulai / sedang / lewat)
 *  - apakah baris adalah user yang login (isSelf)
 */
type UiStatus =
  | { type: "present" }
  | { type: "present_manual" }
  | { type: "absent"; reason: string }
  | { type: "not_started" }
  | { type: "self_manual" }              // tombol Ambil Presensi (khusus baris dirinya saat sesi berjalan & belum ada record)
  | { type: "pending_other" };           // orang lain, sesi berjalan, belum presensi

function resolveCellStatus(
  now: Date,
  sess: Session,
  db: AttendanceDB | undefined,
  isSelf: boolean
): UiStatus {
  if (db) {
    if (db.status === "present") return { type: "present" };
    if (db.status === "present_manual") return { type: "present_manual" };
    if (db.status === "absent") return { type: "absent", reason: db.reason ?? "-" };
  }

  // tidak ada record -> lihat waktu
  if (isBefore(now, sess.startAt)) return { type: "not_started" };
  if (isBetween(now, sess.startAt, sess.endAt)) {
    return isSelf ? { type: "self_manual" } : { type: "pending_other" };
  }
  // sudah lewat & tidak ada record -> tampil tidak hadir ("-")
  if (isAfter(now, sess.endAt)) return { type: "absent", reason: "-" };

  // fallback
  return { type: "not_started" };
}

/* =========================
   Badge renderer
   ========================= */
function StatusBadge({
  ui,
  isSelf,
  onManualClick,
}: {
  ui: UiStatus;
  isSelf: boolean;
  onManualClick?: () => void;
}) {
  switch (ui.type) {
    case "present":
      return (
        <span className="flex items-center place-self-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#1ABC9C] text-white font-bold">
          <Image src="/check_absen.png" alt="Hadir" width={10.5} height={10.5} />
          Hadir
        </span>
      );
    case "present_manual":
      return (
        <span className="flex items-center place-self-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#1ABC9C] text-white font-bold">
          <Image src="/check_absen.png" alt="Hadir Manual" width={10.5} height={10.5} />
          Hadir (Manual)
        </span>
      );
    case "self_manual":
      return isSelf ? (
        <button
          type="button"
          onClick={onManualClick}
          className="flex items-center place-self-center gap-0.75 text-[10.5px] w-fit px-1 py-1 rounded-sm bg-[#43bfe5] text-white font-bold hover:brightness-95"
        >
          <Image src="/edit.png" alt="Ambil Presensi" width={10.5} height={10.5} />
          Ambil Presensi
        </button>
      ) : (
        <span className="flex items-center place-self-center text-[10.5px] w-fit px-1.5 py-1 rounded-sm bg-[#BBBBBB] text-white font-bold">
          Belum Presensi
        </span>
      );
    case "pending_other":
      return (
        <span className="flex items-center place-self-center text-[10.5px] w-fit px-1.5 py-1 rounded-sm bg-[#BBBBBB] text-white font-bold">
          Belum Presensi
        </span>
      );
    case "absent":
      return (
        <div className="flex flex-col items-center gap-0.75">
          <span className="flex items-center gap-0.5 text-[10.5px] w-fit px-1 py-0.75 rounded-sm bg-[#f1556c] text-white font-bold">
            <Image src="/not_absen.png" alt="Tidak Hadir" width={10.5} height={10.5} />
            Tidak Hadir
          </span>
          <i className="text-xs text-[#6c757d]">{ui.reason || "-"}</i>
        </div>
      );
    case "not_started":
    default:
      return (
        <div className="flex justify-center">
          <span title="Pertemuan belum dimulai" className="inline-flex items-center justify-center py-0.75 px-1 rounded bg-[#f1556c]">
            <Image src="/caution.png" alt="Belum dimulai" width={12} height={12} />
          </span>
        </div>
      );
  }
}

/* =========================
   Komponen Utama
   ========================= */
export default function PresensiTable({
  sessions = FALLBACK_SESSIONS,
  students = FALLBACK_STUDENTS,
  currentUserNim = "2210631170131",
  onEditSession,
  onManual,
}: PresensiTableProps) {
  const now = new Date();

  return (
    <table className="w-full border-collapse">
      <thead className="bg-[#F3F7F9]">
        <tr className="text-left text-sm text-[#343A40] font-bold border-b-2 border-[#DEE2E6]">
          <th className="lg:sticky lg:left-0 bg-[#F3F7F9] px-4 py-3">No</th>
          <th className="lg:sticky lg:left-12.5 bg-[#F3F7F9] px-4 py-3">Nama</th>
          <th className="lg:sticky lg:left-43.25 bg-[#F3F7F9] px-4 py-3">Jumlah Kehadiran</th>

          {sessions.map((s) => {
            const isOpen = isBetween(now, s.startAt, s.endAt);      // running?
            const alreadyOver = isAfter(now, s.endAt);
            return (
              <th key={s.id} className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-1 items-center">
                  <div className="text-center text-[15px] font-bold">{s.dateLabel}</div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditSession?.(s.id)}
                      className="flex items-center gap-1 text-[10.5px] px-1 py-0.5 rounded-md bg-[#6658DD] text-white hover:brightness-95"
                    >
                      <Image src="/edit.png" alt="Edit" width={11.5} height={11.5} />
                      Edit
                    </button>
                    <span
                      className={`flex items-center text-[9px] px-1.25 py-0.25 rounded ${
                        isOpen ? "bg-[#43BFE5]" : alreadyOver ? "bg-[#A7B3B9]" : "bg-[#43BFE5]"
                      } text-white`}
                    >
                      {alreadyOver ? "Sudah Diakhiri" : "Belum Diakhiri"}
                    </span>
                  </div>
                </div>
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {students.map((stu, idx) => {
          const isSelf = stu.nim === currentUserNim;
          // hitung hadirCount dari attendance DB + status runtime
          const hadirCount = sessions.reduce((acc, sess) => {
            const ui = resolveCellStatus(now, sess, stu.attendance?.[sess.id], isSelf);
            return acc + (ui.type === "present" || ui.type === "present_manual" ? 1 : 0);
          }, 0);

          return (
            <tr key={stu.id} className="border-b-2 border-[#EAECEF] hover:bg-[#F8FAFB] transition-colors">
              <td className="lg:sticky lg:left-0 bg-white px-4 py-4 text-sm text-[#6c757d]">{idx + 1}</td>

              <td className="lg:sticky lg:left-12.5 bg-white px-4 py-3">
                <div className="text-[15px] uppercase font-bold text-[#343A40]">{stu.name}</div>
                <span className="inline-block text-[9px] font-semibold tracking-wide text-white bg-[#6658DD] px-1 py-0.25 rounded-sm">
                  {stu.nim}
                </span>
              </td>

              <td className="lg:sticky lg:left-43.25 bg-white px-4 py-4 text-sm text-[#6c757d]">{hadirCount}</td>

              {sessions.map((sess) => {
                const ui = resolveCellStatus(now, sess, stu.attendance?.[sess.id], isSelf);
                return (
                  <td key={sess.id} className="px-4 py-4 align-middle">
                    <StatusBadge
                      ui={ui}
                      isSelf={isSelf}
                      onManualClick={isSelf && onManual ? () => onManual({ id: stu.id, name: stu.name, nim: stu.nim }) : undefined}
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>

      {/* Footer Topik (kalau kamu mau pakai) */}
      <tfoot>
        <tr className="bg-[#F3F7F9] border-t-2 border-[#EAECEF]">
          <td className="lg:sticky lg:left-0 bg-[#F3F7F9] px-4 py-3" />
          <td className="lg:sticky lg:left-12.5 bg-[#F3F7F9] px-4 py-3 font-bold text-[#6c757d] text-sm">
            Topik
          </td>
          <td className="lg:sticky lg:left-43.25 bg-[#F3F7F9] px-4 py-3" />
          {sessions.map((s) => (
            <td key={s.id} className="px-4 py-3 text-[#6c757d] text-center text-xs">
              {s.topic ?? ""}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}
