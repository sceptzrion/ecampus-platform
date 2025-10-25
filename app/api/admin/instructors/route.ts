import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<any[]>(
      `SELECT id, name, email
         FROM users
        WHERE role='staff' AND is_active=1
        ORDER BY name ASC`
    );
    return NextResponse.json({ ok: true, instructors: rows });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
