"use client";

import React, { useState } from "react";
import NavButtons from "@/components/detail-jadwal/nav_buttons";
import DaftarRps from "@/components/detail-jadwal/daftar-rps/daftar_rps";
import Presensi from "@/components/detail-jadwal/presensi/presensi";

const NavJadwal = () => {
  const [activeTab, setActiveTab] = useState("rps");

  return (
    <>
      <NavButtons active={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "rps" && <DaftarRps />}
        {activeTab === "peserta" && <p>📋 Daftar Peserta tampil di sini…</p>}
        {activeTab === "jurnal" && <p>📝 Jurnal Perkuliahan tampil di sini…</p>}
        {activeTab === "presensi" && <Presensi />}
        {activeTab === "rekap" && <p>📊 Rekap Perkuliahan tampil di sini…</p>}
      </div>
    </>
  );
};

export default NavJadwal;
