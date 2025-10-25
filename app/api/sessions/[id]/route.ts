// app/api/sessions/[id]/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

type UpdateBody = {
  classId?: number;
  topic?: string | null;
  startAt?: string; // ISO UTC
  endAt?: string;   // ISO UTC
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+00:00'");
    const [[row]] = await conn.query<any[]>(
      `SELECT s.id, s.class_id, c.code AS class_code, c.name AS class_name,
              s.topic, s.start_at, s.end_at, s.created_at
         FROM sessions s
         JOIN classes c ON c.id = s.class_id
        WHERE s.id=?`,
      [id]
    );
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({
      id: row.id,
      classId: row.class_id,
      classLabel: `${row.class_code} — ${row.class_name}`,
      topic: row.topic,
      startAt: row.start_at,
      endAt: row.end_at,
      createdAt: row.created_at,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const body = (await req.json()) as UpdateBody;

  const sets: string[] = [];
  const vals: any[] = [];
  if (typeof body.classId === "number") { sets.push("class_id=?"); vals.push(body.classId); }
  if ("topic" in body) { sets.push("topic=?"); vals.push(body.topic ?? null); }
  if (body.startAt) { sets.push("start_at=?"); vals.push(body.startAt); }
  if (body.endAt) { sets.push("end_at=?"); vals.push(body.endAt); }
  if (!sets.length) return NextResponse.json({ error: "no fields" }, { status: 400 });

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+00:00'");
    await conn.execute(`UPDATE sessions SET ${sets.join(", ")} WHERE id=?`, [...vals, id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.execute(`DELETE FROM sessions WHERE id=?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
