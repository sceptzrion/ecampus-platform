import { NextResponse } from "next/server";

function devGuard() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  const guard = devGuard(); if (guard) return guard;

  const url = new URL(req.url);
  const d = url.searchParams.get("date");
  const clear = url.searchParams.get("clear");

  const res = new NextResponse(
    `<pre>Fake today ${
      clear ? "cleared" : d ? `set to ${d}` : "not changed"
    } (cookie: x-fake-today). 
Open /dev/reseed to reseed, or /dev/set-time?clear=1 to clear.</pre>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );

  if (clear) {
    res.headers.set("Set-Cookie", `x-fake-today=; Path=/; Max-Age=0; SameSite=Lax`);
  } else if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    res.headers.set("Set-Cookie", `x-fake-today=${encodeURIComponent(d)}; Path=/; Max-Age=2592000; SameSite=Lax`);
  }
  return res;
}
