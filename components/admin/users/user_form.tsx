"use client";

import React, { useState } from "react";

type User = {
  id: number;
  name: string;
  nim: string | null;
  email: string;
  rfid_uid: string | null;
  password: string;                           // plain (prototipe)
  role: "admin" | "staff" | "student";
  is_active: 0 | 1;
};

export default function UserForm({
  user,
  onCancel,
  onSaved,
}: {
  user: User | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: (user?.role ?? "student") as "admin" | "staff" | "student",
    nim: user?.nim ?? "",
    rfid_uid: user?.rfid_uid ?? "",
    password: "",                 // saat edit, kosong = jangan ubah
    is_active: (user?.is_active ?? 1) as 0 | 1,
  });
  const [saving, setSaving] = useState(false);

  // ====== RFID scan state ======
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === "is_active") {
      setForm((f) => ({ ...f, is_active: (e.target as HTMLInputElement).checked ? 1 : 0 }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "number" ? Number(value) : value }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = user ? "PUT" : "POST";
    const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    onSaved();
  };

  // ====== Helper: normalisasi UID (hapus spasi, uppercase) ======
  const normalizeUID = (s: string) =>
    s.replace(/[^0-9a-f]/gi, "").toUpperCase();

  // ====== SCAN via Web Serial API (Chromium) ======
  const scanRfid = async () => {
    if (!("serial" in navigator)) {
      alert(
        "Browser tidak mendukung Web Serial API. Coba Chrome/Edge terbaru, atau isi UID secara manual."
      );
      return;
    }
    try {
      setScanMsg("");
      setScanning(true);

      // 1) Minta user pilih port
      const port = await (navigator as any).serial.requestPort();
      // 2) Buka port — sesuaikan baudRate dengan firmware reader (umum 9600/115200)
      await port.open({ baudRate: 115200 });

      // 3) Reader untuk stream
      const decoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      setScanMsg("Tempelkan kartu ke reader…");

      // 4) Baca satu baris (hingga newline) / atau 8–16 hex chars
      let buffer = "";
      const deadline = Date.now() + 15_000; // 15s timeout

      try {
        // tunggu sampai dapat UID yang valid atau timeout
        while (Date.now() < deadline) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            let found = false;
            for (const ln of lines) {
                const uid = normalizeUID(ln);
                if (uid.length >= 6) {
                setForm((f) => ({ ...f, rfid_uid: uid }));
                setScanMsg(`UID terdeteksi: ${uid}`);
                found = true;
                break;
                }
            }

            if (found) {
                await reader.cancel();
                break; // langsung keluar dari loop
            }
         }

        }
        if (!form.rfid_uid && !buffer) {
          setScanMsg("Tidak ada data masuk. Coba lagi.");
        } else if (!form.rfid_uid && buffer) {
          const uid = normalizeUID(buffer);
          if (uid.length >= 6) {
            setForm((f) => ({ ...f, rfid_uid: uid }));
            setScanMsg(`UID terdeteksi: ${uid}`);
          } else {
            setScanMsg("Data tidak valid. Coba lagi.");
          }
        }
      } catch (e) {
        console.error(e);
        setScanMsg("Gagal membaca dari serial.");
      } finally {
        try { await reader.releaseLock(); } catch {}
        try { await port.close(); } catch {}
        try { await readableStreamClosed; } catch {}
      }
    } catch (e: any) {
      if (e?.name === "NotFoundError") {
        // user batal pilih port — tidak perlu alert
      } else {
        console.error(e);
        alert("Gagal memulai scan RFID. Pastikan device terhubung & izinkan akses.");
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg p-6 w-[520px]">
        <h2 className="text-lg font-semibold mb-4">{user ? "Edit User" : "Tambah User"}</h2>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Nama"
            className="border px-3 py-1.5 rounded text-sm"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="border px-3 py-1.5 rounded text-sm"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="border px-3 py-1.5 rounded text-sm"
          >
            <option value="admin">Admin</option>
            <option value="staff">Dosen</option>
            <option value="student">Mahasiswa</option>
          </select>

          <input
            name="nim"
            value={form.nim}
            onChange={onChange}
            placeholder="NIM (opsional)"
            className="border px-3 py-1.5 rounded text-sm"
          />

          {/* ====== RFID field + tombol SCAN ====== */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              name="rfid_uid"
              value={form.rfid_uid}
              onChange={(e) =>
                setForm((f) => ({ ...f, rfid_uid: normalizeUID(e.target.value) }))
              }
              placeholder="UID RFID (opsional)"
              className="border px-3 py-1.5 rounded text-sm"
            />
            <button
              type="button"
              onClick={scanRfid}
              disabled={scanning}
              className="px-3 py-1.5 rounded text-sm bg-[#15B2C5] text-white hover:brightness-95 disabled:opacity-60"
              title="Scan dari pembaca RFID via Web Serial"
            >
              {scanning ? "Memindai…" : "Scan Kartu"}
            </button>
          </div>
          {scanMsg && (
            <div className="text-xs text-gray-600 -mt-2">{scanMsg}</div>
          )}

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder={user ? "Password (kosongkan bila tidak diubah)" : "Password"}
            className="border px-3 py-1.5 rounded text-sm"
            {...(user ? {} : { required: true })}
          />

          <label className="text-sm inline-flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              name="is_active"
              checked={!!form.is_active}
              onChange={onChange}
            />
            Aktif
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded bg-[#6658DD] text-white hover:bg-[#5747c2] text-sm"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>

          {/* Catatan dukungan browser */}
          <p className="text-[11px] text-gray-500 mt-1">
            * Tombol <b>Scan Kartu</b> memerlukan Chrome/Edge (Web Serial API) dan pembaca RFID yang
            mengirim UID sebagai teks (contoh: hexdump diakhiri newline). Jika tidak didukung,
            isi UID secara manual.
          </p>
        </form>
      </div>
    </div>
  );
}
