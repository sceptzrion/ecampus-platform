// app/api/rfid/scan/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/**
 * Payload:
 * {
 *   uid: string,                // UID hex uppercase tanpa spasi, ex: "A1B2C3D4"
 *   rssi?: number,              // opsional
 *   ts_ms?: number              // epoch millis di device (opsional)
 * }
 *
 * Header auth (WAJIB):
 * - X-Reader-Id: <number>              -> rfid_readers.id
 * - X-Reader-Secret: <string>          -> rfid_readers.secret
 */

function toTwo(n: number) { return String(n).padStart(2, "0"); }

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
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

    await conn.query("SET time_zone = '+07:00'");

    // validasi reader
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

    // log awal (rfid_logs)
    const [logIns] = await conn.query<any>(
      `INSERT INTO rfid_logs(reader_id, uid, received_at, extra_json)
       VALUES (?, ?, NOW(), JSON_OBJECT('rssi', ?, 'ts_ms', ?, 'api':'scan'))`,
      [readerId, uid, body?.rssi ?? null, body?.ts_ms ?? null]
    );
    const logId = logIns.insertId;

    // cari user by uid
    const [[user]] = await conn.query<any[]>(
      "SELECT id, name, email, role FROM users WHERE uid_rfid = ?",
      [uid]
    );
    if (!user) {
      // tidak terdaftar → balas dan selesai (log sudah tersimpan)
      return NextResponse.json({
        ok: true,
        logId,
        handled: false,
        reason: "uid_not_registered",
      });
    }

    // deteksi kelas aktif berdasarkan jadwal classes (hari & jam WIB)
    const now = new Date(); // tapi MySQL sudah di-set WIB, kita pakai MySQL untuk hitung akurat
    // day_of_week 1=Mon..7=Sun (SESUAI skema)
    const [[dowRow]] = await conn.query<any[]>(`SELECT DAYOFWEEK(CURRENT_DATE()) AS dw`); // 1=Sun..7=Sat (MySQL)
    // konversi MySQL → skema (1=Mon..7=Sun)
    // MySQL: 1 Sun,2 Mon,3 Tue,4 Wed,5 Thu,6 Fri,7 Sat
    const mysqlDw = Number(dowRow.dw);
    const day_of_week = mysqlDw === 1 ? 7 : mysqlDw - 1; // Sun(1)->7, Mon(2)->1, ... Sat(7)->6

    // jam:menit WIB sekarang (string 'HH:MM:SS')
    const [[tmRow]] = await conn.query<any[]>(`SELECT DATE_FORMAT(NOW(), '%H:%i:%s') AS hhmmss`);
    const hhmmss = tmRow.hhmmss as string;

    // cari kelas aktif di room reader
    const [activeClasses] = await conn.query<any[]>(
      `SELECT id, name
         FROM classes
        WHERE room_id=?
          AND is_active=1
          AND day_of_week=?
          AND start_time <= ?
          AND end_time >= ? 
        ORDER BY id ASC
      `,
      [reader.room_id, day_of_week, hhmmss, hhmmss]
    );

    if (!activeClasses.length) {
      return NextResponse.json({
        ok: true,
        logId,
        handled: false,
        reason: "no_active_class_at_this_time",
      });
    }

    // Jika ada >1, ambil pertama (atau bisa pilih yang paling cocok)
    const klass = activeClasses[0];

    // cari / buat session untuk HARI INI (satu tanggal) untuk class_id tsb
    // start_at/end_at disusun dari TANGGAL hari ini + start_time/end_time (WIB)
    const [[todayRow]] = await conn.query<any[]>(`SELECT CURRENT_DATE() AS d, DATE_FORMAT(CURRENT_DATE(), '%Y-%m-%d') AS ds`);
    const ds = todayRow.ds as string; // "YYYY-MM-DD"

    // Ambil jam dari classes
    const [[timeRow]] = await conn.query<any[]>(
      "SELECT start_time, end_time FROM classes WHERE id=?",
      [klass.id]
    );
    const sTime = timeRow.start_time as string; // "HH:MM:SS"
    const eTime = timeRow.end_time as string;   // "HH:MM:SS"

    const startAtWib = `${ds} ${sTime}`; // WIB string
    const endAtWib = `${ds} ${eTime}`;

    // cek apakah session sudah ada (tanggal sama & class_id sama)
    const [[sess]] = await conn.query<any[]>(
      `SELECT id FROM sessions
        WHERE class_id=? AND DATE(start_at)=CURRENT_DATE() LIMIT 1`,
      [klass.id]
    );

    let sessionId = sess?.id;
    if (!sessionId) {
      // buat session untuk hari ini
      const [insSession] = await conn.query<any>(
        `INSERT INTO sessions (class_id, topic, start_at, end_at)
         VALUES (?, NULL, ?, ?)`,
        [klass.id, startAtWib, endAtWib]
      );
      sessionId = insSession.insertId;
    }

    // tulis / update attendance → otomatis "present"
    // idempotent: kalau sudah present/present_manual/absent, aturan:
    // - jika sudah present/present_manual → biarkan
    // - jika absent → JANGAN override (kecuali mau override, tinggal ubah logika)
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
      // default: tidak override; kalau mau override, ganti baris di bawah
      // await conn.query(`UPDATE attendance SET status='present', reason=NULL WHERE session_id=? AND user_id=?`, [sessionId, user.id]);
    }

    // update rfid_logs dengan link data
    await conn.query(
      `UPDATE rfid_logs SET user_id=?, class_id=?, session_id=?, extra_json = JSON_SET(COALESCE(extra_json, JSON_OBJECT()), '$.result', 'present') WHERE id=?`,
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
    // @ts-ignore
    pool.releaseConnection?.(conn);
    // untuk mysql2/promise pool.getConnection: pakai conn.release()
    try { conn.release(); } catch {}
  }
}
