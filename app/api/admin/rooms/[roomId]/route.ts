import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/** GET detail satu room */
export async function GET(_req: Request, { params }: { params: { roomId: string } }) {
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    `SELECT id, code, name, location, is_active, created_at
       FROM rooms WHERE id=?`,
    [params.roomId]
  );
  const room = (rows as any[])[0] ?? null;
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

/** PATCH update room */
export async function PATCH(req: Request, { params }: { params: { roomId: string } }) {
  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.name) {
    return NextResponse.json({ error: "code & name wajib diisi" }, { status: 400 });
  }
  const pool = getPool();
  try {
    await pool.query(
      `UPDATE rooms
          SET code=?, name=?, location=?, is_active=?
        WHERE id=?`,
      [
        String(body.code).trim(),
        String(body.name).trim(),
        body.location ? String(body.location).trim() : null,
        body.is_active ? 1 : 0,
        params.roomId,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Kode room sudah dipakai." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  }
}

/** DELETE hapus room (cek relasi rfid_readers dulu) */
export async function DELETE(_req: Request, { params }: { params: { roomId: string } }) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [[cnt]] = await conn.query<any[]>(
      `SELECT COUNT(*) AS c FROM rfid_readers WHERE room_id=?`,
      [params.roomId]
    );
    if (Number(cnt?.c || 0) > 0) {
      return NextResponse.json(
        { error: "Room sedang dipakai di rfid_readers. Lepas reader terlebih dahulu." },
        { status: 400 }
      );
    }
    await conn.query("DELETE FROM rooms WHERE id=?", [params.roomId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
