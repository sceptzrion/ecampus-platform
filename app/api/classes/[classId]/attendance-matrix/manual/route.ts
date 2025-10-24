import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { sessionId: string } }) {
  const sessionId = Number(params.sessionId);
  if (!sessionId) return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  // TODO: ambil userId dari session login
  const userId = 2; // contoh
  const { status, reason = "none", lat, lng } = body as {
    status: "present_manual" | "absent";
    reason?: "permit" | "sick" | "other" | "none";
    lat?: number; lng?: number;
  };

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+07:00'");

    await conn.execute(
      `INSERT INTO attendance (session_id, user_id, status, reason, source, lat, lng, taken_at)
       VALUES (?, ?, ?, ?, 'manual', ?, ?, UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE status=VALUES(status), reason=VALUES(reason), source='manual', lat=VALUES(lat), lng=VALUES(lng), taken_at=UTC_TIMESTAMP()`,
      [sessionId, userId, status, reason, lat ?? null, lng ?? null]
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
