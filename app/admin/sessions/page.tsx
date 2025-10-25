// app/admin/sessions/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { localInputToUTCISO, utcToLocalInput } from "@/lib/datetime";

type Item = {
  id: number;
  classId: number;
  classLabel: string;
  topic: string | null;
  startAt: string; // UTC (DB)
  endAt: string;   // UTC (DB)
};

type ClassOpt = { id: number; label: string };

export default function SessionsAdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [classes, setClasses] = useState<ClassOpt[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({
    classId: "",
    topic: "",
    startLocal: "",
    endLocal: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const [sessRes, clsRes] = await Promise.all([
      fetch("/api/sessions?classId=101", { cache: "no-store" }), // filter contoh; hapus query jika ingin semua
      fetch("/api/classes", { cache: "no-store" }),
    ]);
    const sessJson = await sessRes.json();
    const clsJson = await clsRes.json();
    setItems(sessJson.items || []);
    setClasses((clsJson.items || []).map((c: any) => ({ id: c.id, label: `${c.code} — ${c.name}` })));
    setLoading(false);
  };

  useEffect(() => { fetchAll().catch(console.error); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ classId: "", topic: "", startLocal: "", endLocal: "" });
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (it: Item) => {
    setEditing(it);
    setForm({
      classId: String(it.classId),
      topic: it.topic ?? "",
      startLocal: utcToLocalInput(it.startAt),
      endLocal: utcToLocalInput(it.endAt),
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      classId: Number(form.classId),
      topic: form.topic.trim() || null,
      startAt: localInputToUTCISO(form.startLocal),
      endAt: localInputToUTCISO(form.endLocal),
    };

    const url = editing ? `/api/sessions/${editing.id}` : "/api/sessions";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Gagal menyimpan");
      return;
    }
    setOpen(false);
    await fetchAll();
  };

  const remove = async (id: number) => {
    if (!confirm("Hapus sesi ini?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Gagal menghapus");
      return;
    }
    await fetchAll();
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-[#323a46]">Sessions</h1>
        <div className="hidden md:flex gap-2.5 text-[14px]">
          <a href="/admin/dashboard" className="text-[#6c757d]">Dashboard</a>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Sessions</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col gap-4 p-6 bg-white rounded-xs mb-6">
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.75 text-sm font-medium bg-[#6658DD] text-white rounded-xs"
          >
            Tambah Session
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xs px-6 py-5 w-full">
        {loading ? (
          <div className="text-gray-500">Memuat…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#F3F7F9]">
                <tr className="text-left text-sm text-[#343A40] font-bold border-b-2 border-[#DEE2E6]">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Topik</th>
                  <th className="px-4 py-3">Mulai (UTC)</th>
                  <th className="px-4 py-3">Selesai (UTC)</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id} className="border-b-2 border-[#EAECEF] hover:bg-[#F8FAFB]">
                    <td className="px-4 py-3 text-sm text-[#6c757d]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-[12px] font-semibold tracking-wide text-white bg-[#6658DD] px-1 py-0.25 rounded-sm">
                        {it.classLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">{it.topic ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{it.startAt.replace("T", " ").slice(0, 19)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{it.endAt.replace("T", " ").slice(0, 19)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(it)}
                          className="px-2 py-1 rounded-sm bg-[#43BFE5] text-white text-xs hover:brightness-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(it.id)}
                          className="px-2 py-1 rounded-sm bg-[#F1556C] text-white text-xs hover:brightness-95"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Belum ada session.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <form
            onSubmit={save}
            className="relative z-[1001] w-[95%] max-w-xl bg-white rounded-md shadow p-5 space-y-4"
          >
            <h3 className="text-lg font-semibold">{editing ? "Edit" : "Tambah"} Session</h3>

            <label className="block text-sm">
              <span className="font-semibold">Kelas</span>
              <select
                required
                value={form.classId}
                onChange={(e) => setForm(f => ({ ...f, classId: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
              >
                <option value="" disabled>Pilih kelas…</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-semibold">Topik (opsional)</span>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm(f => ({ ...f, topic: e.target.value }))}
                className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
                placeholder="Misal: Pertemuan 1 — Perkenalan"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-semibold">Mulai</span>
                <input
                  type="datetime-local"
                  required
                  value={form.startLocal}
                  onChange={(e) => setForm(f => ({ ...f, startLocal: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold">Selesai</span>
                <input
                  type="datetime-local"
                  required
                  value={form.endLocal}
                  onChange={(e) => setForm(f => ({ ...f, endLocal: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-sm bg-gray-200 text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-sm bg-[#6658DD] text-white text-sm"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
