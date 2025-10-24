import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Format label tanggal ke Indonesia (pakai WIB untuk tampilan)
function toWIBDateLabel(isoUtc: string) {
  const d = new Date(isoUtc);
  return d.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Kembalikan ISO string apa adanya; client Date() sudah timezone-aware
function toWIBISO(isoUtc: string) {
  return isoUtc;
}

export async function GET(
  _req: Request,
  { params }: { params: { classId: string } }
) {
  const classId = Number(params.classId);
  if (!classId) {
    return NextResponse.json({ error: "classId invalid" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // Biar fungsi tanggal di server (kalau dipakai) berada di zona WIB
    await conn.query("SET time_zone = '+07:00'");

    // 1) Ambil daftar sesi utk kelas ini
    const [sessionRows] = await conn.query<any[]>(
      `SELECT id, topic, start_at, end_at
         FROM sessions
        WHERE class_id = ?
        ORDER BY start_at ASC`,
      [classId]
    );

    const sessions = (sessionRows || []).map((r) => ({
      id: String(r.id),
      topic: r.topic ?? null,
      dateLabel: toWIBDateLabel(r.start_at),
      startAt: toWIBISO(r.start_at),
      endAt: toWIBISO(r.end_at),
    }));

    // 2) Ambil daftar mahasiswa aktif (PASTIKAN ambil kolom nim dari DB)
    const [studentRows] = await conn.query<any[]>(
      `SELECT id, name, nim
         FROM users
        WHERE role = 'student' AND is_active = 1
        ORDER BY name ASC`
    );

    // Kalau tidak ada sesi atau mahasiswa, kembalikan kosong
    if (!sessions.length || !studentRows.length) {
      const students = (studentRows || []).map((u) => ({
        id: String(u.id),
        name: String(u.name),
        nim: String(u.nim ?? ""), // tetap kirim nim dari DB (bisa kosong kalau null)
        attendance: {} as Record<string, any>,
      }));
      return NextResponse.json({ sessions, students });
    }

    // 3) Ambil attendance untuk kombinasi (session,user) di atas
    const sessionIds = sessions.map((s) => Number(s.id));
    const userIds = studentRows.map((u) => Number(u.id));

    const sessPh = sessionIds.map(() => "?").join(",");
    const userPh = userIds.map(() => "?").join(",");

    const [attendanceRows] = await conn.query<any[]>(
      `SELECT a.session_id, a.user_id, a.status, a.reason
         FROM attendance a
        WHERE a.session_id IN (${sessPh})
          AND a.user_id    IN (${userPh})`,
      [...sessionIds, ...userIds]
    );

    // 4) Susun attendance map -> O(1) lookup
    const attendanceMap = new Map<
      string,
      { status: "present" | "present_manual" | "absent"; reason?: string }
    >();
    for (const a of attendanceRows || []) {
      attendanceMap.set(
        `${a.session_id}_${a.user_id}`,
        { status: a.status, reason: a.reason }
      );
    }

    // 5) Bentuk shape students seperti yang dibutuhkan tabel
    const students = studentRows.map((u) => {
      const att: Record<string, any> = {};
      for (const s of sessions) {
        const key = `${Number(s.id)}_${Number(u.id)}`;
        const hit = attendanceMap.get(key);
        if (hit) {
          if (hit.status === "present") att[s.id] = { status: "present" };
          else if (hit.status === "present_manual") att[s.id] = { status: "present_manual" };
          else att[s.id] = { status: "absent", reason: hit.reason || "none" };
        }
      }
      return {
        id: String(u.id),
        name: String(u.name),
        nim: String(u.nim ?? ""),   // ⬅️ hanya dari kolom nim, tanpa fallback email!
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
