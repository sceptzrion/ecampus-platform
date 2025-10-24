import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string; userId: string } }
) {
  const sessionId = Number(params.sessionId);
  const userId = Number(params.userId);

  if (!sessionId || !userId) {
    return NextResponse.json({ error: "Bad params" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+07:00'");

    // Ambil user (nama + nim)
    const [[u]] = await conn.query<any[]>(
      "SELECT id, name, nim, email FROM users WHERE id=?",
      [userId]
    );

    // Ambil sesi yg dimaksud
    const [[s]] = await conn.query<any[]>(
      "SELECT id, class_id, start_at FROM sessions WHERE id=?",
      [sessionId]
    );

    // Ambil attendance (jika ada)
    const [[a]] = await conn.query<any[]>(
      `SELECT status, reason, photo_path, location_label, lat, lng, accuracy
         FROM attendance
        WHERE session_id=? AND user_id=?`,
      [sessionId, userId]
    );

    // Jika ada data nyata → gunakan
    if (a) {
      const status: "HADIR" | "IZIN" | "SAKIT" | null =
        a.status === "present_manual"
          ? "HADIR"
          : a.status === "absent" && a.reason === "permit"
          ? "IZIN"
          : a.status === "absent" && a.reason === "sick"
          ? "SAKIT"
          : null;

      // Pastikan lat/lng adalah number (jangan string)
      const lat =
        a.lat !== null && a.lat !== undefined && !Number.isNaN(Number(a.lat))
          ? Number(a.lat)
          : null;
      const lng =
        a.lng !== null && a.lng !== undefined && !Number.isNaN(Number(a.lng))
          ? Number(a.lng)
          : null;

      return NextResponse.json({
        student: { name: u?.name ?? "-", nim: u?.nim ?? "" },
        status,
        photoUrl: a.photo_path ? `${a.photo_path}` : null,
        locationText: a.location_label ?? null,
        coords: lat != null && lng != null ? { lat, lng } : null,
        dummy: false,
      });
    }

    // ── Fallback dummy untuk pertemuan < 6 ───────────────────────
    // Hitung index pertemuan (lebih kompatibel dari window function)
    const [[idxRow]] = await conn.query<any[]>(
      `SELECT COUNT(*) AS rn
         FROM sessions
        WHERE class_id = (SELECT class_id FROM sessions WHERE id=?)
          AND start_at <= (SELECT start_at FROM sessions WHERE id=?)`,
      [sessionId, sessionId]
    );
    const rn = Number(idxRow?.rn ?? 999);

    if (rn < 6) {
      return NextResponse.json({
        student: { name: u?.name ?? "-", nim: u?.nim ?? "" },
        status: "HADIR",
        photoUrl: null,            // dummy: tidak ada foto
        locationText: null,        // dummy: tidak ada lokasi label
        coords: null,              // dummy: tidak ada koordinat
        dummy: true,
      });
    }

    // Di luar itu, dianggap tidak ada data presensi manual
    return NextResponse.json({
      student: { name: u?.name ?? "-", nim: u?.nim ?? "" },
      status: null,
      photoUrl: null,
      locationText: null,
      coords: null,
      dummy: false,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
