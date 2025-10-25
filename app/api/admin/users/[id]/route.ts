import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();

  // Jika password kosong saat edit → jangan diubah
  const setPassword = typeof body.password === "string" && body.password.length > 0;

  const pool = getPool();
  const sql = `
    UPDATE users
       SET name=?,
           email=?,
           role=?,
           nim=?,
           rfid_uid=?,
           ${setPassword ? "password=?," : ""} 
           is_active=?
     WHERE id=?`;
  const args = [
    body.name,
    body.email,
    body.role,
    body.nim || null,
    body.rfid_uid || null,
    ...(setPassword ? [body.password] : []),
    typeof body.is_active === "number" ? body.is_active : 1,
    id,
  ];
  await pool.query(sql, args);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const pool = getPool();
  await pool.query("DELETE FROM users WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
