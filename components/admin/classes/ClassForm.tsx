"use client";

import React, { useEffect, useMemo, useState } from "react";

type Instructor = { id: number; name: string; email: string };

export type ClassInitial = {
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
};

export default function ClassForm({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: (changed?: boolean) => void;
  initial?: ClassInitial;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [semester, setSemester] = useState<"ganjil" | "genap">(initial?.semester ?? "ganjil");
  const [year, setYear] = useState(initial?.year ?? "");
  const [program, setProgram] = useState(initial?.program ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [active, setActive] = useState(Boolean(initial?.is_active ?? 1));
  const [instructors, setInstructors] = useState<number[]>([]);
  const [allInstr, setAllInstr] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);

  const title = initial ? "Edit Kelas" : "Tambah Kelas";

  // load instructors & prefill when editing
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/instructors", { cache: "no-store" });
        const json = await res.json();
        if (alive && json?.ok) setAllInstr(json.instructors);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!initial?.id) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/classes/${initial.id}`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (json?.ok) {
          const ids = (json.instructors as Instructor[]).map((i) => i.id);
          setInstructors(ids);
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [initial?.id]);

  const canSubmit = useMemo(() => {
    return code.trim() && name.trim() && year.trim();
  }, [code, name, year]);

  if (!open) return null;

  const doSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      const payload = {
        code: code.trim(),
        name: name.trim(),
        semester,
        year: year.trim(),
        program: program.trim() || null,
        room: room.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: active,
        instructorIds: instructors,
      };

      const url = initial ? `/api/admin/classes/${initial.id}` : "/api/admin/classes";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Gagal menyimpan");
      onClose(true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Gagal menyimpan kelas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000]">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
      <div className="relative z-[2001] w-[95%] max-w-2xl mx-auto mt-10 bg-white rounded-md shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-2 py-1 border rounded text-sm"
          >
            Tutup
          </button>
        </div>

        <form onSubmit={doSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Kode</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Nama</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Tahun Ajar</label>
            <input placeholder="2025/2026" value={year} onChange={(e) => setYear(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Program</label>
            <input value={program} onChange={(e) => setProgram(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Ruangan</label>
            <input value={room} onChange={(e) => setRoom(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Mulai</label>
            <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Selesai</label>
            <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-xs text-gray-600">Dosen Pengampu</label>
            <MultiSelect
              all={allInstr}
              selected={instructors}
              onChange={setInstructors}
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input id="active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <label htmlFor="active" className="text-sm">Aktif</label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => onClose(false)} className="px-3 py-1.5 border rounded text-sm">Batal</button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="px-3 py-1.5 rounded text-sm bg-[#6658DD] text-white disabled:opacity-60"
            >
              {loading ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ====== MultiSelect tiny ====== */
function MultiSelect({
  all,
  selected,
  onChange,
}: {
  all: Instructor[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="border rounded p-2 max-h-56 overflow-auto">
      {all.length === 0 ? (
        <div className="text-xs text-gray-500">Belum ada dosen aktif.</div>
      ) : (
        all.map((i) => (
          <label key={i.id} className="flex items-center gap-2 py-1 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(i.id)}
              onChange={() => toggle(i.id)}
            />
            <span>{i.name}</span>
            <span className="text-xs text-gray-500">&lt;{i.email}&gt;</span>
          </label>
        ))
      )}
    </div>
  );
}
