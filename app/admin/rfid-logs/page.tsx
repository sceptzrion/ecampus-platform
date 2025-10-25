"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ===== Types ===== */
type LogRow = {
  id: number;
  reader_id: number;
  uid: string | null;
  event: "scan" | "grant" | "deny" | "heartbeat" | "error";
  status: "ok" | "ignored" | "error";
  message: string | null;
  rssi: number | null;
  payload: string | null;
  taken_at: string;
  created_at: string;

  room_id: number;
  room_code: string | null;
  room_name: string;
  room_location: string | null;
  reader_name: string;
};

type ListResp = { page: number; pageSize: number; total: number; rows: LogRow[]; };
type RoomLite = { id: number; code: string | null; name: string } | null;
type ReaderLite = { id: number; name: string; room_id: number };

/* ===== Helpers ===== */
const toWIB = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

function EventBadge({ e }: { e: LogRow["event"] }) {
  const base = "px-2 py-0.5 rounded-sm text-xs text-white";
  if (e === "scan") return <span className={`${base}`} style={{ background: "#6658DD" }}>scan</span>;
  if (e === "grant") return <span className={`${base}`} style={{ background: "#1ABC9C" }}>grant</span>;
  if (e === "deny") return <span className={`${base}`} style={{ background: "#f7c46c", color: "#6b561a" }}>deny</span>;
  if (e === "heartbeat") return <span className={`${base}`} style={{ background: "#43BFE5" }}>heartbeat</span>;
  return <span className={`${base}`} style={{ background: "#F1556C" }}>error</span>;
}

function StatusBadge({ s }: { s: LogRow["status"] }) {
  const base = "px-2 py-0.5 rounded-sm text-xs text-white";
  if (s === "ok") return <span className={`${base}`} style={{ background: "#1ABC9C" }}>ok</span>;
  if (s === "ignored") return <span className={`${base}`} style={{ background: "#999999" }}>ignored</span>;
  return <span className={`${base}`} style={{ background: "#F1556C" }}>error</span>;
}

