"use client";

import React, { useState } from "react";

export default function DevToolsPage() {
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setFake = async () => {
    if (!date) { setMsg("Pilih tanggal dulu."); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/dev/set-time?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || "Gagal set tanggal");
      setMsg(`Tanggal palsu di-set: ${date}. Refresh halaman presensi untuk melihat efeknya.`);
    } catch (e: any) {
      setMsg(e.message || "Gagal");
    } finally { setBusy(false); }
  };

  const clearFake = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch(`/dev/set-time?clear=1`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || "Gagal clear");
      setMsg("Tanggal palsu dihapus. Kembali ke waktu asli.");
    } catch (e: any) {
      setMsg(e.message || "Gagal");
    } finally { setBusy(false); }
  };

  const resetAll = async () => {
    if (!confirm("Reset & seed ulang contoh data?")) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/dev/reset", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.error || "Gagal reset");
      setMsg("Reset & seed selesai. Silakan muat ulang halaman terkait.");
    } catch (e: any) {
      setMsg(e.message || "Gagal");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col p-6 bg-white rounded-sm gap-6">
        <h3 className="bg-[#F3F7F9] p-3 text-center text-[15px] font-bold">DEV TOOLS</h3>
        <p className="text-sm text-[#6c757d]">
          Alat ini hanya aktif di <b>development</b>. Di production endpoint mengembalikan 404.
        </p>
      </div>

      <div className="bg-white rounded-xs p-6 grid gap-6 md:grid-cols-2">
        <div className="border rounded-md p-4">
          <h4 className="font-semibold mb-3">Set Fake Today (WIB)</h4>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border px-3 py-2 rounded"
              value={date}
              onChange={(e)=>setDate(e.target.value)}
            />
            <button
              onClick={setFake}
              disabled={busy}
              className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95 disabled:opacity-60"
            >
              Set
            </button>
            <button
              onClick={clearFake}
              disabled={busy}
              className="px-3 py-2 rounded border"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-[#6c757d] mt-2">
            Contoh manual: <code>/dev/set-time?date=2025-10-27</code> &nbsp;|&nbsp;
            <code>/dev/set-time?clear=1</code>
          </p>
        </div>

        <div className="border rounded-md p-4">
          <h4 className="font-semibold mb-3">Reset & Seed Data Presensi</h4>
          <p className="text-sm text-[#6c757d] mb-3">
            Mengosongkan attendance & sessions lalu mengisi contoh data (Class 101, sessions, users, room/reader).
          </p>
          <button
            onClick={resetAll}
            disabled={busy}
            className="px-3 py-2 rounded bg-[#F1556C] text-white hover:brightness-95 disabled:opacity-60"
          >
            Jalankan Reset
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-white rounded-xs text-sm text-[#343a40]">
          {msg}
        </div>
      )}
    </div>
  );
}
