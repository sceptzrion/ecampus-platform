import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/** GET /api/admin/classes → list kelas (JOIN rooms) */
export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<any[]>(
      `SELECT 
         c.id, c.code, c.name, c.semester, c.year, c.program,
         c.room_id,
         r.name AS room_name,
         c.day_of_week, c.start_time, c.end_time,
         c.is_active
       FROM classes c
       LEFT JOIN rooms r ON r.id = c.room_id
       ORDER BY c.id ASC`
    );
    return NextResponse.json({ classes: rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

/** POST /api/admin/classes → tambah kelas baru */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.code || !body?.name) {
    return NextResponse.json({ error: "code & name wajib diisi" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const sql = `
      INSERT INTO classes
      (code, name, semester, year, program, room_id, day_of_week, start_time, end_time, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      body.code,
      body.name,
      body.semester ?? "ganjil",
      body.year ?? null,
      body.program ?? null,
      body.room_id ?? null,        // <- pakai room_id
      body.day_of_week ?? null,    // 1..7 (Mon..Sun)
      body.start_time ?? null,     // 'HH:MM:SS'
      body.end_time ?? null,       // 'HH:MM:SS'
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
