import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// util: label tanggal Indonesia (dari UTC -> WIB)
function toWIBDateLabel(isoUtc: string) {
  const d = new Date(isoUtc);
  return d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long", year: "numeric" });
}
function toWIBISO(isoUtc: string) {
  // kembalikan ISO yang sudah “dianggap” WIB (untuk perbandingan di client)
  const d = new Date(isoUtc);
  // simpan ISO asli UTC; client sudah bisa bandingkan apa adanya (Date() aware timezone).
  // kalau mau, boleh return isoUtc saja. Di table kamu sudah pakai Date() normal.
  return isoUtc;
}

// derive NIM dari email student.* (kalau kolom nim tidak ada)
function deriveNim(email: string) {
  const m = email?.match(/^([0-9]{6,})@/);
  return m?.[1] || email.split("@")[0];
}

export async function GET(
  _req: Request,
  { params }: { params: { classId: string } }
) {
  const classId = Number(params.classId);
  if (!classId) return NextResponse.json({ error: "classId invalid" }, { status: 400 });

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // pastikan connection pakai WIB utk operasi CURRENT_DATE() jika perlu
    await conn.query("SET time_zone = '+07:00'");

    // 1) sessions utk kelas ini (UTC -> label WIB)
    const [sessionRows] = await conn.query<any[]>(
      `SELECT id, topic, start_at, end_at
         FROM sessions
        WHERE class_id = ?
        ORDER BY start_at ASC`,
      [classId]
    );

    const sessions = sessionRows.map((r) => ({
      id: String(r.id),
      topic: r.topic ?? null,
      dateLabel: toWIBDateLabel(r.start_at), // contoh: "18 Agustus 2025"
      startAt: toWIBISO(r.start_at),         // ISO UTC string (client sudah handle)
      endAt: toWIBISO(r.end_at),
    }));

    // 2) daftar mahasiswa aktif
    const [studentRows] = await conn.query<any[]>(
      `SELECT id, name, email
         FROM users
        WHERE role='student' AND is_active=1
        ORDER BY name ASC`
    );

    // 3) attendance untuk semua (session,user) yang ada
    const sessionIds = sessions.map((s) => Number(s.id));
    let attendanceRows: any[] = [];
    if (sessionIds.length && studentRows.length) {
      const [rows] = await conn.query<any[]>(
        `SELECT a.session_id, a.user_id, a.status, a.reason
           FROM attendance a
          WHERE a.session_id IN (${sessionIds.map(() => "?").join(",")})
            AND a.user_id IN (${studentRows.map(() => "?").join(",")})`,
        [...sessionIds, ...studentRows.map((u: any) => u.id)]
      );
      attendanceRows = rows;
    }

    // 4) susun matrix attendance -> shape yang tablemu butuh
    const attendanceMap = new Map<string, { status: string; reason?: string }>();
    for (const a of attendanceRows) {
      attendanceMap.set(`${a.session_id}_${a.user_id}`, { status: a.status, reason: a.reason });
    }

    const students = studentRows.map((u) => {
      const nim = deriveNim(u.email || "");
      const att: Record<string, any> = {};
      for (const s of sessions) {
        const key = `${Number(s.id)}_${u.id}`;
        const hit = attendanceMap.get(key);
        if (hit) {
          if (hit.status === "present") att[s.id] = { status: "present" };
          else if (hit.status === "present_manual") att[s.id] = { status: "present_manual" };
          else att[s.id] = { status: "absent", reason: hit.reason || "none" };
        }
      }
      return {
        id: String(u.id),
        name: u.name,
        nim,
        attendance: att,
      };
    });

    return NextResponse.json({ sessions, students });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
