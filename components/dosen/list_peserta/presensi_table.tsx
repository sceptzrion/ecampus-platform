"use client";

import React from "react";
import Image from "next/image";
import { nowWIB } from "@/lib/clock";

/* ===== Types yg sama dgn mahasiswa ===== */
export type AttendanceDB =
  | { status: "present" }
  | { status: "present_manual" }
  | { status: "absent"; reason?: "permit" | "sick" | "other" | "none" };

export type Session = {
  id: string;
  dateLabel: string;
  startAt?: string;
  endAt?: string;
  topic?: string | null;
};

export type Student = {
  id: string;
  name: string;
  nim: string;
  attendance?: Record<string, AttendanceDB | undefined>;
};

export type DosenPresensiTableProps = {
  sessions: Session[];
  students: Student[];
  onReview?: (s: { id: string; name: string; nim: string }, sessionId: number) => void;
};

/* ===== Utils waktu & label ===== */
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

function reasonToIndo(reason?: string) {
  switch (reason) {
    case "permit": return "Izin";
    case "sick":   return "Sakit";
    case "other":  return "Alasan Lain";
    case "none":   return "Tanpa Keterangan";
    case "-":
    default:       return "-";
  }
}

/* ===== Resolver status UI (tanpa isSelf) ===== */
type UiStatus =
  | { type: "present" }
  | { type: "present_manual" }
  | { type: "absent"; reason: string }
  | { type: "pending" }        // sesi berjalan, belum presensi
  | { type: "not_started" };

function resolveCellStatus(now: Date, sess: Session, db?: AttendanceDB): UiStatus {
  if (db) {
    if (db.status === "present") return { type: "present" };
    if (db.status === "present_manual") return { type: "present_manual" };
    if (db.status === "absent") return { type: "absent", reason: db.reason ?? "-" };
  }
  if (isBefore(now, sess.startAt)) return { type: "not_started" };
  if (isBetween(now, sess.startAt, sess.endAt)) return { type: "pending" };
  if (isAfter(now, sess.endAt)) return { type: "absent", reason: "-" };
  return { type: "not_started" };
}

/* ===== Badge untuk dosen ===== */
function StatusBadgeDosen({
  ui,
  onReview,
}: {
  ui: UiStatus;
  onReview?: () => void;
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
      // hijau tua + KLIK untuk buka review
      return (
        <button
          type="button"
          onClick={onReview}
          className="flex items-center place-self-center gap-0.75 text-[10.5px] w-fit px-1.25 py-1 rounded-sm bg-[#00aa88] text-white font-bold hover:brightness-95"
          title="Lihat detail presensi manual"
        >
          <Image src="/check_absen.png" alt="Hadir Manual" width={10.5} height={10.5} />
          Hadir (Manual)
        </button>
      );
    case "pending":
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
          <i className="text-xs text-[#6c757d]">{reasonToIndo(ui.reason)}</i>
        </div>
      );
    case "not_started":
    default:
      return (
        <div className="flex justify-center">
          <span
            title="Pertemuan belum dimulai"
            className="inline-flex items-center justify-center py-0.75 px-1 rounded bg-[#f1556c]"
          >
            <Image src="/caution.png" alt="Belum dimulai" width={12} height={12} />
          </span>
        </div>
      );
  }
}

/* ===== Tabel Dosen ===== */
export default function DosenPresensiTable({
  sessions,
  students,
  onReview,
}: DosenPresensiTableProps) {
  const now = nowWIB();

  return (
    <table className="w-full border-collapse">
      <thead className="bg-[#F3F7F9]">
        <tr className="text-left text-sm text-[#343A40] font-bold border-b-2 border-[#DEE2E6]">
          <th className="lg:sticky lg:left-0 bg-[#F3F7F9] px-4 py-3">No</th>
          <th className="lg:sticky lg:left-12.5 bg-[#F3F7F9] px-4 py-3">Nama</th>
          <th className="lg:sticky lg:left-43.25 bg-[#F3F7F9] px-4 py-3">Jumlah Kehadiran</th>

          {sessions.map((s) => {
            const isOpen = isBetween(now, s.startAt, s.endAt);
            const alreadyOver = isAfter(now, s.endAt);
            return (
              <th key={s.id} className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-1 items-center">
                  <div className="text-center text-[15px] font-bold">{s.dateLabel}</div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
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
          const hadirCount = sessions.reduce((acc, sess) => {
            const ui = resolveCellStatus(now, sess, stu.attendance?.[sess.id]);
            return acc + (ui.type === "present" || ui.type === "present_manual" ? 1 : 0);
          }, 0);

          return (
            <tr
              key={stu.id}
              className="border-b-2 border-[#EAECEF] hover:bg-[#F8FAFB] transition-colors"
            >
              <td className="lg:sticky lg:left-0 bg-white px-4 py-4 text-sm text-[#6c757d]">
                {idx + 1}
              </td>

              <td className="lg:sticky lg:left-12.5 bg-white px-4 py-3">
                <div className="text-[15px] uppercase font-bold text-[#343A40]">{stu.name}</div>
                <span className="inline-block text-[9px] font-semibold tracking-wide text-white bg-[#6658DD] px-1 py-0.25 rounded-sm">
                  {stu.nim}
                </span>
              </td>

              <td className="lg:sticky lg:left-43.25 bg-white px-4 py-4 text-sm text-[#6c757d]">
                {hadirCount}
              </td>

              {sessions.map((sess) => {
                const ui = resolveCellStatus(now, sess, stu.attendance?.[sess.id]);
                return (
                  <td key={sess.id} className="px-4 py-4 align-middle">
                    <StatusBadgeDosen
                      ui={ui}
                      onReview={
                        ui.type === "present_manual" && onReview
                          ? () => onReview({ id: stu.id, name: stu.name, nim: stu.nim }, Number(sess.id))
                          : undefined
                      }
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>

      {/* Footer topik (opsional) */}
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
