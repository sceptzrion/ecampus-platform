"use client";

import React, { useState } from "react";
import AbsenManual from "@/components/detail-jadwal/presensi/daftar_peserta/absen_manual";
import Peserta from "@/components/detail-jadwal/presensi/daftar_peserta/peserta";

type SelectedStudent = { id: string; name: string; nim: string } | null;

export default function PresensiPage() {
  const [view, setView] = useState<"list" | "absen">("list");
  const [selected, setSelected] = useState<SelectedStudent>(null);

  const openManual = (s: { id: string; name: string; nim: string }) => {
    setSelected(s);
    setView("absen");
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
  };

  const submitSuccess = () => {
    // TODO: kalau mau, refresh data peserta di sini
    setView("list");
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col p-6 bg-white rounded-sm gap-6">
        <h3 className="bg-[#F3F7F9] p-3 text-center text-[15px] font-bold">PRESENSI</h3>
      </div>

      {view === "list" ? (
        <Peserta onManual={openManual} />
      ) : (
        <AbsenManual student={selected} onBack={backToList} onSubmitSuccess={submitSuccess} />
      )}
    </div>
  );
}
