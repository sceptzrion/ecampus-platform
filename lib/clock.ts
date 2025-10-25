// lib/clock.ts
// nowWIB(): Date "sekarang" di zona Asia/Jakarta.
// Jika cookie x-fake-today=YYYY-MM-DD ada, kita ganti HARI-nya, jam-menit-detik tetap mengikuti waktu sekarang.

export function nowWIB(): Date {
  const tz = "Asia/Jakarta";
  let now = new Date();

  // baca cookie di browser
  try {
    if (typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|;\s*)x-fake-today=([^;]+)/);
      if (m) {
        const [y, mo, d] = decodeURIComponent(m[1]).split("-").map(Number);
        // clone "now", ganti tanggalnya
        const mutated = new Date(now);
        mutated.setFullYear(y, (mo || 1) - 1, d || 1);
        now = mutated;
      }
    }
  } catch { /* noop */ }

  // konversi ke WIB supaya konsisten
  const t = now.toLocaleString("en-US", { timeZone: tz });
  return new Date(t);
}
