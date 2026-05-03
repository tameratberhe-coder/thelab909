/**
 * Static booking slot generator. (Board memo #001, P4.)
 *
 * The Express backend at server/routes.ts is not deployed to Netlify, so a
 * client-side request to /api/slots fails in production. This module computes
 * the same schedule purely in the browser so the booking page works without
 * any backend.
 *
 * Schedule (Pacific time):
 *   Mon / Tue / Thu  → 5:00, 6:00, 7:00, 8:00, 9:00 AM  +  2:30, 3:30, 4:30, 5:30, 6:30 PM
 *   Fri              → 5:00, 6:00, 7:00, 8:00, 9:00 AM
 *   Sat              → 7:00 AM
 *   Wed / Sun        → CLOSED
 *
 * Past slots (earlier than now) are filtered out so the picker never offers
 * times that have already passed. There is no “already booked” suppression
 * in the static path — that requires a backend.
 */

export type Slot = { ts: number; label: string };
export type SlotsResult = { date: string; dow: number; slots: Slot[] };

const MORNING_MIN = [5, 6, 7, 8, 9].map((h) => h * 60);
const EVENING_MIN = [14 * 60 + 30, 15 * 60 + 30, 16 * 60 + 30, 17 * 60 + 30, 18 * 60 + 30];

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Return available slots for a YYYY-MM-DD date in the user's local time zone.
 * Mirrors the server route's logic exactly so behavior is identical when the
 * backend eventually deploys.
 */
export function getStaticSlots(date: string): SlotsResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { date, dow: -1, slots: [] };
  }
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0=Sun..6=Sat

  let mins: number[] = [];
  if (dow === 1 || dow === 2 || dow === 4) mins = [...MORNING_MIN, ...EVENING_MIN];
  else if (dow === 5) mins = MORNING_MIN;
  else if (dow === 6) mins = [7 * 60];
  else mins = []; // Wed, Sun

  const now = Date.now();
  const slots: Slot[] = mins
    .map((min) => new Date(y, m - 1, d, Math.floor(min / 60), min % 60, 0).getTime())
    .filter((ts) => ts > now)
    .map((ts) => ({ ts, label: timeLabel(ts) }));

  return { date, dow, slots };
}
