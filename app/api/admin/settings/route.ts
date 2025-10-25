// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

/**
 * GET  /api/admin/settings  -> ambil 1 baris config (atau default kalau kosong)
 * PUT  /api/admin/settings  -> update 1 baris config
 */
export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<any[]>(
      `SELECT
        id,
        academic_year_label,
        timezone,
        default_gateway_base_url,
        default_reader_secret,
        heartbeat_timeout_sec,
        scan_early_min,
        scan_late_min,
        manual_edit_days,
        holiday_mode
       FROM system_settings
       ORDER BY id ASC
       LIMIT 1`
    );

    const row = (rows as any[])[0] || null;

    // fallback jika belum ada (harusnya ada karena kita seed)
    if (!row) {
      return NextResponse.json({
        id: null,
        academic_year_label: "2025/2026 Ganjil",
        timezone: "Asia/Jakarta",
        default_gateway_base_url: null,
        default_reader_secret: null,
        heartbeat_timeout_sec: 120,
        scan_early_min: 5,
        scan_late_min: 10,
        manual_edit_days: 3,
        holiday_mode: 0,
      });
    }

    return NextResponse.json(row);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    academic_year_label,
    timezone,
    default_gateway_base_url,
    default_reader_secret,
    heartbeat_timeout_sec,
    scan_early_min,
    scan_late_min,
    manual_edit_days,
    holiday_mode,
  } = body;

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    // Pastikan ada satu baris
    const [rows] = await conn.query<any[]>("SELECT id FROM system_settings ORDER BY id ASC LIMIT 1");
    const row = rows[0];

    if (!row) {
      // insert baru
      await conn.query(
        `INSERT INTO system_settings
         (academic_year_label, timezone, default_gateway_base_url, default_reader_secret,
          heartbeat_timeout_sec, scan_early_min, scan_late_min, manual_edit_days, holiday_mode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          academic_year_label ?? "2025/2026 Ganjil",
          timezone ?? "Asia/Jakarta",
          default_gateway_base_url ?? null,
          default_reader_secret ?? null,
          Number.isFinite(heartbeat_timeout_sec) ? heartbeat_timeout_sec : 120,
          Number.isFinite(scan_early_min) ? scan_early_min : 5,
          Number.isFinite(scan_late_min) ? scan_late_min : 10,
          Number.isFinite(manual_edit_days) ? manual_edit_days : 3,
          holiday_mode ? 1 : 0,
        ]
      );
    } else {
      // update baris yang ada
      await conn.query(
        `UPDATE system_settings
            SET academic_year_label = ?,
                timezone = ?,
                default_gateway_base_url = ?,
                default_reader_secret = ?,
                heartbeat_timeout_sec = ?,
                scan_early_min = ?,
                scan_late_min = ?,
                manual_edit_days = ?,
                holiday_mode = ?
          WHERE id = ?`,
        [
          academic_year_label ?? null,
          timezone ?? "Asia/Jakarta",
          default_gateway_base_url ?? null,
          default_reader_secret ?? null,
          Number.isFinite(heartbeat_timeout_sec) ? heartbeat_timeout_sec : 120,
          Number.isFinite(scan_early_min) ? scan_early_min : 5,
          Number.isFinite(scan_late_min) ? scan_late_min : 10,
          Number.isFinite(manual_edit_days) ? manual_edit_days : 3,
          holiday_mode ? 1 : 0,
          row.id,
        ]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
