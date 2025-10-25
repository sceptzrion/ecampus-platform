import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { sessionId: string } }) {
  const id = Number(params.sessionId);
  const body = await req.json().catch(() => ({}));
  const conn = await getPool().getConnection();
  try {
    await conn.query(
      `UPDATE sessions SET topic=?, start_at=?, end_at=? WHERE id=?`,
      [body.topic ?? null, body.start_at ?? null, body.end_at ?? null, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(_req: Request, { params }: { params: { sessionId: string } }) {
  const id = Number(params.sessionId);
  const conn = await getPool().getConnection();
  try {
    await conn.query(`DELETE FROM attendance WHERE session_id=?`, [id]);
    await conn.query(`DELETE FROM sessions WHERE id=?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
