// app/api/sessions/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

type CreateBody = {
  classId: number;
  topic?: string | null;
  startAt: string; // ISO UTC
  endAt: string;   // ISO UTC
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+00:00'"); // simpan/ambil UTC
    let rows: any[] = [];
    if (classId) {
      [rows] = await conn.query<any[]>(
        `SELECT s.id, s.class_id, c.code AS class_code, c.name AS class_name,
                s.topic, s.start_at, s.end_at, s.created_at
           FROM sessions s
           JOIN classes c ON c.id = s.class_id
          WHERE s.class_id = ?
          ORDER BY s.start_at ASC`,
        [Number(classId)]
      );
    } else {
      [rows] = await conn.query<any[]>(
        `SELECT s.id, s.class_id, c.code AS class_code, c.name AS class_name,
                s.topic, s.start_at, s.end_at, s.created_at
           FROM sessions s
           JOIN classes c ON c.id = s.class_id
          ORDER BY s.start_at ASC`
      );
    }

    return NextResponse.json({
      items: rows.map(r => ({
        id: r.id,
        classId: r.class_id,
        classLabel: `${r.class_code} — ${r.class_name}`,
        topic: r.topic,
        startAt: r.start_at, // UTC ISO from DB
        endAt: r.end_at,     // UTC ISO
        createdAt: r.created_at,
      })),
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreateBody;
  if (!body?.classId || !body?.startAt || !body?.endAt) {
    return NextResponse.json({ error: "classId, startAt, endAt wajib" }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query("SET time_zone = '+00:00'");
    const [r] = await conn.execute(
      `INSERT INTO sessions (class_id, topic, start_at, end_at)
       VALUES (?,?,?,?)`,
      [body.classId, body.topic ?? null, body.startAt, body.endAt]
    );
    // @ts-ignore
    const id = r.insertId as number;
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 });
  } finally {
    conn.release();
  }
}
