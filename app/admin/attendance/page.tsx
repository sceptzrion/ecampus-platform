"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ===== Types ===== */
type Row = {
  id: number;
  session_id: number;
  user_id: number;
  status: "present" | "present_manual" | "absent";
  reason: "none" | "permit" | "sick" | "other" | null;
  source: "rfid" | "manual" | null;
  photo_url: string | null;
  photo_path: string | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  loc_label: string | null;        // ringkas
  location_label: string | null;   // panjang
  taken_at: string;

  user_name: string;
  user_email: string;
  user_nim: string | null;

  session_start: string;
  session_end: string;
  class_id: number;
  class_code: string | null;
  class_name: string;
  class_room: string | null;
};

type ListResponse = {
  page: number; pageSize: number; total: number;
  rows: Row[];
};

type ClassLite = { id: number; code: string | null; name: string };

/* ===== Helpers ===== */
const toWIBDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const toWIBShort = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

function StatusBadge({ value, reason, source }: { value: Row["status"]; reason: Row["reason"]; source: Row["source"]; }) {
  if (value === "present")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#1ABC9C] text-white text-xs">
        <Image src="/check_absen.png" alt="" width={11} height={11} /> Hadir{source === "rfid" ? " (RFID)" : ""}
      </span>
    );
  if (value === "present_manual")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#1ABC9C] text-white text-xs">
        <Image src="/check_absen.png" alt="" width={11} height={11} /> Hadir (Manual)
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#f1556c] text-white text-xs">
      <Image src="/not_absen.png" alt="" width={11} height={11} /> Tidak Hadir{reason && reason !== "none" ? ` — ${reason}` : ""}
    </span>
  );
}

