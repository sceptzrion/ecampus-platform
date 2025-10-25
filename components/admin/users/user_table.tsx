"use client";

import React, { useEffect, useMemo, useState } from "react";
import UserForm from "./user_form";

type User = {
  id: number;
  name: string;
  nim: string | null;
  email: string;
  rfid_uid: string | null;
  password: string;           // plain (prototipe)
  role: "admin" | "staff" | "student";
  is_active: 0 | 1;
  created_at: string;
};

function sha256Hex(s: string) {
  if (!s) return "";
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(s)).then((buf) => {
    const bytes = Array.from(new Uint8Array(buf));
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  });
}

export default function UserTable() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<User | null>(null);
  const [revealPlain, setRevealPlain] = useState(false);
  const [hashMap, setHashMap] = useState<Record<number, string>>({});
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | "admin" | "staff" | "student">("");

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const json = await res.json();
    const list = (json.users || []) as User[];
    setRows(list);

    // precompute hash untuk tampilan
    const hm: Record<number, string> = {};
    for (const u of list) {
      hm[u.id] = u.password ? (await sha256Hex(u.password)) : "";
    }
    setHashMap(hm);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (role) list = list.filter((r) => r.role === role);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          (r.nim || "").toLowerCase().includes(s) ||
          (r.rfid_uid || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [rows, q, role]);

  const onDelete = async (id: number) => {
    if (!confirm("Hapus user ini?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const openAdd = () => {
    setEditData(null);
    setOpenForm(true);
  };
  const openEdit = (u: User) => {
    setEditData(u);
    setOpenForm(true);
  };
  const onSaved = () => {
    setOpenForm(false);
    fetchAll();
  };

  const toggleActive = async (u: User) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...u, is_active: u.is_active ? 0 : 1, password: "" }), // kosong → tidak ubah password
    });
    fetchAll();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 justify-between mb-4">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / email / NIM / UID…"
            className="border px-3 py-1.5 rounded text-sm w-64"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="border px-3 py-1.5 rounded text-sm"
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Dosen</option>
            <option value="student">Mahasiswa</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm flex items-center gap-1">
            <input
              type="checkbox"
              checked={revealPlain}
              onChange={(e) => setRevealPlain(e.target.checked)}
            />
            Tampilkan password asli
          </label>
          <button
            onClick={openAdd}
            className="bg-[#6658DD] hover:bg-[#5747c2] text-white text-sm px-4 py-2 rounded"
          >
            + Tambah User
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Memuat data…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">Nama</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Role</th>
                <th className="py-2 px-3 text-left">No ID</th>
                <th className="py-2 px-3 text-left">UID RFID</th>
                <th className="py-2 px-3 text-left">Password</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Dibuat</th>
                <th className="py-2 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-3">{i + 1}</td>
                  <td className="py-2 px-3">{u.name}</td>
                  <td className="py-2 px-3">{u.email}</td>
                  <td className="py-2 px-3 capitalize">{u.role}</td>
                  <td className="py-2 px-3">{u.nim ?? "-"}</td>
                  <td className="py-2 px-3">{u.rfid_uid ?? "-"}</td>
                  <td className="py-2 px-3 font-mono">
                    {revealPlain
                      ? u.password || "-"
                      : hashMap[u.id]
                      ? `${hashMap[u.id].slice(0, 12)}…`
                      : "—"}
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                      }`}
                      title="Toggle aktif/nonaktif"
                    >
                      {u.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="py-2 px-3">
                    {new Date(u.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(u.id)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-6">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {openForm && (
        <UserForm user={editData} onCancel={() => setOpenForm(false)} onSaved={onSaved} />
      )}
    </>
  );
}
