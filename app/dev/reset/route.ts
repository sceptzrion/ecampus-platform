import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { assertDev } from "@/lib/dev-guard";

export async function GET() {
  try {
    assertDev();
  } catch (e: any) {
    return new NextResponse(e.message || "Not Found", { status: e.status || 404 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET FOREIGN_KEY_CHECKS=0");

    // kosongkan data presensi & sesi demo
    await conn.query("DELETE FROM attendance");
    await conn.query("DELETE FROM sessions");
    await conn.query("DELETE FROM classes WHERE id=101");

    // seed CLASS demo (id=101) — gunakan struktur barumu
    await conn.query(
      `INSERT INTO classes
        (id, code, name, semester, year, program, room, day_of_week, start_time, end_time, is_active)
       VALUES
        (101,'2515520028','CAPSTONE PROJECT','ganjil','2025/2026','S1-IF','FASILKOM 4.79-5 (251-7A-22)',1,'07:30:00','10:00:00',1)`
    );

    // seed 4 sesi (tanggal contoh) untuk class 101
    const sessions = [
      { topic: "perkenalan capstone project", start: "2025-08-18 07:30:00", end: "2025-08-18 10:00:00" },
      { topic: "Pemilihan topik project",     start: "2025-09-01 07:30:00", end: "2025-09-01 10:00:00" },
      { topic: "Perancangan Project",         start: "2025-09-15 07:30:00", end: "2025-09-15 10:00:00" },
      { topic: "Implementasi Project",        start: "2025-09-29 07:30:00", end: "2025-09-29 10:00:00" },
    ];
    for (const s of sessions) {
      await conn.query(
        `INSERT INTO sessions (class_id, topic, start_at, end_at) VALUES (101, ?, ?, ?)`,
        [s.topic, s.start, s.end]
      );
    }

    // seed users minimal (4 mahasiswa + 1 dosen + 1 admin) — upsert by email
    const students = [
      ["MUHAMAD IKHSAN RIZQI YANUAR", "2210631170131@student.unsika.ac.id", "2210631170131"],
      ["ANANTA ZIAUROHMAN AZ ZAKI",  "2210631170007@student.unsika.ac.id", "2210631170007"],
      ["MAHESWARA ABHISTA HAMDAN HAFIZ","2210631170128@student.unsika.ac.id","2210631170128"],
      ["GUDANG GUNAWAN",             "2210631170124@student.unsika.ac.id", "2210631170124"],
    ];
    for (const [name, email, nim] of students) {
      await conn.query(
        `INSERT INTO users (name, email, nim, password, role, is_active)
         VALUES (?, ?, ?, 'password', 'student', 1)
         ON DUPLICATE KEY UPDATE name=VALUES(name), nim=VALUES(nim), is_active=1`,
        [name, email, nim]
      );
    }
    await conn.query(
      `INSERT INTO users (name,email,password,role,is_active)
       VALUES ('Dosen Demo','dosen.demo@staff.unsika.ac.id','password','staff',1)
       ON DUPLICATE KEY UPDATE role='staff', is_active=1`
    );
    await conn.query(
      `INSERT INTO users (name,email,password,role,is_active)
       VALUES ('Administrator','admin@admin.unsika.ac.id','password','admin',1)
       ON DUPLICATE KEY UPDATE role='admin', is_active=1`
    );

    // seed Rooms + Readers minimal
    await conn.query(`INSERT INTO rooms (code,name,location,is_active)
                      VALUES ('R-251-7A-22','FASILKOM 4.79-5 (251-7A-22)','Gedung Fasilkom',1)
                      ON DUPLICATE KEY UPDATE name=VALUES(name), location=VALUES(location), is_active=1`);
    const [[room]] = await conn.query<any[]>("SELECT id FROM rooms WHERE code='R-251-7A-22' LIMIT 1");
    if (room?.id) {
      await conn.query(
        `INSERT INTO rfid_readers (name,room_id,secret,is_active)
         VALUES ('Reader Lab 4.79-5', ?, 'dev-secret', 1)
         ON DUPLICATE KEY UPDATE is_active=1`,
        [room.id]
      );
    }

    await conn.query("SET FOREIGN_KEY_CHECKS=1");
    return NextResponse.json({ ok: true, seeded: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message || "reset failed" }, { status: 500 });
  } finally {
    conn.release();
  }
}
