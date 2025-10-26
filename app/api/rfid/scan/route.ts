// app/api/rfid/scan/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

function toTwo(n: number) { return String(n).padStart(2, "0"); }

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
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

    await conn.query("SET time_zone = '+07:00'");

    const [[reader]] = await conn.query<any[]>(
      "SELECT r.id, r.room_id, r.is_active, r.secret, rm.is_active AS room_active FROM rfid_readers r JOIN rooms rm ON rm.id=r.room_id WHERE r.id=?",
      [readerId]
    );
    if (!reader || reader.secret !== readerSecret) {
      return NextResponse.json({ error: "unauthorized reader" }, { status: 401 });
    }
    if (!reader.is_active || !reader.room_active) {
      return NextResponse.json({ error: "reader inactive" }, { status: 403 });
    }

    // ⬇️ HANYA BARIS INI YANG DIUBAH: gunakan koma, bukan titik dua
    const [logIns] = await conn.query<any>(
      `INSERT INTO rfid_logs(reader_id, uid, received_at, extra_json)
       VALUES (?, ?, NOW(), JSON_OBJECT('rssi', ?, 'ts_ms', ?, 'api', 'scan'))`,
      [readerId, uid, body?.rssi ?? null, body?.ts_ms ?? null]
    );
    const logId = (logIns as any).insertId;

    const [[user]] = await conn.query<any[]>(
      "SELECT id, name, email, role FROM users WHERE uid_rfid = ?",
      [uid]
    );
    if (!user) {
      return NextResponse.json({ ok: true, logId, handled: false, reason: "uid_not_registered" });
    }

    const [[dowRow]] = await conn.query<any[]>(`SELECT DAYOFWEEK(CURRENT_DATE()) AS dw`);
    const mysqlDw = Number(dowRow.dw);
    const day_of_week = mysqlDw === 1 ? 7 : mysqlDw - 1;

    const [[tmRow]] = await conn.query<any[]>(`SELECT DATE_FORMAT(NOW(), '%H:%i:%s') AS hhmmss`);
    const hhmmss = tmRow.hhmmss as string;

    const [activeClasses] = await conn.query<any[]>(
      `SELECT id, name
         FROM classes
        WHERE room_id=?
          AND is_active=1
          AND day_of_week=?
          AND start_time <= ?
          AND end_time >= ?
        ORDER BY id ASC`,
      [reader.room_id, day_of_week, hhmmss, hhmmss]
    );

    if (!(activeClasses as any[]).length) {
      return NextResponse.json({ ok: true, logId, handled: false, reason: "no_active_class_at_this_time" });
    }
    const klass = (activeClasses as any[])[0];

    const [[todayRow]] = await conn.query<any[]>(`SELECT DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d') AS ds`);
    const ds = todayRow.ds as string;

    const [[timeRow]] = await conn.query<any[]>(
      "SELECT start_time, end_time FROM classes WHERE id=?",
      [klass.id]
    );
    const startAtWib = `${ds} ${timeRow.start_time}`;
    const endAtWib   = `${ds} ${timeRow.end_time}`;

    const [[sess]] = await conn.query<any[]>(
      `SELECT id FROM sessions WHERE class_id=? AND DATE(start_at)=CURRENT_DATE() LIMIT 1`,
      [klass.id]
    );
    let sessionId = sess?.id;
    if (!sessionId) {
      const [insSession] = await conn.query<any>(
        `INSERT INTO sessions (class_id, topic, start_at, end_at) VALUES (?, NULL, ?, ?)`,
        [klass.id, startAtWib, endAtWib]
      );
      sessionId = (insSession as any).insertId;
    }

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
    } else if (exist.status === "absent") {
      // default: tidak override
    }

    await conn.query(
      `UPDATE rfid_logs
          SET user_id=?, class_id=?, session_id=?,
              extra_json = JSON_SET(COALESCE(extra_json, JSON_OBJECT()), '$.result', 'present')
        WHERE id=?`,
      [user.id, klass.id, sessionId, logId]
    );

    return NextResponse.json({
      ok: true,
      handled: true,
      user: { id: user.id, name: user.name },
      class: { id: klass.id, name: klass.name },
      session_id: sessionId,
      status: "present",
      logId,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  } finally {
    try { (conn as any).release?.(); } catch {}
  }
}
