import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    `SELECT id, name, code FROM rooms WHERE is_active=1 ORDER BY name ASC`
  );
  return NextResponse.json({ rooms: rows });
}
