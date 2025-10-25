"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Room = { id: number; code: string | null; name: string | null; is_active: 0 | 1 };
type Reader = {
  id: number;
  name: string;
  room_id: number;
  room_code: string | null;
  room_name: string | null;
  gateway_url: string | null;
  secret: string;
  is_active: 0 | 1;
  last_heartbeat: string | null;
};

export default function ReadersPage() {
  const [rows, setRows] = useState<Reader[] | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    room_id: 0,
    gateway_url: "",
    secret: "",
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    const [rReaders, rRooms] = await Promise.all([
      fetch("/api/admin/readers", { cache: "no-store" }),
      fetch("/api/admin/rooms", { cache: "no-store" }),
    ]);
    const jr = await rReaders.json();
    const jm = await rRooms.json();
    setRows(jr.readers ?? []);
    setRooms((jm.rooms ?? []).filter((x: Room) => x.is_active === 1));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.room_id) { alert("Pilih room."); return; }
    if (!form.name.trim()) { alert("Nama wajib diisi."); return; }
    if (!form.secret.trim()) { alert("Secret wajib diisi."); return; }

    const res = await fetch("/api/admin/readers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { alert(j?.error || "Gagal menambah"); return; }
    setOpen(false);
    setForm({ name:"", room_id:0, gateway_url:"", secret:"", is_active:true });
    load();
  };

  const remove = async (row: Reader) => {
    if (!confirm(`Hapus reader "${row.name}"?`)) return;
    const r = await fetch(`/api/admin/readers/${row.id}`, { method: "DELETE" });
    const j = await r.json().catch(()=>({}));
    if (!r.ok) { alert(j?.error || "Gagal menghapus"); return; }
    load();
  };

  return (
    <>
      <div className="pt-3" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#323a46]">RFID Readers</h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <Link href="/admin/dashboard" className="text-[#6c757d]">Dashboard</Link>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">RFID Readers</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xs mb-4">
        <p className="text-[14px] text-[#6c757d]">Kelola perangkat pembaca kartu RFID per ruangan.</p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.75 rounded-sm bg-[#6658DD] text-white text-sm hover:brightness-95"
        >
          <Image src="/add.png" alt="" width={14} height={14} />
          Tambah Reader
        </button>
      </div>

      <div className="bg-white rounded-xs px-4 md:px-6 py-5 w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F3F7F9]">
              <tr className="text-left text-sm text-[#343A40] font-bold">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3 min-w-[220px]">Nama Reader</th>
                <th className="px-4 py-3 min-w-[220px]">Ruangan</th>
                <th className="px-4 py-3 min-w-[260px]">Gateway URL</th>
                <th className="px-4 py-3 min-w-[140px]">Status</th>
                <th className="px-4 py-3 min-w-[180px]">Last Heartbeat</th>
                <th className="px-4 py-3 text-right w-[230px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6c757d]">Memuat…</td></tr>
              ) : rows && rows.length ? rows.map((r, i) => (
                <tr key={r.id} className="border-b border-[#EAECEF]">
                  <td className="px-4 py-3 text-sm text-[#6c757d]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[#323a46]">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-[#6c757d]">
                    <span className="px-2 py-0.5 rounded-sm text-xs bg-[#6c757d] text-white">#{r.room_code}</span>{" "}
                    {r.room_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6c757d]">{r.gateway_url || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-sm text-xs ${r.is_active ? "bg-[#1abc9c]" : "bg-[#A7B3B9]"} text-white`}>
                      {r.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6c757d]">{r.last_heartbeat || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/readers/${r.id}/edit`} className="px-3 py-1.5 rounded-sm bg-[#6658DD] text-white text-xs hover:brightness-95">
                        Edit
                      </Link>
                      <button onClick={() => remove(r)} className="px-3 py-1.5 rounded-sm bg-[#F1556C] text-white text-xs hover:brightness-95">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6c757d]">Belum ada reader.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Reader */}
      {open && (
        <div className="fixed inset-0 z-[1000] grid place-items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-md p-4 w-[95%] max-w-2xl">
            <h3 className="font-semibold mb-3">Tambah Reader</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm text-[#6c757d]">Nama Reader</label>
                <input className="w-full border px-3 py-2 rounded"
                       value={form.name}
                       onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Ruangan</label>
                <select className="w-full border px-3 py-2 rounded"
                        value={form.room_id}
                        onChange={e=>setForm(f=>({...f, room_id:Number(e.target.value)}))}>
                  <option value={0}>-- pilih ruangan --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.code} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-[#6c757d]">Gateway URL (opsional)</label>
                <input className="w-full border px-3 py-2 rounded"
                       value={form.gateway_url}
                       onChange={e=>setForm(f=>({...f, gateway_url:e.target.value}))}/>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-[#6c757d]">Secret</label>
                <input className="w-full border px-3 py-2 rounded"
                       value={form.secret}
                       onChange={e=>setForm(f=>({...f, secret:e.target.value}))}
                       placeholder="kunci untuk autentikasi gateway → server"/>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input id="act" type="checkbox" checked={form.is_active}
                       onChange={e=>setForm(f=>({...f, is_active:e.target.checked}))}/>
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
