"use client";

import React, { useEffect, useState } from "react";
import type { Session, Student } from "@/components/detail-jadwal/presensi/presensi_table";
import AbsenManual from "@/components/detail-jadwal/presensi/daftar_peserta/absen_manual";
import Peserta from "@/components/detail-jadwal/presensi/daftar_peserta/peserta";

type SelectedStudent = { id: string; name: string; nim: string } | null;

export default function PresensiPage() {
  const [view, setView] = useState<"list" | "absen">("list");
  const [selected, setSelected] = useState<SelectedStudent>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);

  // ⬇️ AMBIL NAMA USER DARI localStorage (diset saat login)
  const [authName, setAuthName] = useState<string | undefined>(undefined);
  // (opsional) nim fallback
  const [authNim, setAuthNim] = useState<string | undefined>(undefined);

  const classId = 101; // sesuaikan

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
    return () => { alive = false; };
  }, [classId]);

  // ⬇️ load authUser dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setAuthName(u.name);
        if (u?.email) {
          // kalau kamu simpan nim terpisah, ambil dari situ.
          // atau derive dari email student (opsional)
          // setAuthNim(deriveNim(u.email));
        }
      }
    } catch {}
  }, []);

  const openManual = (s: { id: string; name: string; nim: string }, sessionId: number) => {
    setSelected(s);
    setSelectedSessionId(sessionId);
    setView("absen");
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
  };

  const submitSuccess = () => {
    setView("list");
    setSelected(null);
    // refresh matrix setelah submit
    fetch(`/api/classes/${classId}/attendance-matrix`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions); setStudents(d.students); })
      .catch(console.error);
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
          <Peserta
            sessions={sessions}
            students={students}
            currentUserName={authName}    
            currentUserNim={authNim}       
            onManual={openManual}
          /> 
        )
      ) : (
        <AbsenManual
          student={selected}
          sessionId={selectedSessionId ?? 0}
          onBack={backToList}
          onSubmitSuccess={submitSuccess}
        />
      )}
    </div>
  );
}
