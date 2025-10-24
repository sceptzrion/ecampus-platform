import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { sessionId: string; userId: string } }
) {
  const sessionId = Number(params.sessionId);
  const userId = Number(params.userId);

  if (!sessionId || !userId) {
    return NextResponse.json({ ok: false, error: "Bad params" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.query("SET time_zone = '+07:00'");

    // Set status "absent" + reason "none", source "manual".
    await conn.query(
      `INSERT INTO attendance (session_id, user_id, status, reason, source, taken_at)
       VALUES (?, ?, 'absent', 'none', 'manual', UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE
         status='absent',
         reason='none',
         source='manual',
         taken_at=UTC_TIMESTAMP()`,
      [sessionId, userId]
    );

    // Selalu balas JSON agar client tidak error saat res.json()
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
