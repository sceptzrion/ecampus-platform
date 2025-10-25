import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

function nowWIB() {
  const s = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  return new Date(s);
}
function wibDay1to7(d: Date) { return ((d.getDay() + 6) % 7) + 1; } // Mon=1..Sun=7
function hhmmss(d: Date) {
  const p=(n:number)=>String(n).padStart(2,"0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function ymd(d: Date) {
  const p=(n:number)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function wibToUtcSql(d: Date) {
  const utc = new Date(d.getTime() - 7*3600*1000);
  const p=(n:number)=>String(n).padStart(2,"0");
  return `${utc.getFullYear()}-${p(utc.getMonth()+1)}-${p(utc.getDate())} ${p(utc.getHours())}:${p(utc.getMinutes())}:${p(utc.getSeconds())}`;
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-reader-secret")?.trim();
  const body = await req.json().catch(() => null);
  const uid = body?.uid?.trim();

  if (!secret || !uid) {
    return NextResponse.json({ error: "x-reader-secret & uid wajib diisi" }, { status: 400 });
  }

  const now = nowWIB();
  const dow = wibDay1to7(now);
  const tStr = hhmmss(now);
  const today = ymd(now);
  const nowUtc = wibToUtcSql(now);

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.query("SET time_zone = '+07:00'");

    // 1) auth reader
    const [[reader]] = await conn.query<any[]>(
      `SELECT rr.id, rr.room_id, rr.is_active, r.name AS room_name
         FROM rfid_readers rr
         JOIN rooms r ON r.id = rr.room_id
        WHERE rr.secret=?`, [secret]
    );
    if (!reader || !reader.is_active) {
      return NextResponse.json({ ok:false, code:"READER_INVALID", message:"Reader tidak dikenal / nonaktif." }, { status: 403 });
    }

    // 2) resolve user dari RFID
    const [[user]] = await conn.query<any[]>(
      "SELECT id, name, is_active FROM users WHERE rfid_uid=?",
      [uid]
    );
    if (!user || !user.is_active) {
      return NextResponse.json({ ok:false, code:"USER_INVALID", message:"Kartu tidak terdaftar / user nonaktif." }, { status: 404 });
    }

    // 3) cari kelas aktif di ruangan reader sekarang
    const [[klass]] = await conn.query<any[]>(
      `SELECT id, name
         FROM classes
        WHERE is_active=1
          AND room_id=?
          AND day_of_week=?
          AND start_time <= ?
          AND end_time   >= ?
        LIMIT 1`,
      [reader.room_id, dow, tStr, tStr]
    );
    if (!klass) {
      return NextResponse.json({ ok:false, code:"NO_ACTIVE_CLASS", message:"Tidak ada kelas aktif untuk ruangan & waktu ini." }, { status: 404 });
    }

    // 4) cari sesi HARI INI (UTC) untuk kelas tsb
    const [[session]] = await conn.query<any[]>(
      `SELECT id
         FROM sessions
        WHERE class_id=?
          AND ( (start_at <= ? AND end_at >= ?)
             OR DATE(CONVERT_TZ(start_at,'+00:00','+07:00')) = ? )
        ORDER BY start_at ASC
        LIMIT 1`,
      [klass.id, nowUtc, nowUtc, today]
    );
    if (!session) {
      return NextResponse.json({ ok:false, code:"SESSION_NOT_FOUND", message:"Sesi hari ini belum dibuat." }, { status: 404 });
    }

    // 5) catat hadir (idempotent)
    await conn.query(
      `INSERT INTO attendance (session_id, user_id, status, reason, created_at)
       VALUES (?, ?, 'present', NULL, NOW())
       ON DUPLICATE KEY UPDATE status='present', reason=NULL`,
      [session.id, user.id]
    );

    // update heartbeat reader
    await conn.query(`UPDATE rfid_readers SET last_heartbeat=NOW() WHERE id=?`, [reader.id]);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name },
      classId: klass.id,
      sessionId: session.id,
      room: reader.room_name,
      at: now.toISOString(),
    });
  } catch (e:any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
