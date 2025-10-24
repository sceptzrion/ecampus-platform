// "Hari ini" untuk client-side komponen.
// Jika ada cookie x-fake-today (YYYY-MM-DD), kita pakai itu (WIB).
export function nowWIB(): Date {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)x-fake-today=([^;]+)/);
    if (m) {
      // 12:00 WIB supaya pasti "tengah hari"
      return new Date(`${decodeURIComponent(m[1])}T05:00:00.000Z`); // 05:00 UTC = 12:00 WIB
    }
  }
  return new Date();
}
