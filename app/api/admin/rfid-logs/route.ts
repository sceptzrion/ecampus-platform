import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/*
  GET /api/admin/rfid-logs

  Query params (semua opsional):
  - page, pageSize
  - date_from, date_to    (YYYY-MM-DD atau YYYY-MM-DD HH:mm)
  - reader_id, room_id
  - event (scan|grant|deny|heartbeat|error)
  - status (ok|ignored|error)
  - uid (pencarian exact/like)
  - q   (cari di readers.name, rooms.name, message, payload)
*/
export async function GET(req: Request) {
  const url = new URL(req.url);

  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 20)));

  const dateFrom = url.searchParams.get("date_from");
  const dateTo   = url.searchParams.get("date_to");
  const readerId = url.searchParams.get("reader_id");
  const roomId   = url.searchParams.get("room_id");
  const event    = url.searchParams.get("event");
  const status   = url.searchParams.get("status");
  const uid      = url.searchParams.get("uid");
  const q        = url.searchParams.get("q");

  const where: string[] = [];
  const params: any[] = [];

  if (dateFrom) { where.push("l.taken_at >= ?"); params.push(dateFrom); }
  if (dateTo)   { where.push("l.taken_at <= ?"); params.push(dateTo); }
  if (readerId) { where.push("l.reader_id = ?"); params.push(readerId); }
  if (roomId)   { where.push("r.id = ?");       params.push(roomId); }
  if (event)    { where.push("l.event = ?");    params.push(event); }
  if (status)   { where.push("l.status = ?");   params.push(status); }
  if (uid)      { where.push("l.uid LIKE ?");   params.push(`%${uid}%`); }
  if (q) {
    where.push("(rd.name LIKE ? OR r.name LIKE ? OR l.message LIKE ? OR l.payload LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [[cnt]] = await conn.query<any[]>(
      `SELECT COUNT(*) AS total
         FROM rfid_logs l
         JOIN rfid_readers rd ON rd.id = l.reader_id
         JOIN rooms r         ON r.id  = rd.room_id
        ${whereSQL}`, params
    );
    const total = Number(cnt?.total || 0);

    const offset = (page - 1) * pageSize;

    const [rows] = await conn.query<any[]>(
      `SELECT
         l.id, l.reader_id, l.uid, l.event, l.status, l.message, l.rssi,
         l.payload, l.taken_at, l.created_at,
         rd.name  AS reader_name,
         r.id     AS room_id,
         r.code   AS room_code,
         r.name   AS room_name,
         r.location AS room_location
       FROM rfid_logs l
       JOIN rfid_readers rd ON rd.id = l.reader_id
       JOIN rooms r         ON r.id  = rd.room_id
       ${whereSQL}
       ORDER BY l.taken_at DESC, l.id DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return NextResponse.json({ page, pageSize, total, rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
