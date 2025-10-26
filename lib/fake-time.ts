// lib/fake-time.ts
import type { PoolConnection } from "mysql2/promise";

/**
 * Ambil waktu "WIB" dari DB:
 * - Jika app_settings.fake_now_wib ada → pakai itu
 * - Jika tidak ada → pakai NOW()
 *
 * Return:
 *  - wib_now (YYYY-MM-DD HH:MM:SS)
 *  - ds       (YYYY-MM-DD)
 *  - hhmmss   (HH:MM:SS)
 *  - dow      (1=Mon .. 7=Sun) — sesuai skema classes.day_of_week
 */
export async function getNowWIB(conn: PoolConnection) {
  const [rows] = await conn.query<any[]>(`
    SELECT
      dt AS wib_now,
      DATE_FORMAT(dt, '%Y-%m-%d') AS ds,
      DATE_FORMAT(dt, '%H:%i:%s') AS hhmmss,
      CASE DAYOFWEEK(dt) WHEN 1 THEN 7 ELSE DAYOFWEEK(dt)-1 END AS dow
    FROM (
      SELECT COALESCE(
        STR_TO_DATE((SELECT \`value\` FROM app_settings WHERE \`key\`='fake_now_wib' LIMIT 1), '%Y-%m-%d %H:%i:%s'),
        NOW()
      ) AS dt
    ) t
  `);
  return rows[0];
}
