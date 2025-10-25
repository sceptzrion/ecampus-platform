import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

type Body = {
  name: string;
  email: string;
  role: "admin" | "staff" | "student";
  nim?: string | null;
  rfid_uid?: string | null;
  password: string;           // plain untuk prototipe
  is_active?: 0 | 1;
};

export async function GET() {
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    "SELECT id, name, nim, email, rfid_uid, password, role, is_active, created_at FROM users ORDER BY id ASC"
  );
  return NextResponse.json({ users: rows });
}

export async function POST(req: Request) {
  const data = (await req.json()) as Body;

  // default kecil2an
  const nim = data.nim || null;
  const rfid = data.rfid_uid || null;
  const isActive = typeof data.is_active === "number" ? data.is_active : 1;

  const pool = getPool();
  await pool.query(
    `INSERT INTO users (name, email, role, nim, rfid_uid, password, is_active)
     VALUES (?,?,?,?,?,?,?)`,
    [data.name, data.email, data.role, nim, rfid, data.password, isActive]
  );
  return NextResponse.json({ ok: true });
}
