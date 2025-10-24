import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

function devGuard() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }
  return null;
}

// ambil cookie x-fake-today (YYYY-MM-DD) dari request
function getFakeFromCookie(req: Request): string | null {
  const c = req.headers.get("cookie") || "";
  const m = c.match(/(?:^|;\s*)x-fake-today=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function GET(req: Request) {
  const guard = devGuard(); if (guard) return guard;

  const url = new URL(req.url);
  const classId = Number(url.searchParams.get("classId") || 101);
  const reseed = (url.searchParams.get("reseed") ?? "1") !== "0"; // default true
  const presentRatio = Number(url.searchParams.get("present") || 0.78);
  const presentManualRatio = Number(url.searchParams.get("presentManual") || 0.12);
  const absentPermitRatio = Number(url.searchParams.get("permit") || 0.70);
  const absentSickRatio = Number(url.searchParams.get("sick") || 0.20);

  const fakeToday = getFakeFromCookie(req); // YYYY-MM-DD jika ada
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.query("SET time_zone = '+07:00'");

    // 1) hapus attendance untuk kelas ini
    await conn.execute<ResultSetHeader>(
      `DELETE a FROM attendance a
       JOIN sessions s ON s.id = a.session_id
      WHERE s.class_id = ?`,
      [classId]
    );

    if (!reseed) {
      return new NextResponse(
        `<pre>Attendance cleared for class ${classId}.
Fake today: ${fakeToday ?? "(none)"}.
Add &reseed=1 to reseed.</pre>`,
        { headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    // 2) ambil sesi < "hari ini" WIB
    let sessRows: RowDataPacket[];
    if (fakeToday) {
      [sessRows] = await conn.execute<RowDataPacket[]>(
        `SELECT id FROM sessions
          WHERE class_id = ?
            AND DATE(CONVERT_TZ(start_at,'+00:00','+07:00')) < ?`,
        [classId, fakeToday]
      );
    } else {
      [sessRows] = await conn.execute<RowDataPacket[]>(
        `SELECT id FROM sessions
          WHERE class_id = ?
            AND DATE(CONVERT_TZ(start_at,'+00:00','+07:00')) < CURRENT_DATE()`,
        [classId]
      );
    }

    const [stuRows] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM users WHERE role='student' AND is_active=1`
    );

    // 3) siapkan rows dummy di sisi JS
    type IdRow = { id: number };
    const sessionsArr = (sessRows as IdRow[]) ?? [];
    const studentsArr = (stuRows as IdRow[]) ?? [];

    const rows: Array<[number, number, "present" | "present_manual" | "absent", "none" | "permit" | "sick" | "other", "rfid" | "manual"]> = [];

    for (const s of sessionsArr) {
      for (const u of studentsArr) {
        const r = Math.random();
        let status: "present" | "present_manual" | "absent";
        if (r < presentRatio) status = "present";
        else if (r < presentRatio + presentManualRatio) status = "present_manual";
        else status = "absent";

        let reason: "none" | "permit" | "sick" | "other" = "none";
        if (status === "absent") {
          const ra = Math.random();
          if (ra < absentPermitRatio) reason = "permit";
          else if (ra < absentPermitRatio + absentSickRatio) reason = "sick";
          else reason = "other";
        }
        const source: "rfid" | "manual" =
          status === "present_manual" ? "manual" : status === "present" ? "rfid" : "manual";

        rows.push([s.id, u.id, status, reason, source]);
      }
    }

    if (rows.length) {
      await conn.execute<ResultSetHeader>(
        `INSERT INTO attendance (session_id, user_id, status, reason, source, taken_at)
         VALUES ${rows.map(() => "(?,?,?,?,?,UTC_TIMESTAMP())").join(",")}`,
        rows.flat()
      );
    }

    return new NextResponse(
      `<pre>Cleared & reseeded.
classId: ${classId}
fakeToday: ${fakeToday ?? "(none)"}
sessions seeded: ${sessionsArr.length}
students: ${studentsArr.length}
rows inserted: ${rows.length}

Hints:
- /dev/set-time?date=2025-10-27  (set fake today)
- /dev/set-time?clear=1          (clear fake today)
- /dev/reseed?classId=${classId} (clear & reseed)
- /dev/reseed?classId=${classId}&reseed=0 (clear only)</pre>`,
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
