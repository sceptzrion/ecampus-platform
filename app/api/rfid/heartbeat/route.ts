// app/api/rfid/heartbeat/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getNowWIB } from "@/lib/fake-time";

/**
 * Header:
 * - X-Reader-Id
 * - X-Reader-Secret
 *
 * Body (opsional):
 * { uptime_ms?: number, fw?: string }
 */
export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+07:00'");

    const readerId = Number(req.headers.get("x-reader-id") || 0);
    const readerSecret = (req.headers.get("x-reader-secret") || "").trim();
    if (!readerId || !readerSecret) {
      return NextResponse.json({ error: "missing reader headers" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));

    const [[r]] = await conn.query<any[]>(
      "SELECT id, secret, is_active FROM rfid_readers WHERE id=?",
      [readerId]
    );
    if (!r || r.secret !== readerSecret) {
      return NextResponse.json({ error: "unauthorized reader" }, { status: 401 });
    }
    if (!r.is_active) {
      return NextResponse.json({ error: "reader inactive" }, { status: 403 });
    }

    await conn.query(
      `UPDATE rfid_readers SET last_heartbeat = NOW() WHERE id=?`,
      [readerId]
    );

    const now = await getNowWIB(conn);

    return NextResponse.json({
      ok: true,
      server_time_wib: now.wib_now,     // <- ikut fake kalau ada
      advice: { scan_cooldown_ms: 2000 },
      echo: { uptime_ms: body?.uptime_ms ?? null, fw: body?.fw ?? null },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  } finally {
    try { conn.release(); } catch {}
  }
}
