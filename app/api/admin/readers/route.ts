import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/** GET /api/admin/readers → list semua reader (join room) */
export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<any[]>(
      `SELECT r.id, r.name, r.room_id, rm.code AS room_code, rm.name AS room_name,
              r.gateway_url, r.secret, r.is_active, r.last_heartbeat, r.created_at
         FROM rfid_readers r
         JOIN rooms rm ON rm.id = r.room_id
        ORDER BY rm.code ASC, r.name ASC`
    );
    return NextResponse.json({ readers: rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

/** POST /api/admin/readers → tambah reader baru */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.room_id || !body?.secret) {
    return NextResponse.json({ error: "name, room_id, dan secret wajib diisi" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // pastikan room ada & aktif
    const [[room]] = await conn.query<any[]>("SELECT id FROM rooms WHERE id=? AND is_active=1", [body.room_id]);
    if (!room) return NextResponse.json({ error: "Room tidak ditemukan / nonaktif" }, { status: 400 });

    const sql = `
      INSERT INTO rfid_readers (name, room_id, gateway_url, secret, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      String(body.name).trim(),
      Number(body.room_id),
      body.gateway_url ? String(body.gateway_url).trim() : null,
      String(body.secret).trim(),
      body.is_active ? 1 : 0,
    ];
    const [r] = await conn.query<any>(sql, params);
    return NextResponse.json({ ok: true, id: r.insertId });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
