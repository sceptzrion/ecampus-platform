"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Form = {
  code: string;
  name: string;
  location: string;
  is_active: boolean;
};

export default function EditRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<Form>({
    code: "",
    name: "",
    location: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/admin/rooms/${id}`, { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (r.ok) {
          setForm({
            code: j.code ?? "",
            name: j.name ?? "",
            location: j.location ?? "",
            is_active: !!j.is_active,
          });
        } else {
          alert(j?.error || "Gagal memuat data");
          router.push("/admin/rooms");
        }
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
      const r = await fetch(`/api/admin/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Gagal menyimpan");
      alert("Tersimpan.");
      router.push("/admin/rooms");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 bg-white rounded-xs">Memuat…</div>;

  return (
    <div className="bg-white rounded-xs p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Room</h2>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-[#6c757d]">Kode</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm text-[#6c757d]">Nama</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-[#6c757d]">Lokasi</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="act"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          />
          <label htmlFor="act" className="text-sm">
            Aktif
          </label>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button type="button" onClick={() => history.back()} className="px-3 py-2 rounded border">
            Kembali
          </button>
          <button
            disabled={saving}
            className="px-3 py-2 rounded bg-[#6658DD] text-white hover:brightness-95"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
