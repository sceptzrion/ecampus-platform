import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getPool } from "@/lib/db";

type Body = {
  sessionId: number;
  userId: number;
  status: "HADIR" | "IZIN" | "SAKIT";
  photoDataUrl: string; // "data:image/jpeg;base64,...."
  location?: { label?: string; lat?: number; lng?: number; acc?: number };
};

function dataUrlToBuffer(dataUrl: string) {
  const m = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!m) throw new Error("Invalid image data");
  return Buffer.from(m[2], "base64");
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body.sessionId || !body.userId || !body.photoDataUrl) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+07:00'");

    // simpan file
    const dir = path.join(process.cwd(), "public", "attendance");
    await fs.mkdir(dir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0,14);
    const filename = `${body.sessionId}_${body.userId}_${stamp}.jpg`;
    const abs = path.join(dir, filename);
    await fs.writeFile(abs, dataUrlToBuffer(body.photoDataUrl));

    // map status UI → DB
    let dbStatus: "present_manual" | "absent";
    let dbReason: "permit" | "sick" | "other" | "none" = "none";
    if (body.status === "HADIR") {
      dbStatus = "present_manual";
    } else {
      dbStatus = "absent";
      dbReason = body.status === "IZIN" ? "permit" : "sick";
    }

    await conn.query(
      `INSERT INTO attendance
        (session_id, user_id, status, reason, source, taken_at,
         photo_path, location_label, lat, lng, accuracy)
       VALUES
        (?, ?, ?, ?, 'manual', UTC_TIMESTAMP(),
         ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status=VALUES(status),
         reason=VALUES(reason),
         source=VALUES(source),
         taken_at=VALUES(taken_at),
         photo_path=VALUES(photo_path),
         location_label=VALUES(location_label),
         lat=VALUES(lat),
         lng=VALUES(lng),
         accuracy=VALUES(accuracy)`,
      [
        body.sessionId,
        body.userId,
        dbStatus,
        dbReason,
        filename,
        body.location?.label ?? null,
        body.location?.lat ?? null,
        body.location?.lng ?? null,
        body.location?.acc ?? null,
      ]
    );

    return NextResponse.json({ ok: true, file: `/attendance/${filename}` });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
