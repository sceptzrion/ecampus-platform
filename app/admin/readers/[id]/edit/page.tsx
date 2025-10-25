"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Room = { id: number; code: string | null; name: string | null; is_active: 0 | 1 };
type Form = {
  name: string;
  room_id: number;
  gateway_url: string;
  secret: string;
  is_active: boolean;
};

export default function EditReaderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState<Form>({
    name: "",
    room_id: 0,
    gateway_url: "",
    secret: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [rReader, rRooms] = await Promise.all([
          fetch(`/api/admin/readers/${id}`, { cache: "no-store" }),
          fetch("/api/admin/rooms", { cache: "no-store" }),
        ]);
        const jr = await rReader.json();
        const jm = await rRooms.json();
        if (!alive) return;

        if (!rReader.ok) {
          alert(jr?.error || "Reader tidak ditemukan");
          router.push("/admin/readers");
          return;
        }

        setRooms((jm.rooms ?? []).filter((x: Room) => x.is_active === 1));
        setForm({
          name: jr.name ?? "",
          room_id: Number(jr.room_id) || 0,
          gateway_url: jr.gateway_url ?? "",
          secret: jr.secret ?? "",
          is_active: !!jr.is_active,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const r = await fetch(`/api/admin/readers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Gagal menyimpan");
      alert("Tersimpan.");
      router.push("/admin/readers");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded-xs">Memuat…</div>;

  return (
    <div className="bg-white rounded-xs p-6">
      <h2 className="text-lg font-semibold mb-4">Edit RFID Reader</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 onChange={e=>setForm(f=>({...f, secret:e.target.value}))}/>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input id="act" type="checkbox" checked={form.is_active}
                 onChange={e=>setForm(f=>({...f, is_active:e.target.checked}))}/>
          <label htmlFor="act" className="text-sm">Aktif</label>
        </div>

        <div className="md:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={()=>history.back()} className="px-3 py-2 rounded border">
            Kembali
          </button>
          <button disabled={saving} className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95">
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
