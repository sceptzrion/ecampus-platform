import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/*
  Query Params (opsional):
  - page (default 1), pageSize (default 20)
  - date_from, date_to  (YYYY-MM-DD atau YYYY-MM-DD HH:mm)
  - class_id, session_id, status (present|present_manual|absent), source (rfid|manual)
  - q  (mencari di user.name, user.email, user.nim)
*/
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 20)));

  const dateFrom = url.searchParams.get("date_from") || null;
  const dateTo = url.searchParams.get("date_to") || null;
  const classId = url.searchParams.get("class_id") || null;
  const sessionId = url.searchParams.get("session_id") || null;
  const status = url.searchParams.get("status") || null;
  const source = url.searchParams.get("source") || null;
  const q = url.searchParams.get("q")?.trim() || null;

  const where: string[] = [];
  const params: any[] = [];

  if (dateFrom) { where.push("a.taken_at >= ?"); params.push(dateFrom); }
  if (dateTo)   { where.push("a.taken_at <= ?"); params.push(dateTo); }
  if (classId)  { where.push("c.id = ?"); params.push(classId); }
  if (sessionId){ where.push("s.id = ?"); params.push(sessionId); }
  if (status)   { where.push("a.status = ?"); params.push(status); }
  if (source)   { where.push("a.source = ?"); params.push(source); }
  if (q) {
    where.push("(u.name LIKE ? OR u.email LIKE ? OR u.nim LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // total
    const [[cnt]] = await conn.query<any[]>(
      `SELECT COUNT(*) AS total
         FROM attendance a
         JOIN users u ON u.id = a.user_id
         JOIN sessions s ON s.id = a.session_id
         JOIN classes  c ON c.id = s.class_id
        ${whereSQL}`,
      params
    );
    const total = Number(cnt?.total || 0);

    // data
    const offset = (page - 1) * pageSize;
    const [rows] = await conn.query<any[]>(
      `SELECT
          a.id, a.session_id, a.user_id, a.status, a.reason, a.source,
          a.photo_url, a.photo_path, a.lat, a.lng, a.accuracy,
          a.loc_label, a.location_label, a.taken_at,
          u.name AS user_name, u.email AS user_email, u.nim AS user_nim,
          s.start_at AS session_start, s.end_at AS session_end,
          c.id AS class_id, c.code AS class_code, c.name AS class_name, c.room AS class_room
       FROM attendance a
       JOIN users u    ON u.id = a.user_id
       JOIN sessions s ON s.id = a.session_id
       JOIN classes  c ON c.id = s.class_id
       ${whereSQL}
       ORDER BY a.taken_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return NextResponse.json({
      page, pageSize, total, rows,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
