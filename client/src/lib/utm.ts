/**
 * Lightweight first-touch UTM capture. (Board memo #001, P7.)
 *
 * Reads ?utm_source / ?utm_medium / ?utm_campaign from the URL on first load
 * and persists them in localStorage so subsequent navigations (and the Stripe
 * Payment Link) can carry the source through the funnel without server-side
 * sessions.
 *
 * Designed for IG bio links of the form:
 *   https://thelab909.com/#/book?utm_source=ig&utm_medium=bio&utm_campaign=spring26
 *
 * When real analytics are wired (PostHog / Plausible / GA4), pipe the result
 * of getStoredUtm() into the identify/event payload. For now we just stash it
 * and forward it to Stripe.
 */

const KEY = "lab909:utm";

export type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  capturedAt: number;
};

/** Call once on app boot. Captures UTMs from the current URL if present. */
export function captureUtmFromUrl(): Utm | null {
  if (typeof window === "undefined") return null;
  // Hash routing: real query string lives inside the hash for /book pages,
  // and as a normal query string for the root URL (?utm_source=ig).
  const hashQuery = window.location.hash.includes("?")
    ? window.location.hash.split("?")[1]
    : "";
  const params = new URLSearchParams(window.location.search || hashQuery);
  const source = params.get("utm_source") ?? undefined;
  const medium = params.get("utm_medium") ?? undefined;
  const campaign = params.get("utm_campaign") ?? undefined;

  if (!source && !medium && !campaign) {
    return getStoredUtm();
  }

  const utm: Utm = { source, medium, campaign, capturedAt: Date.now() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(utm));
    // eslint-disable-next-line no-console
    console.info("[lab909] captured UTM", utm);
  } catch {
    /* ignore quota errors */
  }
  return utm;
}

export function getStoredUtm(): Utm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Utm;
  } catch {
    return null;
  }
}
