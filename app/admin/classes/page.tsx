"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ClassRow = {
  id: number;
  code: string;
  name: string;
  semester: "ganjil" | "genap" | null;
  year: string | null;
  program: string | null;
  room_id: number | null;
  room_name: string | null;
  day_of_week: number | null;   // 1..7
  start_time: string | null;    // 'HH:MM:SS'
  end_time: string | null;      // 'HH:MM:SS'
  is_active: 0 | 1;
};

type RoomMini = { id: number; name: string; code?: string | null };

const DAY_LABEL: Record<number, string> = {
  1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat", 6: "Sabtu", 7: "Minggu",
};
const fmtTime = (t?: string | null) => (t ? t.slice(0, 5) : "-");

export default function ClassesPage() {
  const [rows, setRows] = useState<ClassRow[] | null>(null);
  const [rooms, setRooms] = useState<RoomMini[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", name: "", semester: "ganjil", year: "", program: "",
    room_id: "" as string | number,
    day_of_week: 1,
    start_time: "08:00",
    end_time: "10:00",
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    const [rCls, rRooms] = await Promise.all([
      fetch("/api/admin/classes", { cache: "no-store" }),
      fetch("/api/admin/rooms/mini", { cache: "no-store" }),
    ]);
    const cls = await rCls.json();
    const rms = await rRooms.json();
    setRows(cls.classes ?? []);
    setRooms(rms.rooms ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    const payload = {
      ...form,
      room_id: form.room_id ? Number(form.room_id) : null,
      // normalisasi ke 'HH:MM:SS'
      start_time: form.start_time?.length === 5 ? `${form.start_time}:00` : form.start_time,
      end_time: form.end_time?.length === 5 ? `${form.end_time}:00` : form.end_time,
    };
    const r = await fetch("/api/admin/classes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const j = await r.json().catch(()=> ({}));
    if (!r.ok) { alert(j?.error || "Gagal menambah"); return; }
    setOpen(false);
    setForm({ code:"",name:"",semester:"ganjil",year:"",program:"",room_id:"",day_of_week:1,start_time:"08:00",end_time:"10:00",is_active:true });
    load();
  };

  const remove = async (row: ClassRow) => {
    if (!confirm(`Hapus kelas "${row.name}"?`)) return;
    const r = await fetch(`/api/admin/classes/${row.id}`, { method: "DELETE" });
    const j = await r.json().catch(()=>({}));
    if (!r.ok) { alert(j?.error || "Gagal menghapus"); return; }
    load();
  };

  return (
    <>
      <div className="pt-3" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#323a46]">Classes</h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <Link href="/admin/dashboard" className="text-[#6c757d]">Dashboard</Link>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Classes</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xs mb-4">
        <p className="text-[14px] text-[#6c757d]">Kelola daftar kelas, ruangan, dan jam perkuliahan.</p>
        <button
          onClick={()=>setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.75 rounded-sm bg-[#6658DD] text-white text-sm hover:brightness-95"
        >
          <Image src="/add.png" alt="" width={14} height={14} />
          Tambah Class
        </button>
      </div>

      <div className="bg-white rounded-xs px-4 md:px-6 py-5 w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F3F7F9]">
              <tr className="text-left text-sm text-[#343A40] font-bold">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3 min-w-[260px]">Kode — Nama</th>
                <th className="px-4 py-3 min-w-[160px]">Tahun/Semester</th>
                <th className="px-4 py-3 min-w-[220px]">Ruangan</th>
                <th className="px-4 py-3 min-w-[220px]">Hari & Waktu</th>
                <th className="px-4 py-3 text-right w-[240px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6c757d]">Memuat…</td></tr>
              ) : rows && rows.length ? rows.map((c,i)=>(
                <tr key={c.id} className="border-b border-[#EAECEF]">
                  <td className="px-4 py-3 text-sm text-[#6c757d]">{i+1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#323a46]">{c.name || "-"}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.code && <span className="px-2 py-0.5 rounded-sm text-xs bg-[#6c757d] text-white">#{c.code}</span>}
                      <span className={`px-2 py-0.5 rounded-sm text-xs ${c.is_active ? "bg-[#1abc9c]" : "bg-[#A7B3B9]"} text-white`}>
                        {c.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6c757d]">
                    {c.year || "-"} {c.semester ? (c.semester==="ganjil"?"Ganjil":"Genap") : ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6c757d]">{c.room_name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-[#6c757d]">
                    {c.day_of_week ? DAY_LABEL[c.day_of_week] : "-"}{c.start_time ? `, ${fmtTime(c.start_time)} - ${fmtTime(c.end_time)} WIB` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/classes/${c.id}/sessions`} className="px-3 py-1.5 rounded-sm bg-[#43BFE5] text-white text-xs hover:brightness-95">Sessions</Link>
                      <Link href={`/admin/classes/${c.id}/edit`} className="px-3 py-1.5 rounded-sm bg-[#6658DD] text-white text-xs hover:brightness-95">Edit</Link>
                      <button onClick={()=>remove(c)} className="px-3 py-1.5 rounded-sm bg-[#F1556C] text-white text-xs hover:brightness-95">Hapus</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6c757d]">Belum ada kelas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Class */}
      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
          <div className="relative bg-white rounded-md p-4 w-[95%] max-w-3xl">
            <h3 className="font-semibold mb-3">Tambah Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-[#6c757d]">Kode</label>
                <input className="w-full border px-3 py-2 rounded" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))}/>
              </div>
              <div>
                <label className="text-sm text-[#6c757d]">Nama</label>
                <input className="w-full border px-3 py-2 rounded" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Semester</label>
                <select className="w-full border px-3 py-2 rounded" value={form.semester} onChange={e=>setForm(f=>({...f,semester:e.target.value}))}>
                  <option value="ganjil">Ganjil</option><option value="genap">Genap</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[#6c757d]">Tahun</label>
                <input className="w-full border px-3 py-2 rounded" placeholder="2025/2026" value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))}/>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Program</label>
                <input className="w-full border px-3 py-2 rounded" value={form.program} onChange={e=>setForm(f=>({...f,program:e.target.value}))}/>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Ruangan</label>
                <select className="w-full border px-3 py-2 rounded" value={form.room_id} onChange={e=>setForm(f=>({...f,room_id:e.target.value}))}>
                  <option value="">— Pilih Ruangan —</option>
                  {rooms.map(r=>(
                    <option key={r.id} value={r.id}>{r.name}{r.code ? ` (${r.code})` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Hari</label>
                <select className="w-full border px-3 py-2 rounded" value={form.day_of_week} onChange={e=>setForm(f=>({...f,day_of_week:Number(e.target.value)}))}>
                  {Object.entries(DAY_LABEL).map(([k,v])=> <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Mulai</label>
                <input type="time" className="w-full border px-3 py-2 rounded" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))}/>
              </div>
              <div>
                <label className="text-sm text-[#6c757d]">Selesai</label>
                <input type="time" className="w-full border px-3 py-2 rounded" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))}/>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input id="act" type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
                <label htmlFor="act" className="text-sm">Aktif</label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button onClick={()=>setOpen(false)} className="px-3 py-2 rounded border">Batal</button>
                <button onClick={add} className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
