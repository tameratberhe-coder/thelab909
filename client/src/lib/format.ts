export function money(cents: number, opts?: { hideZero?: boolean }) {
  if (opts?.hideZero && cents === 0) return "Free";
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: dollars % 1 === 0 ? 0 : 2 });
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
export function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
export function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
