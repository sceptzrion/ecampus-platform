// app/dev/reset/route.ts
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
    await conn.query("SET time_zone = '+07:00'");
    await conn.query("SET FOREIGN_KEY_CHECKS=0");

    // bersihkan
    await conn.query("DELETE FROM attendance");
    await conn.query("DELETE FROM sessions");
    await conn.query("DELETE FROM classes WHERE id=101");

    // kelas demo (Senin 07:30–10:00)
    await conn.query(
      `INSERT INTO classes
        (id, code, name, semester, year, program, room, day_of_week, start_time, end_time, is_active)
       VALUES
        (101,'2515520028','CAPSTONE PROJECT','ganjil','2025/2026','S1-IF','FASILKOM 4.79-5 (251-7A-22)',1,'07:30:00','10:00:00',1)`
    );

    // ===== Generate 7 sesi bi-weekly (tiap 14 hari) dari 2025-08-18 =====
    const firstDate = new Date("2025-08-18T07:30:00+07:00"); // Senin
    const SCOUNT = 7;
    const STEP_DAYS = 14;

    const pad = (n: number) => String(n).padStart(2, "0");
    const toDateOnly = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    for (let i = 0; i < SCOUNT; i++) {
      const s = new Date(firstDate.getTime() + i * STEP_DAYS * 24 * 3600 * 1000);
      const ds = toDateOnly(s); // tanggal saja (WIB)

      // ❗ Sesi full-day (00:00:00 → 23:59:59)
      const startAt = `${ds} 00:00:00`;
      const endAt   = `${ds} 23:59:59`;

      await conn.query(
        `INSERT INTO sessions (class_id, topic, start_at, end_at)
         VALUES (101, ?, ?, ?)`,
        [`Pertemuan ${i + 1}`, startAt, endAt]
      );
    }

    // ===== Users demo =====
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

    // ===== Room + Reader =====
    await conn.query(`INSERT INTO rooms (code,name,location,is_active)
                      VALUES ('R-251-7A-22','FASILKOM 4.79-5 (251-7A-22)','Gedung Fasilkom',1)
                      ON DUPLICATE KEY UPDATE name=VALUES(name), location=VALUES(location), is_active=1`);
    const [[room]] = await conn.query<any[]>("SELECT id FROM rooms WHERE code='R-251-7A-22' LIMIT 1");
    if (room?.id) {
      await conn.query(
        `INSERT INTO rfid_readers (name,room_id,secret,is_active)
         VALUES ('Reader Lab 4.79-5', ?, 'SECRET-4795-ABC', 1)
         ON DUPLICATE KEY UPDATE is_active=1`,
        [room.id]
      );
    }

    // ===== Attendance: isi RANDOM untuk 5 pertemuan pertama saja =====
    const [sessRows] = await conn.query<any[]>(
      `SELECT id FROM sessions WHERE class_id=101 ORDER BY start_at ASC`
    );
    const [stuRows] = await conn.query<any[]>(
      `SELECT id FROM users WHERE role='student' AND is_active=1`
    );

    const randStatus = () => {
      const r = Math.random();
      if (r < 0.75) return { status: "present",        reason: "none"  as const };
      if (r < 0.85) return { status: "present_manual", reason: "none"  as const };
      if (r < 0.93) return { status: "absent",         reason: "permit" as const };
      if (r < 0.98) return { status: "absent",         reason: "sick"   as const };
      return              { status: "absent",          reason: "none"  as const };
    };

    for (let i = 0; i < Math.min(5, sessRows.length); i++) {
      const s = sessRows[i];
      for (const u of stuRows) {
        const { status, reason } = randStatus();
        await conn.query(
          `INSERT INTO attendance (session_id, user_id, status, reason, photo_path)
           VALUES (?, ?, ?, ?, NULL)`,
          [s.id, u.id, status, reason]
        );
      }
    }

    await conn.query("SET FOREIGN_KEY_CHECKS=1");
    return NextResponse.json({ ok: true, seeded: true, sessions: SCOUNT, attendanceSeededForFirst: 5 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message || "reset failed" }, { status: 500 });
  } finally {
    try { conn.release(); } catch {}
  }
}
