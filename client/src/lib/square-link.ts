/**
 * Square Online Checkout Link configuration.
 *
 * Replaces the prior Stripe Payment Link. Same architecture: a single
 * dashboard-created Checkout Link that we redirect to with the booking
 * metadata attached as query parameters. Square preserves custom query
 * params on the redirect-after-payment URL when the link is configured to
 * "Include URL parameters" in the redirect settings.
 *
 * One-time setup in Square dashboard:
 *   1. Square Dashboard → Online → Checkout Links → Create link
 *      (or: Items & orders → Checkout Links)
 *   2. Pick the right item / pricing for the session type. If prices differ
 *      per session, create one link per type and key them in
 *      SQUARE_LINKS_BY_SLUG below; otherwise SQUARE_PAYMENT_LINK is used as
 *      a single fallback.
 *   3. Under the link's settings, set "Redirect after payment" to:
 *      https://thelab909.com/#/booked
 *      and enable "Include URL parameters" so Square forwards our `ref` /
 *      `cri` / `notes` query strings back to /booked.
 *   4. Paste the resulting square.link / checkout.square.site URL into
 *      SQUARE_PAYMENT_LINK (and SQUARE_LINKS_BY_SLUG, if using multiple).
 *
 * Until a real link is set, "Lock it in" shows an inline notice rather than
 * silently failing.
 */

/** Single fallback link \u2014 use when one link covers all session types. */
export const SQUARE_PAYMENT_LINK = "https://square.link/u/REPLACE_WITH_YOUR_LINK";

/**
 * Optional: per-session-type Checkout Links.
 * If a slug isn't found here, we fall back to SQUARE_PAYMENT_LINK.
 *
 * Slugs must match the `slug` field in lib/session-types-static.ts.
 */
export const SQUARE_LINKS_BY_SLUG: Record<string, string> = {
  // "free-consult": "https://square.link/u/...",
  // "private-1on1": "https://square.link/u/...",
  // "sports-performance": "https://square.link/u/...",
  // "family": "https://square.link/u/...",
  // "small-group": "https://square.link/u/...",
  // "group-fitness": "https://square.link/u/...",
};

const PLACEHOLDER = "REPLACE_WITH_YOUR_LINK";

export function isSquareLinkConfigured(slug?: string): boolean {
  if (slug && SQUARE_LINKS_BY_SLUG[slug]) {
    return !SQUARE_LINKS_BY_SLUG[slug].includes(PLACEHOLDER);
  }
  return !SQUARE_PAYMENT_LINK.includes(PLACEHOLDER);
}

export type SquareBookingPayload = {
  sessionTypeSlug: string;
  startsAt: number;
  email?: string | null;
  notes?: string;
  utmSource?: string | null;
};

/**
 * Build a Square Online Checkout URL with our booking metadata attached.
 *
 * Square doesn't expose a `client_reference_id` style field on dashboard
 * Checkout Links, so we pass our own params: `ref` (the booking key the
 * /booked page already reads), and lightweight UTM-style fields. As long
 * as the link's redirect is set to "Include URL parameters", Square will
 * forward these back to /booked when payment completes.
 */
export function buildSquareUrl(p: SquareBookingPayload): string {
  const base = SQUARE_LINKS_BY_SLUG[p.sessionTypeSlug] ?? SQUARE_PAYMENT_LINK;
  const url = new URL(base);
  // `ref` is the booking key our /booked page parses (lab909:<slug>:<ms>).
  url.searchParams.set("ref", `lab909:${p.sessionTypeSlug}:${p.startsAt}`);
  if (p.email) url.searchParams.set("buyer_email", p.email);
  if (p.utmSource) url.searchParams.set("utm_source", p.utmSource);
  if (p.notes) url.searchParams.set("utm_content", p.notes.slice(0, 80));
  return url.toString();
}
