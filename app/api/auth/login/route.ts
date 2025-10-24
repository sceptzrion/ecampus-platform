// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import mysql2 from "mysql2/promise";

type DBUser = {
  id: number;
  name: string;
  email: string;
  password: string; // plaintext (prototype)
  role: "staff" | "student" | "admin";
  is_active: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const db = getPool();
    const [rows] = await db.execute<mysql2.RowDataPacket[]>(
      "SELECT id, name, email, password, role, is_active FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const list = rows as unknown as DBUser[];
    const user = list[0];

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Akun tidak ditemukan." },
        { status: 404 }
      );
    }
    if (!user.is_active) {
      return NextResponse.json(
        { ok: false, error: "Akun tidak aktif." },
        { status: 403 }
      );
    }

    // PROTOTYPE: bandingkan plaintext (nanti ganti ke bcrypt)
    if (password !== user.password) {
      return NextResponse.json(
        { ok: false, error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // sukses
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json({ ok: true, user: safeUser }, { status: 200 });
  } catch (e) {
    // Bisa log detail error di server, tapi jangan bocorkan ke client
    return NextResponse.json({ ok: false, error: "Bad Request" }, { status: 400 });
  }
}
