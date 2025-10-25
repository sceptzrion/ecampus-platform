// lib/datetime.ts
// konversi nilai dari <input type="datetime-local"> (local) ke ISO UTC
export function localInputToUTCISO(localValue: string): string {
  // localValue contoh: "2025-10-27T09:30"
  const d = new Date(localValue);
  return new Date(
    Date.UTC(
      d.getFullYear(), d.getMonth(), d.getDate(),
      d.getHours(), d.getMinutes(), d.getSeconds()
    )
  ).toISOString().slice(0, 19).replace("T", " ");
}

// dari ISO UTC DB → string buat <input datetime-local> lokal
export function utcToLocalInput(utcISO: string): string {
  // menerima "YYYY-MM-DD HH:MM:SS" atau ISO
  const iso = utcISO.includes("T") ? utcISO : utcISO.replace(" ", "T") + "Z";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
