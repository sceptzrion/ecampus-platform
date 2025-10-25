"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Form = {
  code: string;
  name: string;
  semester: "ganjil" | "genap";
  year: string;
  program: string;
  room_id: number | "" ;
  day_of_week: number;      // 1..7
  start_time: string;       // 'HH:MM'
  end_time: string;         // 'HH:MM'
  is_active: boolean;
};

type RoomMini = { id: number; name: string; code?: string|null };

const DAY_LABEL: Record<number,string> = {1:"Senin",2:"Selasa",3:"Rabu",4:"Kamis",5:"Jumat",6:"Sabtu",7:"Minggu"};

export default function EditClassPage() {
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomMini[]>([]);
  const [form, setForm] = useState<Form>({
    code:"", name:"", semester:"ganjil", year:"", program:"",
    room_id: "", day_of_week:1, start_time:"08:00", end_time:"10:00", is_active:true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [rDetail, rRooms] = await Promise.all([
          fetch(`/api/admin/classes/${classId}`, { cache: "no-store" }),
          fetch(`/api/admin/rooms/mini`, { cache: "no-store" }),
        ]);
        const detail = await rDetail.json();
        const rms = await rRooms.json();
        if (!alive) return;

        setRooms(rms.rooms ?? []);

        if (detail) {
          setForm({
            code: detail.code ?? "",
            name: detail.name ?? "",
            semester: (detail.semester ?? "ganjil") as "ganjil" | "genap",
            year: detail.year ?? "",
            program: detail.program ?? "",
            room_id: detail.room_id ?? "",
            day_of_week: Number(detail.day_of_week ?? 1),
            start_time: (detail.start_time ?? "08:00").slice(0,5),
            end_time: (detail.end_time ?? "10:00").slice(0,5),
            is_active: !!detail.is_active,
          });
        } else {
          alert("Data tidak ditemukan");
          router.push("/admin/classes");
        }
      } catch (e:any) {
        alert(e.message || "Gagal memuat data");
        router.push("/admin/classes");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [classId, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        room_id: form.room_id ? Number(form.room_id) : null,
        start_time: form.start_time.length===5 ? `${form.start_time}:00` : form.start_time,
        end_time: form.end_time.length===5 ? `${form.end_time}:00` : form.end_time,
      };
      const r = await fetch(`/api/admin/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(()=> ({}));
      if (!r.ok) throw new Error(j?.error || "Gagal menyimpan");
      alert("Tersimpan.");
      router.push("/admin/classes");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded-xs">Memuat…</div>;

  return (
    <div className="bg-white rounded-xs p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Class</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-[#6c757d]">Kode</label>
          <input className="w-full border px-3 py-2 rounded" value={form.code}
                 onChange={e=>setForm(f=>({...f,code:e.target.value}))}/>
        </div>
        <div>
          <label className="text-sm text-[#6c757d]">Nama</label>
          <input className="w-full border px-3 py-2 rounded" value={form.name}
                 onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        </div>

        <div>
          <label className="text-sm text-[#6c757d]">Semester</label>
          <select className="w-full border px-3 py-2 rounded" value={form.semester}
                  onChange={e=>setForm(f=>({...f,semester:e.target.value as "ganjil"|"genap"}))}>
            <option value="ganjil">Ganjil</option>
            <option value="genap">Genap</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[#6c757d]">Tahun (mis. 2025/2026)</label>
          <input className="w-full border px-3 py-2 rounded" value={form.year}
                 onChange={e=>setForm(f=>({...f,year:e.target.value}))}/>
        </div>

        <div>
          <label className="text-sm text-[#6c757d]">Program</label>
          <input className="w-full border px-3 py-2 rounded" value={form.program}
                 onChange={e=>setForm(f=>({...f,program:e.target.value}))}/>
        </div>

        <div>
          <label className="text-sm text-[#6c757d]">Ruangan</label>
          <select className="w-full border px-3 py-2 rounded" value={form.room_id}
                  onChange={e=>setForm(f=>({...f,room_id:e.target.value ? Number(e.target.value) : ""}))}>
            <option value="">— Pilih Ruangan —</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}{r.code ? ` (${r.code})` : ""}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-[#6c757d]">Hari</label>
          <select className="w-full border px-3 py-2 rounded" value={form.day_of_week}
                  onChange={e=>setForm(f=>({...f,day_of_week:Number(e.target.value)}))}>
            {Object.entries(DAY_LABEL).map(([k,v])=> <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-[#6c757d]">Mulai</label>
          <input type="time" className="w-full border px-3 py-2 rounded"
                 value={form.start_time}
                 onChange={e=>setForm(f=>({...f,start_time:e.target.value}))}/>
        </div>
        <div>
          <label className="text-sm text-[#6c757d]">Selesai</label>
          <input type="time" className="w-full border px-3 py-2 rounded"
                 value={form.end_time}
                 onChange={e=>setForm(f=>({...f,end_time:e.target.value}))}/>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input id="act" type="checkbox" checked={form.is_active}
                 onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
          <label htmlFor="act" className="text-sm">Aktif</label>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={()=>history.back()}
                  className="px-3 py-2 rounded border">Kembali</button>
          <button disabled={saving}
                  className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95">
            {saving? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
