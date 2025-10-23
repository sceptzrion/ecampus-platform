"use client";

import React, { useState } from "react";
import NavButtons from "@/components/dosen/navs/nav_buttons";
import DaftarRps from "@/components/detail-jadwal/daftar-rps/daftar_rps";
import Presensi from "@/components/dosen/list_peserta/presensi";

const NavJadwal = () => {
  const [activeTab, setActiveTab] = useState("presensi");

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
