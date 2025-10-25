import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { classId: string } }) {
  const pool = getPool();
  const [rows] = await pool.query<any[]>(
    `SELECT 
       c.id, c.code, c.name, c.semester, c.year, c.program,
       c.room_id, r.name AS room_name,
       c.day_of_week, c.start_time, c.end_time,
       c.is_active
     FROM classes c
     LEFT JOIN rooms r ON r.id = c.room_id
     WHERE c.id=?`,
    [params.classId]
  );
  return NextResponse.json(rows[0] ?? null);
}

export async function PATCH(req: Request, { params }: { params: { classId: string } }) {
  const body = await req.json();
  const pool = getPool();
  await pool.query(
    `UPDATE classes SET 
       code=?, name=?, semester=?, year=?, program=?, 
       room_id=?, day_of_week=?, start_time=?, end_time=?, 
       is_active=?
     WHERE id=?`,
    [
      body.code, body.name, body.semester, body.year, body.program,
      body.room_id ?? null, body.day_of_week ?? null, body.start_time ?? null, body.end_time ?? null,
      body.is_active ? 1 : 0, params.classId
    ]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { classId: string } }) {
  const pool = getPool();
  await pool.query("DELETE FROM classes WHERE id=?", [params.classId]);
  return NextResponse.json({ ok: true });
}
