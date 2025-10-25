import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/** GET /api/admin/rooms → list semua room */
export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<any[]>(
      `SELECT id, code, name, location, is_active, created_at
         FROM rooms
        ORDER BY code ASC`
    );
    return NextResponse.json({ rooms: rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

/** POST /api/admin/rooms → tambah room baru */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.name) {
    return NextResponse.json({ error: "code & name wajib diisi" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const sql = `
      INSERT INTO rooms (code, name, location, is_active)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      String(body.code).trim(),
      String(body.name).trim(),
      body.location ? String(body.location).trim() : null,
      body.is_active ? 1 : 0,
    ];
    const [r] = await conn.query<any>(sql, params);
    return NextResponse.json({ ok: true, id: r.insertId });
  } catch (e: any) {
    // duplicate code (UNIQUE)
    if (e?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Kode room sudah dipakai." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