/* ===== Page ===== */
export default function RfidLogsPage() {
  const [rows, setRows] = useState<LogRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  // filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [roomId, setRoomId] = useState("");
  const [readerId, setReaderId] = useState("");
  const [event, setEvent] = useState("");
  const [status, setStatus] = useState("");
  const [uid, setUid] = useState("");
  const [q, setQ] = useState("");

  const [rooms, setRooms] = useState<RoomLite[]>([]);
  const [readers, setReaders] = useState<ReaderLite[]>([]);

  const load = async (_page = page, _size = pageSize) => {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("page", String(_page));
    sp.set("pageSize", String(_size));
    if (dateFrom) sp.set("date_from", dateFrom);
    if (dateTo) sp.set("date_to", dateTo);
    if (roomId) sp.set("room_id", roomId);
    if (readerId) sp.set("reader_id", readerId);
    if (event) sp.set("event", event);
    if (status) sp.set("status", status);
    if (uid) sp.set("uid", uid);
    if (q) sp.set("q", q);

    const r = await fetch(`/api/admin/rfid-logs?${sp.toString()}`, { cache: "no-store" });
    const j = (await r.json()) as ListResp;
    setRows(j.rows || []);
    setTotal(j.total || 0);
    setLoading(false);
  };

  // dropdown sumber
  useEffect(() => {
    (async () => {
      try {
        const [rRooms, rReaders] = await Promise.all([
          fetch("/api/admin/rooms", { cache: "no-store" }),
          fetch("/api/admin/rfid-readers", { cache: "no-store" }),
        ]);
        const jr = await rRooms.json();
        const jd = await rReaders.json();
        setRooms((jr.rooms || []).map((x: any) => ({ id: x.id, code: x.code ?? null, name: x.name })));
        setReaders((jd.readers || []).map((x: any) => ({ id: x.id, name: x.name, room_id: x.room_id })));
      } catch {}
    })();
  }, []);

  useEffect(() => { load(1, pageSize); setPage(1); },
    [dateFrom, dateTo, roomId, readerId, event, status, uid, q, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const exportCSV = () => {
    if (!rows?.length) return;
    const head = ["taken_at(WIB)", "room", "reader", "uid", "event", "status", "rssi", "message", "payload"];
    const lines = rows.map(r => [
      toWIB(r.taken_at),
      `${r.room_name}${r.room_code ? ` (#${r.room_code})` : ""}`,
      r.reader_name,
      r.uid || "",
      r.event,
      r.status,
      r.rssi ?? "",
      r.message ?? "",
      (r.payload ?? "").replace(/\s+/g, " ").slice(0, 1000),
    ]);
    const csv = [head, ...lines].map(arr => arr.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rfid_logs_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="pt-3" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#323a46]">RFID Logs</h1>
        <div className="hidden md:flex flex-row gap-2.5 text-[14px] font-normal">
          <Link href="/admin/dashboard" className="text-[#6c757d]">Dashboard</Link>
          <span className="text-[#ACB4C8]">&gt;</span>
          <span className="text-[#ACB4C8]">RFID Logs</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xs p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-[#6c757d]">Dari</label>
            <input type="datetime-local" className="w-full border px-2 py-1.5 rounded"
                   value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Sampai</label>
            <input type="datetime-local" className="w-full border px-2 py-1.5 rounded"
                   value={dateTo} onChange={e=>setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Ruang</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={roomId} onChange={e=>setRoomId(e.target.value)}>
              <option value="">Semua</option>
              {rooms.map(r => r && (
                <option key={r.id} value={r.id}>{r.name}{r.code ? ` (#${r.code})`:""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Reader</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={readerId} onChange={e=>setReaderId(e.target.value)}>
              <option value="">Semua</option>
              {readers
                .filter(x => !roomId || String(x.room_id) === roomId)
                .map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Event</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={event} onChange={e=>setEvent(e.target.value)}>
              <option value="">Semua</option>
              <option value="scan">scan</option>
              <option value="grant">grant</option>
              <option value="deny">deny</option>
              <option value="heartbeat">heartbeat</option>
              <option value="error">error</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6c757d]">Status</label>
            <select className="w-full border px-2 py-1.5 rounded"
                    value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">Semua</option>
              <option value="ok">ok</option>
              <option value="ignored">ignored</option>
              <option value="error">error</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#6c757d]">UID</label>
            <input className="w-full border px-2 py-1.5 rounded"
                   value={uid} onChange={e=>setUid(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-[#6c757d]">Cari Pesan/Payload</label>
            <input className="w-full border px-2 py-1.5 rounded"
                   placeholder="Ketik lalu Enter"
                   value={q}
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
              {[10,20,30,50,100].map(n => <option key={n} value={n}>{n}</option>)}
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
                <th className="px-3 py-3 min-w-[210px]">Waktu (WIB)</th>
                <th className="px-3 py-3 min-w-[200px]">Ruang</th>
                <th className="px-3 py-3 min-w-[200px]">Reader</th>
                <th className="px-3 py-3 min-w-[120px]">UID</th>
                <th className="px-3 py-3 min-w-[120px]">Event</th>
                <th className="px-3 py-3 min-w-[120px]">Status</th>
                <th className="px-3 py-3 min-w-[80px]">RSSI</th>
                <th className="px-3 py-3 min-w-[260px]">Pesan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6c757d]">Memuat…</td></tr>
              ) : rows && rows.length ? rows.map((r,i)=>(
                <tr key={r.id} className="border-b border-[#EAECEF] align-top">
                  <td className="px-3 py-3 text-sm text-[#6c757d]">{(page-1)*pageSize + i + 1}</td>
                  <td className="px-3 py-3 text-sm">
                    <div className="font-medium text-[#343a40]">{toWIB(r.taken_at)}</div>
                    <div className="text-xs text-[#6c757d]">ID: {r.id}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-[#343a40]">
                    <div className="font-medium">{r.room_name}{r.room_code ? ` (#${r.room_code})` : ""}</div>
                    <div className="text-xs text-[#6c757d]">{r.room_location || "-"}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-[#343a40]">{r.reader_name}</td>
                  <td className="px-3 py-3 text-sm font-mono">{r.uid || "-"}</td>
                  <td className="px-3 py-3 text-sm"><EventBadge e={r.event} /></td>
                  <td className="px-3 py-3 text-sm"><StatusBadge s={r.status} /></td>
                  <td className="px-3 py-3 text-sm">{r.rssi ?? "-"}</td>
                  <td className="px-3 py-3 text-sm text-[#343a40]">
                    <div className="text-[#343a40]">{r.message || "-"}</div>
                    {r.payload && (
                      <details className="mt-1">
                        <summary className="text-xs text-[#6c757d] cursor-pointer">payload</summary>
                        <pre className="text-xs whitespace-pre-wrap text-[#6c757d]">{r.payload}</pre>
                      </details>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-[#6c757d]">Tidak ada log.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[#6c757d]">Total: {total}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page<=1}
              onClick={()=>{ const p=Math.max(1,page-1); setPage(p); load(p,pageSize); }}
              className="px-3 py-1.5 text-sm rounded border disabled:opacity-50"
            >Prev</button>
            <span className="text-sm text-[#6c757d]">
              {page} / {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button
              disabled={page>=Math.max(1, Math.ceil(total / pageSize))}
              onClick={()=>{ const p=page+1; setPage(p); load(p,pageSize); }}
              className="px-3 py-1.5 text-sm rounded border disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
