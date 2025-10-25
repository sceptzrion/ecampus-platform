// components/admin/classes/SessionManager.tsx
"use client";

import React, { useEffect, useState } from "react";
import { localInputToUTCISO, utcToLocalInput } from "@/lib/datetime";

type Item = {
  id: number;
  classId: number;
  classLabel: string;
  topic: string | null;
  startAt: string; // UTC from DB
  endAt: string;   // UTC from DB
};

export default function SessionManager({
  classId,
  classLabel,
  onClose,
  onSaved,
}: {
  classId: number;
  classLabel: string;
  onClose?: () => void;
  onSaved?: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({
    topic: "",
    startLocal: "",
    endLocal: "",
  });

  const fetchSessions = async () => {
    setLoading(true);
    const res = await fetch(`/api/sessions?classId=${classId}`, { cache: "no-store" });
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions().catch(console.error);
  }, [classId]);

  const resetForm = () => {
    setEditing(null);
    setForm({ topic: "", startLocal: "", endLocal: "" });
  };

  const startCreate = () => {
    resetForm();
  };

  const startEdit = (it: Item) => {
    setEditing(it);
    setForm({
      topic: it.topic ?? "",
      startLocal: utcToLocalInput(it.startAt),
      endLocal: utcToLocalInput(it.endAt),
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      classId,
      topic: form.topic.trim() || null,
      startAt: localInputToUTCISO(form.startLocal),
      endAt: localInputToUTCISO(form.endLocal),
    };
    const url = editing ? `/api/sessions/${editing.id}` : "/api/sessions";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Gagal menyimpan sesi.");
      return;
    }
    await fetchSessions();
    resetForm();
    onSaved?.();
  };

  const remove = async (id: number) => {
    if (!confirm("Hapus sesi ini?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Gagal menghapus sesi.");
      return;
    }
    await fetchSessions();
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative z-[1001] w-[95%] max-w-5xl bg-white rounded-md shadow p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Kelola Sesi</h3>
            <div className="text-sm text-[#6c757d] mt-0.5">
              Kelas: <span className="font-medium">{classLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-sm bg-yellow-400 text-white text-sm hover:bg-yellow-500"
          >
            Tutup
          </button>
        </div>

        {/* Form tambah/edit */}
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#f8fafb] p-3 rounded-md mb-4">
          <label className="block text-sm">
            <span className="font-semibold">Topik (opsional)</span>
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
              placeholder="Misal: Pertemuan 1 — Pengantar"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Mulai</span>
            <input
              type="datetime-local"
              required
              value={form.startLocal}
              onChange={(e) => setForm((f) => ({ ...f, startLocal: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Selesai</span>
            <input
              type="datetime-local"
              required
              value={form.endLocal}
              onChange={(e) => setForm((f) => ({ ...f, endLocal: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-sm px-2 py-1"
            />
          </label>

          <div className="md:col-span-3 flex gap-2 justify-end">
            {editing ? (
              <button
                type="button"
                onClick={startCreate}
                className="px-3 py-1.5 rounded-sm bg-gray-200 text-sm"
              >
                Batal Edit
              </button>
            ) : null}
            <button
              type="submit"
              className="px-3 py-1.5 rounded-sm bg-[#6658DD] text-white text-sm"
            >
              {editing ? "Simpan Perubahan" : "Tambah Session"}
            </button>
          </div>
        </form>

        {/* Tabel sesi */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F3F7F9]">
              <tr className="text-left text-sm text-[#343A40] font-bold border-b-2 border-[#DEE2E6]">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Topik</th>
                <th className="px-4 py-3">Mulai (UTC)</th>
                <th className="px-4 py-3">Selesai (UTC)</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Memuat…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Belum ada sesi.</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id} className="border-b-2 border-[#EAECEF] hover:bg-[#F8FAFB]">
                    <td className="px-4 py-3 text-sm text-[#6c757d]">{idx + 1}</td>
                    <td className="px-4 py-3">{it.topic ?? "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{it.startAt.replace("T", " ").slice(0,19)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{it.endAt.replace("T", " ").slice(0,19)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(it)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
