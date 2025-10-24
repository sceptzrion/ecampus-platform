// app/api/dev/reset/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function devGuard() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  const guard = devGuard();
  if (guard) return guard;

  const url = new URL(req.url);

  // OPTIONAL: filter per kelas (kalau mau)
  // ?classId=101  → hanya sesi class 101 yang dipakai SEED
  const classIdParam = url.searchParams.get("classId");
  const classId = classIdParam ? Number(classIdParam) : null;

  // OPTIONAL: clearOnly=true untuk hanya mengosongkan attendance tanpa isi ulang
  const clearOnly = url.searchParams.get("clearOnly") === "true";

  // Berapa pertemuan pertama yang akan di-seed? (default 5 = “sebelum pertemuan 6”)
  const seedCount = Number(url.searchParams.get("until") || 5);

  // Rasio random (bisa dioverride lewat query param)
  const presentRatio = Number(url.searchParams.get("present") || 0.78);
  const manualRatio  = Number(url.searchParams.get("presentManual") || 0.12);
  const permitRatio  = Number(url.searchParams.get("permit") || 0.70);
  const sickRatio    = Number(url.searchParams.get("sick") || 0.20);

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+07:00'");

    // 1) HAPUS attendance (global atau per kelas)
    if (classId) {
      await conn.execute(
        `DELETE a
           FROM attendance a
           JOIN sessions s ON s.id = a.session_id
          WHERE s.class_id = ?`,
        [classId]
      );
    } else {
      await conn.execute(`DELETE FROM attendance`);
    }

    if (clearOnly) {
      return new NextResponse(
        `<pre>Attendance CLEARED.
classId: ${classId ?? "(ALL)"}
seedCount (first N sessions): ${seedCount} (skipped, clearOnly=true)</pre>`,
        { headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    // 2) AMBIL daftar sesi, urut dari paling awal.
    //    Default: ambil SEMUA sesi (lintas kelas). Kalau classId ada → filter kelas tersebut.
    let sessions: RowDataPacket[];
    if (classId) {
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT id, class_id, start_at
           FROM sessions
          WHERE class_id = ?
          ORDER BY start_at ASC
          LIMIT ?`,
        [classId, seedCount]
      );
      sessions = rows;
    } else {
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT id, class_id, start_at
           FROM sessions
          ORDER BY start_at ASC
          LIMIT ?`,
        [seedCount]
      );
      sessions = rows;
    }

    // 3) AMBIL semua mahasiswa aktif (role=student)
    const [students] = await conn.query<RowDataPacket[]>(
      `SELECT id, name, nim FROM users WHERE role='student' AND is_active=1`
    );

    // 4) Generate rows dummy hanya untuk N sesi pertama (sebelum pertemuan ke-6)
    //    Status: 78% present, 12% present_manual, sisanya absent (permit/sick/other)
    const rows: Array<[number, number, "present" | "present_manual" | "absent", "none" | "permit" | "sick" | "other", "rfid" | "manual"]> = [];

    for (const s of sessions) {
      for (const u of students) {
        const r = Math.random();
        let status: "present" | "present_manual" | "absent";
        if (r < presentRatio) status = "present";
        else if (r < presentRatio + manualRatio) status = "present_manual";
        else status = "absent";

        let reason: "none" | "permit" | "sick" | "other" = "none";
        if (status === "absent") {
          const ra = Math.random();
          if (ra < permitRatio) reason = "permit";
          else if (ra < permitRatio + sickRatio) reason = "sick";
          else reason = "other";
        }

        // sumber: kalau hadir manual → "manual", kalau hadir rfid → "rfid", kalau absen → "manual" (tetap bisa manual record)
        const source: "rfid" | "manual" = status === "present" ? "rfid" : "manual";

        rows.push([Number(s.id), Number(u.id), status, reason, source]);
      }
    }

    if (rows.length) {
      await conn.query(
        `INSERT INTO attendance (session_id, user_id, status, reason, source, taken_at)
         VALUES ${rows.map(() => "(?,?,?,?,?,UTC_TIMESTAMP())").join(",")}`,
        rows.flat()
      );
    }

    const html = `
<pre>✅ RESET & SEED PRESENSI (MODE DEFAULT: HANYA SEBELUM PERTEMUAN KE-6)

classId                 : ${classId ?? "(ALL classes)"}
seedCount (first N)     : ${seedCount}
sessions used           : ${sessions.length}
students                : ${students.length}
rows inserted           : ${rows.length}

Rasio:
- present               : ${presentRatio}
- present_manual        : ${manualRatio}
- absent → permit       : ${permitRatio}
- absent → sick         : ${sickRatio}
- absent → other        : ${Math.max(0, 1 - permitRatio - sickRatio).toFixed(2)}

Tips:
- /dev/reset                              → default (first 5 sessions across ALL classes)
- /dev/reset?classId=101                  → hanya kelas 101
- /dev/reset?until=3                      → hanya 3 pertemuan pertama
- /dev/reset?clearOnly=true               → hanya clear, tanpa seed
- /dev/reset?present=0.8&presentManual=0.1&permit=0.6&sick=0.3
</pre>
    `;
    return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch (e: any) {
    console.error("reset error:", e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
