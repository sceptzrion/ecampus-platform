// app/api/admin/classes/[classId]/sessions/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { classId: string } }) {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT id,class_id,topic,start_at,end_at FROM sessions WHERE class_id=? ORDER BY start_at ASC",
    [params.classId]
  );
  return NextResponse.json({ sessions: rows });
}

export async function POST(req: Request, { params }: { params: { classId: string } }) {
  const body = await req.json();
  const pool = getPool();
  await pool.query(
    "INSERT INTO sessions (class_id,topic,start_at,end_at) VALUES (?,?,?,?)",
    [params.classId, body.topic ?? null, body.start_at, body.end_at]
  );
  return NextResponse.json({ ok: true });
}
