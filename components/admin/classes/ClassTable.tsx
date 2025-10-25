"use client";

import React, { useState } from "react";

export type AdminClass = {
  id: number;
  code: string;
  name: string;
  semester: "ganjil" | "genap";
  year: string;
  program: string | null;
  room: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: 0 | 1;
  created_at: string;
  instructor_count: number;
  session_count: number;
  student_count: number;
};

export default function ClassTable({
  data,
  loading,
  onEdit,
  onChanged,
}: {
  data: AdminClass[];
  loading?: boolean;
  onEdit: (row: AdminClass) => void;
  onChanged: () => void;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const doDelete = async (id: number) => {
    if (!confirm("Hapus kelas ini beserta semua data terkait?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Gagal hapus");
      onChanged();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus kelas.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <table className="w-full border-collapse">
      <thead className="bg-[#F3F7F9]">
        <tr className="text-left text-sm text-[#343A40] font-bold border-b-2 border-[#DEE2E6]">
          <th className="px-4 py-3">Kode</th>
          <th className="px-4 py-3">Nama</th>
          <th className="px-4 py-3">Semester</th>
          <th className="px-4 py-3">Tahun</th>
          <th className="px-4 py-3">Program</th>
          <th className="px-4 py-3">Ruangan</th>
          <th className="px-4 py-3 text-center">Dosen</th>
          <th className="px-4 py-3 text-center">Sesi</th>
          <th className="px-4 py-3 text-center">Mhs</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3 w-40">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={11}>Memuat…</td></tr>
        ) : data.length === 0 ? (
          <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={11}>Belum ada data</td></tr>
        ) : (
          data.map((r) => (
            <tr key={r.id} className="border-b-2 border-[#EAECEF]">
              <td className="px-4 py-3">{r.code}</td>
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3 capitalize">{r.semester}</td>
              <td className="px-4 py-3">{r.year}</td>
              <td className="px-4 py-3">{r.program ?? "-"}</td>
              <td className="px-4 py-3">{r.room ?? "-"}</td>
              <td className="px-4 py-3 text-center">{r.instructor_count}</td>
              <td className="px-4 py-3 text-center">{r.session_count}</td>
              <td className="px-4 py-3 text-center">{r.student_count}</td>
              <td className="px-4 py-3">{r.is_active ? "Aktif" : "Nonaktif"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs rounded bg-[#6658DD] text-white hover:brightness-95"
                    onClick={() => onEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded bg-[#f1556c] text-white hover:brightness-95 disabled:opacity-60"
                    onClick={() => doDelete(r.id)}
                    disabled={deletingId === r.id}
                  >
                    {deletingId === r.id ? "Hapus…" : "Hapus"}
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
