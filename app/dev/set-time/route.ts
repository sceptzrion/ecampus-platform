import { NextResponse } from "next/server";
import { assertDev } from "@/lib/dev-guard";

// GET /dev/set-time?date=YYYY-MM-DD
// GET /dev/set-time?dt=YYYY-MM-DDTHH:mm
// GET /dev/set-time?clear=1
export async function GET(req: Request) {
  try {
    assertDev();
  } catch (e: any) {
    return new NextResponse(e.message || "Not Found", { status: e.status || 404 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const dt = url.searchParams.get("dt");      // NEW
  const clear = url.searchParams.get("clear");

  const res = NextResponse.json({
    ok: true,
    date: date || null,
    dt: dt || null,
    cleared: !!clear,
  });

  if (clear) {
    res.cookies.set("x-fake-today", "", { path: "/", maxAge: 0 });
    res.cookies.set("x-fake-now", "",   { path: "/", maxAge: 0 });
    return res;
  }

  // Prioritas: dt > date
  if (dt) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dt)) {
      return NextResponse.json({ ok: false, error: "Format dt salah (YYYY-MM-DDTHH:mm)" }, { status: 400 });
    }
    // Simpan keduanya utk kompatibilitas
    res.cookies.set("x-fake-now", dt,           { path: "/", maxAge: 60 * 60 * 12 });
    res.cookies.set("x-fake-today", dt.slice(0,10), { path: "/", maxAge: 60 * 60 * 12 });
    return res;
  }

  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok: false, error: "Format tanggal salah (YYYY-MM-DD)" }, { status: 400 });
    }
    res.cookies.set("x-fake-today", date, { path: "/", maxAge: 60 * 60 * 12 });
    // juga set x-fake-now di pukul 00:00 agar komponen lain bisa baca jam
    res.cookies.set("x-fake-now", `${date}T00:00`, { path: "/", maxAge: 60 * 60 * 12 });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Butuh ?date=... atau ?dt=..." }, { status: 400 });
}
