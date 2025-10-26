// app/dev/set-time/route.ts
import { NextResponse } from "next/server";
import { assertDev } from "@/lib/dev-guard";
import { getPool } from "@/lib/db";

// GET /dev/set-time?date=YYYY-MM-DD[&time=HH:MM(:SS)]
// GET /dev/set-time?clear=1
export async function GET(req: Request) {
  try {
    assertDev();
  } catch (e: any) {
    return new NextResponse(e.message || "Not Found", { status: e.status || 404 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const time = url.searchParams.get("time");
  const clear = url.searchParams.get("clear");

  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.query("SET time_zone = '+07:00'");

    const res = NextResponse.json({ ok: true, cleared: !!clear, date: date || null, time: time || null });

    if (clear) {
      // hapus fake time global
      await conn.query(`INSERT INTO app_settings(\`key\`, \`value\`)
                        VALUES('fake_now_wib', NULL)
                        ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`);
      // hapus cookie UI
      res.cookies.set("x-fake-today", "", { path: "/", maxAge: 0 });
      return res;
    }

    // Validasi input
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "Format tanggal salah (YYYY-MM-DD)" }, { status: 400 });
    }
    let hhmmss = "00:00:00";
    if (time) {
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
        return NextResponse.json({ ok: false, error: "Format time salah (HH:MM atau HH:MM:SS)" }, { status: 400 });
      }
      hhmmss = time.length === 5 ? `${time}:00` : time;
    }

    const dt = `${date} ${hhmmss}`; // WIB
    // Simpan global fake time
    await conn.query(
      `INSERT INTO app_settings(\`key\`, \`value\`)
       VALUES('fake_now_wib', ?)
       ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`,
      [dt]
    );

    // Cookie UI tetap simpan tanggal (biar komponen yang pakai date-only tetap dapat highlight)
    res.cookies.set("x-fake-today", date, { path: "/", maxAge: 60 * 60 * 12 });

    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message || "set-time failed" }, { status: 500 });
  } finally {
    try { conn.release(); } catch {}
  }
}
