// app/api/attendance/manual/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";         // <- penting untuk fs
export const dynamic = "force-dynamic";  // dev-friendly (hindari cache)

type Body = {
  sessionId: number;
  nim: string;
  status: "HADIR" | "IZIN" | "SAKIT";
  photoDataUrl: string;  // data:image/jpeg;base64,....
  location: { label: string; lat?: number; lng?: number };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.sessionId || !body?.nim || !body?.status || !body?.photoDataUrl) {
      return NextResponse.json({ ok: false, error: "Bad payload" }, { status: 400 });
    }

    // --- decode foto ---
    const m = body.photoDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!m) return NextResponse.json({ ok: false, error: "Foto tidak valid" }, { status: 400 });

    const mime = m[1];
    const base64 = m[2];
    const ext = mime.split("/")[1] || "jpg";

    const fileName = `att_${body.nim}_${body.sessionId}_${Date.now()}.${ext}`;
    const absDir = path.join(process.cwd(), "public", "attendance");
    const absPath = path.join(absDir, fileName);
    const relPath = `/attendance/${fileName}`;

    await fs.mkdir(absDir, { recursive: true });
    await fs.writeFile(absPath, Buffer.from(base64, "base64"));

    // --- map status UI -> DB ---
    let dbStatus: "present_manual" | "absent" = "present_manual";
    let reason: "none" | "permit" | "sick" | "other" = "none";
    if (body.status === "IZIN") { dbStatus = "absent"; reason = "permit"; }
    else if (body.status === "SAKIT") { dbStatus = "absent"; reason = "sick"; }

    // --- db ---
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.query("SET time_zone = '+07:00'");

      const [urows] = await conn.execute<RowDataPacket[]>(
        `SELECT id FROM users WHERE nim=? AND role='student' AND is_active=1 LIMIT 1`,
        [body.nim]
      );
      if (!urows.length) {
        return NextResponse.json({ ok: false, error: "Mahasiswa tidak ditemukan" }, { status: 404 });
      }
      const userId = Number((urows[0] as any).id);

      // pastikan attendance punya unique(session_id, user_id)
      await conn.execute<ResultSetHeader>(
        `INSERT INTO attendance
           (session_id,user_id,status,reason,source,taken_at,photo_path,loc_label,lat,lng)
         VALUES
           (?,?,?,?,?,UTC_TIMESTAMP(),?,?,?,?)
         ON DUPLICATE KEY UPDATE
           status=VALUES(status),
           reason=VALUES(reason),
           source=VALUES(source),
           taken_at=VALUES(taken_at),
           photo_path=VALUES(photo_path),
           loc_label=VALUES(loc_label),
           lat=VALUES(lat),
           lng=VALUES(lng)`,
        [
          body.sessionId, userId, dbStatus, reason, "manual",
          relPath, body.location?.label ?? null, body.location?.lat ?? null, body.location?.lng ?? null,
        ]
      );

      return NextResponse.json({ ok: true, photo: relPath });
    } finally {
      conn.release();
    }
  } catch (e: any) {
    // Pastikan SELALU JSON (jangan HTML)
    console.error("manual attendance error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "internal error" }, { status: 500 });
  }
}
