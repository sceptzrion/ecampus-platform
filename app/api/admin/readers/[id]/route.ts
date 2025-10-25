import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/** GET detail satu reader (dengan info room) */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    `SELECT r.id, r.name, r.room_id, rm.code AS room_code, rm.name AS room_name,
            r.gateway_url, r.secret, r.is_active, r.last_heartbeat, r.created_at
       FROM rfid_readers r
       JOIN rooms rm ON rm.id = r.room_id
      WHERE r.id=?`,
    [params.id]
  );
  const reader = (rows as any[])[0] ?? null;
  if (!reader) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reader);
}

/** PATCH update reader */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.room_id || !("is_active" in body)) {
    return NextResponse.json({ error: "name, room_id, is_active wajib diisi" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [[room]] = await conn.query<any[]>(
      "SELECT id FROM rooms WHERE id=? AND is_active=1",
      [body.room_id]
    );
    if (!room) return NextResponse.json({ error: "Room tidak ditemukan / nonaktif" }, { status: 400 });

    await conn.query(
      `UPDATE rfid_readers
          SET name=?, room_id=?, gateway_url=?, secret=?, is_active=?
        WHERE id=?`,
      [
        String(body.name).trim(),
        Number(body.room_id),
        body.gateway_url ? String(body.gateway_url).trim() : null,
        String(body.secret || "").trim(),
        body.is_active ? 1 : 0,
        params.id,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

/** DELETE hapus reader */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const pool = getPool();
  try {
    await pool.query("DELETE FROM rfid_readers WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  }
}