/* ===== Page ===== */
export default function AttendancePage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  // filter
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const [classes, setClasses] = useState<ClassLite[]>([]);

  const load = async (_page = page, _pageSize = pageSize) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(_page));
    params.set("pageSize", String(_pageSize));
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    if (classId) params.set("class_id", classId);
    if (q) params.set("q", q);

    const r = await fetch(`/api/admin/attendance?${params.toString()}`, { cache: "no-store" });
    const j = (await r.json()) as ListResponse;
    setRows(j.rows || []);
    setTotal(j.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    // load classes (lite) sekalian sekali
    (async () => {
      const r = await fetch("/api/admin/classes", { cache: "no-store" });
      const j = await r.json();
      const cls: ClassLite[] = (j.classes || []).map((c: any) => ({ id: c.id, code: c.code ?? null, name: c.name }));
      setClasses(cls);
    })();
  }, []);

  useEffect(() => { load(1, pageSize); setPage(1); }, [dateFrom, dateTo, status, source, classId, q, pageSize]); // relayout

  // CSV export (client)
  const exportCSV = () => {
    if (!rows?.length) return;
    const head = [
      "taken_at(WIB)", "class", "session_start(WIB)", "student", "nim", "status", "reason", "source",
      "location", "lat", "lng", "accuracy", "photo_url"
    ];
    const lines = rows.map(r => [
      toWIBDateTime(r.taken_at),
      `${r.class_name} (#${r.class_code || "-"})`,
      toWIBDateTime(r.session_start),
      r.user_name,
      r.user_nim || "",
      r.status,
      r.reason || "",
      r.source || "",
      r.location_label || r.loc_label || "",
      r.lat ?? "",
      r.lng ?? "",
      r.accuracy ?? "",
      r.photo_url || (r.photo_path ? `/attendance/${r.photo_path}` : ""),
    ]);
    const csv = [head, ...lines].map(a => a.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <>
      <div className="pt-3" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#323a46]">Attendance</h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <Link href="/admin/dashboard" className="text-[#6c757d]">Dashboard</Link>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">Attendance</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xs p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-[#6c757d]">Dari Tanggal</label>
            <input type="datetime-local" className="w-full border px-2 py-1.5 rounded"
                   value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Sampai</label>
            <input type="datetime-local" className="w-full border px-2 py-1.5 rounded"
                   value={dateTo} onChange={e=>setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Class</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={classId} onChange={e=>setClassId(e.target.value)}>
              <option value="">Semua</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.code ? `(#${c.code})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Status</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">Semua</option>
              <option value="present">Hadir</option>
              <option value="present_manual">Hadir (Manual)</option>
              <option value="absent">Tidak Hadir</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Source</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={source} onChange={e=>setSource(e.target.value)}>
              <option value="">Semua</option>
              <option value="rfid">RFID</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Cari Nama/NIM/Email</label>
            <input className="w-full border px-2 py-1.5 rounded"
                   placeholder="Ketik lalu Enter" value={q}
                   onChange={e=>setQ(e.target.value)}
                   onKeyDown={e=> e.key==="Enter" ? load(1, pageSize) : undefined } />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={()=>load(1, pageSize)}
                    className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50">
              Terapkan Filter
            </button>
            <button onClick={exportCSV}
                    className="px-3 py-1.5 text-sm rounded bg-[#43BFE5] text-white hover:brightness-95">
              Export CSV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6c757d]">Baris:</span>
            <select className="border px-2 py-1.5 rounded text-sm"
                    value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>
              {[10,20,30,50,100].map(n=>
                <option key={n} value={n}>{n}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xs px-4 md:px-6 py-5 w-full">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F3F7F9]">
              <tr className="text-left text-sm text-[#343A40] font-bold">
                <th className="px-3 py-3 w-10">#</th>
                <th className="px-3 py-3 min-w-[220px]">Waktu (WIB)</th>
                <th className="px-3 py-3 min-w-[240px]">Mahasiswa</th>
                <th className="px-3 py-3 min-w-[260px]">Kelas & Sesi</th>
                <th className="px-3 py-3 min-w-[160px]">Status</th>
                <th className="px-3 py-3 min-w-[220px]">Lokasi</th>
                <th className="px-3 py-3 min-w-[160px]">Foto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6c757d]">Memuat…</td></tr>
              ) : rows && rows.length ? rows.map((r, i) => {
                const photo = r.photo_url || (r.photo_path ? `/attendance/${r.photo_path}` : "");
                const hasCoords = typeof r.lat === "number" && typeof r.lng === "number";
                const mapHref = hasCoords ? `https://www.google.com/maps?q=${r.lat},${r.lng}&z=16` : "";
                return (
                  <tr key={r.id} className="border-b border-[#EAECEF] align-top">
                    <td className="px-3 py-3 text-sm text-[#6c757d]">{(page-1)*pageSize + i + 1}</td>
                    <td className="px-3 py-3 text-sm text-[#343a40]">
                      <div className="font-medium">{toWIBShort(r.taken_at)}</div>
                      <div className="text-xs text-[#6c757d]">{toWIBDateTime(r.taken_at)}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-[#343a40]">
                      <div className="font-medium">{r.user_name}</div>
                      <div className="text-xs text-[#6c757d]">{r.user_email}</div>
                      {r.user_nim && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-sm text-[10px] bg-[#6658DD] text-white">NIM {r.user_nim}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#343a40]">
                      <div className="font-medium">{r.class_name} {r.class_code ? <span className="text-[#6c757d]">#{r.class_code}</span> : null}</div>
                      <div className="text-xs text-[#6c757d]">Ruang: {r.class_room || "-"}</div>
                      <div className="text-xs text-[#6c757d]">Sesi: {toWIBShort(r.session_start)}</div>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <StatusBadge value={r.status} reason={r.reason} source={r.source} />
                    </td>
                    <td className="px-3 py-3 text-sm text-[#343a40]">
                      <div className="text-xs text-[#6c757d]">{r.location_label || r.loc_label || "-"}</div>
                      {hasCoords && (
                        <a className="inline-block mt-1 px-2 py-0.5 rounded-sm text-[11px] bg-[#43BFE5] text-white hover:brightness-95"
                           href={mapHref} target="_blank" rel="noreferrer">
                          Lihat Peta
                        </a>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="Foto" className="w-[120px] h-auto rounded border object-cover" />
                      ) : (
                        <span className="text-xs text-[#6c757d]">-</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6c757d]">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[#6c757d]">Total: {total}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => { const p = Math.max(1, page-1); setPage(p); load(p, pageSize); }}
              className="px-3 py-1.5 text-sm rounded border disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-[#6c757d]">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => { const p = Math.min(totalPages, page+1); setPage(p); load(p, pageSize); }}
              className="px-3 py-1.5 text-sm rounded border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
