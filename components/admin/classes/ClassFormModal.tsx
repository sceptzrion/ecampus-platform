"use client";

import React from "react";

export type ClassRow = {
  id?: number;
  code: string;
  name: string;
  semester: "odd" | "even";
  year: number;
  program: string | null;
  room: string | null;
  start_date: string | null; // ISO (datetime-local)
  end_date: string | null;   // ISO (datetime-local)
  is_active: boolean;
};

function toLocalDT(value?: string | null) {
  if (!value) return "";
  // value dari DB biasanya "YYYY-MM-DD HH:MM:SS" UTC/LOCAL → jadikan datetime-local
  // biarkan apa adanya kalau sudah ISO
  const d = new Date(value);
  // yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}

export default function ClassFormModal({
  open,
  mode, // "create" | "edit"
  initialData,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Partial<ClassRow> | null;
  onClose: () => void;
  onSaved: () => void; // dipanggil ketika berhasil simpan
}) {
  const [form, setForm] = React.useState<ClassRow>({
    code: "",
    name: "",
    semester: "odd",
    year: new Date().getFullYear(),
    program: "",
    room: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [submitting, setSubmitting] = React.useState(false);

  // Prefill saat initialData berubah / saat open
  React.useEffect(() => {
    if (!open) return;
    if (!initialData) {
      setForm({
        code: "",
        name: "",
        semester: "odd",
        year: new Date().getFullYear(),
        program: "",
        room: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
      return;
    }
    setForm({
      id: initialData.id,
      code: initialData.code ?? "",
      name: initialData.name ?? "",
      semester: (initialData.semester as any) ?? "odd",
      year: Number(initialData.year ?? new Date().getFullYear()),
      program: initialData.program ?? "",
      room: initialData.room ?? "",
      start_date: toLocalDT(initialData.start_date ?? null),
      end_date: toLocalDT(initialData.end_date ?? null),
      is_active: Boolean(initialData.is_active ?? true),
    });
  }, [open, initialData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? Boolean(checked) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        semester: form.semester,
        year: Number(form.year),
        program: form.program?.trim() || null,
        room: form.room?.trim() || null,
        start_date: form.start_date ? new Date(form.start_date).toISOString().slice(0, 19).replace("T", " ") : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString().slice(0, 19).replace("T", " ") : null,
        is_active: form.is_active,
      };

      if (mode === "create") {
        const res = await fetch("/api/admin/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal membuat class");
      } else {
        const id = form.id!;
        const res = await fetch(`/api/admin/classes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal mengubah class");
      }

      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* Dialog */}
      <div className="relative z-[1201] w-[95%] max-w-2xl bg-white rounded-md shadow-lg border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#343a40]">
            {mode === "create" ? "Tambah Class" : "Edit Class"}
          </h3>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-gray-100">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Kode</label>
            <input
              name="code"
              value={form.code}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="mis. 2515520028"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nama</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="mis. CAPSTONE PROJECT"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Semester</label>
            <select
              name="semester"
              value={form.semester}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="odd">Ganjil</option>
              <option value="even">Genap</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tahun</label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Program</label>
            <input
              name="program"
              value={form.program ?? ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="mis. S1-IF"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Ruangan</label>
            <input
              name="room"
              value={form.room ?? ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="mis. FASILKOM 4.79-5 (251-7A-22)"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Mulai</label>
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date ?? ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Selesai</label>
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date ?? ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
              className="h-4 w-4"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Aktif
            </label>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded border text-sm">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 rounded bg-[#6658DD] text-white text-sm disabled:opacity-60"
            >
              {submitting ? "Menyimpan..." : mode === "create" ? "Simpan" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
