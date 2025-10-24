// app/(dashboard)/dosen/presensi.tsx  ← atau lokasi halamanmu
"use client";

import React, { useEffect, useState } from "react";
import Peserta from "@/components/dosen/list_peserta/peserta";
import type { Session, Student } from "@/components/dosen/list_peserta/presensi_table";

// ⬇️ pakai komponen review DINAMIS yang baru (bukan _dinamis)
import PresensiManualReview from "@/components/dosen/list_peserta/absen_manual";

type Selected = { id: string; name: string; nim: string } | null;

export default function PresensiPageDosen() {
  const [view, setView] = useState<"list" | "review">("list");
  const [selected, setSelected] = useState<Selected>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);

  const classId = 101;

  // load matrix presensi (tanggal pertemuan + peserta + matrix kehadiran)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/classes/${classId}/attendance-matrix`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        setSessions(data.sessions);
        setStudents(data.students);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [classId]);

  // buka halaman review manual (dipanggil dari tabel dosen)
  const openReview = (s: { id: string; name: string; nim: string }, sessionId: number) => {
    setSelected(s);
    setSelectedSessionId(sessionId);
    setView("review");
  };

  // kembali ke daftar
  const backToList = () => {
    setView("list");
    setSelected(null);
    setSelectedSessionId(null);
  };

  // selesai approve / set absent → refresh matrix lalu kembali
  const afterDecision = () => {
    fetch(`/api/classes/${classId}/attendance-matrix`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setSessions(d.sessions);
        setStudents(d.students);
      })
      .catch(console.error);
    backToList();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col p-6 bg-white rounded-sm gap-6">
        <h3 className="bg-[#F3F7F9] p-3 text-center text-[15px] font-bold">PRESENSI</h3>
      </div>

      {view === "list" ? (
        !sessions || !students ? (
          <div className="p-6 bg-white rounded-sm text-gray-500">Memuat…</div>
        ) : (
          // Peserta di sisi dosen harus mem-forward event klik:
          // onReview(student, sessionId)
          <Peserta sessions={sessions} students={students} onReview={openReview} />
        )
      ) : selected && selectedSessionId ? (
        <PresensiManualReview
          sessionId={selectedSessionId}
          userId={Number(selected.id)}
          onBack={backToList}
          onSelesai={afterDecision}            // ⬅️ nama prop yang benar di komponen baru
          onAnggapTidakHadir={afterDecision}   // ⬅️ dipanggil setelah POST /absent sukses
        />
      ) : null}
    </div>
  );
}
