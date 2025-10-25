"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type SessionRow = {
  id: number;
  class_id: number;
  topic: string | null;
  start_at: string;
  end_at: string;
};

function toLocalValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n:number)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function toSQL(local: string) {
  if (!local) return null;
  const d = new Date(local);
  const p = (n:number)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

export default function SessionsPage() {
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();

  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SessionRow | null>(null);
  const [topic, setTopic] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/admin/classes/${classId}/sessions`, { cache: "no-store" });
    const j = await r.json();
    setRows(j.sessions ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [classId]);

  const openAdd = () => {
    setEditing(null);
    setTopic("");
    setStartLocal("");
    setEndLocal("");
    setOpen(true);
  };
  const openEdit = (s: SessionRow) => {
    setEditing(s);
    setTopic(s.topic ?? "");
    setStartLocal(toLocalValue(s.start_at));
    setEndLocal(toLocalValue(s.end_at));
    setOpen(true);
  };
  const close = () => setOpen(false);

  const save = async () => {
    const payload = { topic, start_at: toSQL(startLocal), end_at: toSQL(endLocal) };
    if (!payload.start_at || !payload.end_at) { alert("Lengkapi waktu."); return; }

    if (editing) {
      const r = await fetch(`/api/admin/sessions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) { alert("Gagal menyimpan"); return; }
    } else {
      const r = await fetch(`/api/admin/classes/${classId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) { alert("Gagal menambah"); return; }
    }
    close();
    load();
  };

  const remove = async (s: SessionRow) => {
    if (!confirm("Hapus session ini? Semua presensi di pertemuan ini juga akan terhapus.")) return;
    const r = await fetch(`/api/admin/sessions/${s.id}`, { method: "DELETE" });
    if (!r.ok) { alert("Gagal menghapus"); return; }
    load();
  };

  return (
    <div className="bg-white rounded-xs p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Sessions — Class #{classId}</h2>
        <div className="flex gap-2">
          <button onClick={()=>router.push("/admin/classes")} className="px-3 py-2 rounded border">Kembali</button>
          <button onClick={openAdd} className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95">Tambah Session</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#F3F7F9]">
            <tr className="text-left text-sm text-[#343A40] font-bold">
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Topik</th>
              <th className="px-4 py-3">Mulai</th>
              <th className="px-4 py-3">Selesai</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6c757d]">Memuat…</td></tr>
            ) : rows.length ? rows.map((s,i)=>(
              <tr key={s.id} className="border-b border-[#EAECEF]">
                <td className="px-4 py-3 text-sm text-[#6c757d]">{i+1}</td>
                <td className="px-4 py-3">{s.topic ?? "-"}</td>
                <td className="px-4 py-3">{new Date(s.start_at).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">{new Date(s.end_at).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={()=>openEdit(s)} className="px-3 py-1.5 rounded bg-[#43BFE5] text-white text-xs hover:brightness-95">Edit</button>
                    <button onClick={()=>remove(s)} className="px-3 py-1.5 rounded bg-[#F1556C] text-white text-xs hover:brightness-95">Hapus</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6c757d]">Belum ada sessions.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={close}/>
          <div className="relative bg-white rounded-md p-4 w-[90%] max-w-lg">
            <h3 className="font-semibold mb-3">{editing ? "Edit Session" : "Tambah Session"}</h3>
            <div className="grid gap-3">
              <div>
                <label className="text-sm text-[#6c757d]">Topik</label>
                <input className="w-full border px-3 py-2 rounded" value={topic} onChange={e=>setTopic(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[#6c757d]">Mulai</label>
                <input type="datetime-local" className="w-full border px-3 py-2 rounded" value={startLocal} onChange={e=>setStartLocal(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[#6c757d]">Selesai</label>
                <input type="datetime-local" className="w-full border px-3 py-2 rounded" value={endLocal} onChange={e=>setEndLocal(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={close} className="px-3 py-2 rounded border">Batal</button>
                <button onClick={save} className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
