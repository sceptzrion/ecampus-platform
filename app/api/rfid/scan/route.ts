// app/api/rfid/scan/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/**
 * Headers:
 *  - X-Reader-Id, X-Reader-Secret
 *
 * Body JSON:
 *  { uid: "A1B2C3D4", rssi?: number, ts_ms?: number }
 */

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+07:00'");

    // --- auth reader ---
    const readerId = Number(req.headers.get("x-reader-id") || 0);
    const readerSecret = (req.headers.get("x-reader-secret") || "").trim();
    if (!readerId || !readerSecret) {
      return NextResponse.json({ error: "missing reader headers" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const uidRaw = (body?.uid || "").toString().trim();
    if (!uidRaw) {
      return NextResponse.json({ error: "invalid uid" }, { status: 400 });
    }
    const uid = uidRaw.replace(/\s+/g, "").toUpperCase();
    const rssi = typeof body?.rssi === "number" ? body.rssi : null;
    const ts_ms = typeof body?.ts_ms === "number" ? body.ts_ms : null;

    // validasi reader + room
    const [[reader]] = await conn.query<any[]>(
      `SELECT r.id, r.room_id, r.is_active, r.secret, rm.is_active AS room_active
         FROM rfid_readers r
         JOIN rooms rm ON rm.id = r.room_id
        WHERE r.id = ?`,
      [readerId]
    );
    if (!reader || reader.secret !== readerSecret) {
      await conn.query(
        `INSERT INTO rfid_logs (reader_id, uid, event, status, message, rssi, payload, taken_at)
         VALUES (?, ?, 'scan', 'error', 'unauthorized reader', ?, JSON_OBJECT('ts_ms', ?), NOW())`,
        [readerId || null, uid, rssi, ts_ms]
      );
      return NextResponse.json({ error: "unauthorized reader" }, { status: 401 });
    }
    if (!reader.is_active || !reader.room_active) {
      await conn.query(
        `INSERT INTO rfid_logs (reader_id, uid, event, status, message, rssi, payload, taken_at)
         VALUES (?, ?, 'scan', 'ignored', 'reader or room inactive', ?, JSON_OBJECT('ts_ms', ?), NOW())`,
        [readerId, uid, rssi, ts_ms]
      );
      return NextResponse.json({ ok: true, handled: false, reason: "reader_inactive" });
    }

    // user dari UID
    const [[user]] = await conn.query<any[]>(
      "SELECT id, name, email, role FROM users WHERE uid_rfid = ?",
      [uid]
    );
    if (!user) {
      await conn.query(
        `INSERT INTO rfid_logs (reader_id, uid, event, status, message, rssi, payload, taken_at)
         VALUES (?, ?, 'scan', 'ignored', 'uid_not_registered', ?, JSON_OBJECT('ts_ms', ?), NOW())`,
        [readerId, uid, rssi, ts_ms]
      );
      return NextResponse.json({
        ok: true,
        handled: false,
        reason: "uid_not_registered",
      });
    }

    // hitung hari & waktu WIB now
    const [[dowRow]] = await conn.query<any[]>(`SELECT DAYOFWEEK(CURRENT_DATE()) AS dw`);
    const mysqlDw = Number(dowRow.dw);           // 1=Sun..7=Sat
    const day_of_week = mysqlDw === 1 ? 7 : mysqlDw - 1; // 1=Mon..7=Sun (sesuai skema kamu)

    const [[tmRow]] = await conn.query<any[]>(
      `SELECT DATE_FORMAT(NOW(), '%H:%i:%s') AS hhmmss, DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d') AS ds`
    );
    const hhmmss = tmRow.hhmmss as string;
    const ds = tmRow.ds as string;

    // cari kelas aktif di ruangan reader
    const [activeClasses] = await conn.query<any[]>(
      `SELECT id, name, start_time, end_time
         FROM classes
        WHERE room_id = ?
          AND is_active = 1
          AND day_of_week = ?
          AND start_time <= ?
          AND end_time >= ?
        ORDER BY id ASC`,
      [reader.room_id, day_of_week, hhmmss, hhmmss]
    );

    if (!(activeClasses as any[]).length) {
      await conn.query(
        `INSERT INTO rfid_logs (reader_id, uid, event, status, message, rssi, payload, taken_at)
         VALUES (?, ?, 'scan', 'ignored', 'no_active_class_at_this_time', ?, JSON_OBJECT('ts_ms', ?, 'time', ?), NOW())`,
        [readerId, uid, rssi, ts_ms, hhmmss]
      );
      return NextResponse.json({
        ok: true,
        handled: false,
        reason: "no_active_class_at_this_time",
      });
    }

    const klass = (activeClasses as any[])[0];

    // session untuk hari ini (gabung tanggal hari ini + jam kelas)
    const startAtWib = `${ds} ${klass.start_time}`;
    const endAtWib   = `${ds} ${klass.end_time}`;

    const [[sess]] = await conn.query<any[]>(
      `SELECT id FROM sessions WHERE class_id=? AND DATE(start_at)=CURRENT_DATE() LIMIT 1`,
      [klass.id]
    );

    let sessionId = sess?.id;
    if (!sessionId) {
      const [insSession] = await conn.query<any>(
        `INSERT INTO sessions (class_id, topic, start_at, end_at)
         VALUES (?, NULL, ?, ?)`,
        [klass.id, startAtWib, endAtWib]
      );
      sessionId = (insSession as any).insertId;
    }

    // attendance: jika belum ada → present
    const [[exist]] = await conn.query<any[]>(
      `SELECT status FROM attendance WHERE session_id=? AND user_id=?`,
      [sessionId, user.id]
    );
    if (!exist) {
      await conn.query(
        `INSERT INTO attendance(session_id, user_id, status, reason, photo_path)
         VALUES (?, ?, 'present', NULL, NULL)`,
        [sessionId, user.id]
      );
    }
    // kalau sudah absent, default tidak override (bisa diubah sesuai kebijakan)

    // LOG: sukses
    await conn.query(
      `INSERT INTO rfid_logs (reader_id, uid, event, status, message, rssi, payload, taken_at)
       VALUES (?, ?, 'scan', 'ok', 'present', ?, JSON_OBJECT(
         'ts_ms', ?, 'user_id', ?, 'class_id', ?, 'session_id', ?, 'time', ?
       ), NOW())`,
      [readerId, uid, rssi, ts_ms, user.id, klass.id, sessionId, hhmmss]
    );

    return NextResponse.json({
      ok: true,
      handled: true,
      user: { id: user.id, name: user.name },
      class: { id: klass.id, name: klass.name },
      session_id: sessionId,
      status: "present",
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  } finally {
    try { (conn as any).release?.(); } catch {}
  }
}
