import { NextResponse } from "next/server";
import { assertDev } from "@/lib/dev-guard";

// GET /dev/set-time?date=YYYY-MM-DD
// GET /dev/set-time?clear=1
export async function GET(req: Request) {
  try {
    assertDev();
  } catch (e: any) {
    return new NextResponse(e.message || "Not Found", { status: e.status || 404 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const clear = url.searchParams.get("clear");

  const res = NextResponse.json({ ok: true, date: date || null, cleared: !!clear });

  if (clear) {
    res.cookies.set("x-fake-today", "", { path: "/", maxAge: 0 });
    return res;
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: "Format tanggal salah (YYYY-MM-DD)" }, { status: 400 });
  }
  // cookie 12 jam cukup (kalau mau lebih panjang, ubah maxAge)
  res.cookies.set("x-fake-today", date, { path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
