"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Settings = {
  id: number | null;
  academic_year_label: string | null;
  timezone: string | null;

  default_gateway_base_url: string | null;
  default_reader_secret: string | null;
  heartbeat_timeout_sec: number | null;

  scan_early_min: number | null;
  scan_late_min: number | null;
  manual_edit_days: number | null;

  holiday_mode: 0 | 1 | boolean;
};

const defaults: Settings = {
  id: null,
  academic_year_label: "2025/2026 Ganjil",
  timezone: "Asia/Jakarta",

  default_gateway_base_url: "",
  default_reader_secret: "",
  heartbeat_timeout_sec: 120,

  scan_early_min: 5,
  scan_late_min: 10,
  manual_edit_days: 3,

  holiday_mode: 0,
};

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/settings", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Gagal memuat settings");
      setForm({
        ...defaults,
        ...j,
        // normalisasi nilai null → default agar input tidak kosong total
        academic_year_label: j.academic_year_label ?? defaults.academic_year_label,
        timezone: j.timezone ?? defaults.timezone,
        default_gateway_base_url: j.default_gateway_base_url ?? "",
        default_reader_secret: j.default_reader_secret ?? "",
        heartbeat_timeout_sec: j.heartbeat_timeout_sec ?? defaults.heartbeat_timeout_sec,
        scan_early_min: j.scan_early_min ?? defaults.scan_early_min,
        scan_late_min: j.scan_late_min ?? defaults.scan_late_min,
        manual_edit_days: j.manual_edit_days ?? defaults.manual_edit_days,
        holiday_mode: !!j.holiday_mode,
      });
    } catch (e: any) {
      alert(e.message || "Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // jaga type numeric
          heartbeat_timeout_sec: Number(form.heartbeat_timeout_sec) || 0,
          scan_early_min: Number(form.scan_early_min) || 0,
          scan_late_min: Number(form.scan_late_min) || 0,
          manual_edit_days: Number(form.manual_edit_days) || 0,
          holiday_mode: form.holiday_mode ? 1 : 0,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Gagal menyimpan settings");
      alert("Pengaturan tersimpan.");
      load();
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="pt-3" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#323a46]">Settings</h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <Link href="/admin/dashboard" className="text-[#6c757d]">Dashboard</Link>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Settings</span>
        </div>
      </div>

      <div className="bg-white rounded-xs p-5 w-full">
        {loading ? (
          <div className="text-[#6c757d]">Memuat…</div>
        ) : (
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Umum */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-[#343A40] mb-2">Umum</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#6c757d]">Tahun Ajaran Aktif</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="2025/2026 Ganjil"
                    value={form.academic_year_label ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, academic_year_label: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6c757d]">Timezone</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Asia/Jakarta"
                    value={form.timezone ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* RFID / Gateway */}
            <div className="md:col-span-2 mt-2">
              <h3 className="font-semibold text-[#343A40] mb-2">RFID / Gateway</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-sm text-[#6c757d]">Default Gateway Base URL</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="http://reader-gw.local:8080"
                    value={form.default_gateway_base_url ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, default_gateway_base_url: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6c757d]">Default Reader Secret</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="(opsional)"
                    value={form.default_reader_secret ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, default_reader_secret: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6c757d]">Heartbeat Timeout (detik)</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    min={10}
                    value={Number(form.heartbeat_timeout_sec ?? 0)}
                    onChange={(e) => setForm((f) => ({ ...f, heartbeat_timeout_sec: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* Attendance Rules */}
            <div className="md:col-span-2 mt-2">
              <h3 className="font-semibold text-[#343A40] mb-2">Aturan Presensi Otomatis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-[#6c757d]">Scan lebih awal (menit)</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    min={0}
                    value={Number(form.scan_early_min ?? 0)}
                    onChange={(e) => setForm((f) => ({ ...f, scan_early_min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6c757d]">Scan lebih akhir (menit)</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    min={0}
                    value={Number(form.scan_late_min ?? 0)}
                    onChange={(e) => setForm((f) => ({ ...f, scan_late_min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6c757d]">Batas edit manual (hari)</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    min={0}
                    value={Number(form.manual_edit_days ?? 0)}
                    onChange={(e) => setForm((f) => ({ ...f, manual_edit_days: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <input
                    id="holiday"
                    type="checkbox"
                    checked={!!form.holiday_mode}
                    onChange={(e) => setForm((f) => ({ ...f, holiday_mode: e.target.checked }))}
                  />
                  <label htmlFor="holiday" className="text-sm">Holiday Mode (nonaktifkan auto-presensi)</label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="md:col-span-2 mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={load}
                className="px-3 py-2 rounded border"
              >
                Reset
              </button>
              <button
                disabled={saving}
                className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95"
              >
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
