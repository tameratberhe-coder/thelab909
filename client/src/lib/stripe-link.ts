/**
 * Stripe Payment Link configuration. (Board memo #001, P1.)
 *
 * REPLACE the placeholder URL below with the real Payment Link from the
 * Stripe dashboard (Products → Payment Links → Create). One link can cover
 * the consultation deposit and full-price sessions; the booking flow appends
 * session metadata via the prefilled_email + client_reference_id query
 * parameters so Stripe's webhook (when wired up) can match the payment back
 * to the right booking row.
 *
 * Until a real link is set, "Lock it in" shows an inline notice rather than
 * silently failing. To swap in your link:
 *   1. Stripe dashboard → Payment Links → New
 *   2. Set price (or one link per session type if prices differ)
 *   3. Copy the URL and replace STRIPE_PAYMENT_LINK below
 *   4. After payment → Don't show confirmation page → custom URL
 *      → https://thelab909.com/#/booked?cri={CHECKOUT_SESSION_ID}
 *      (or rely on the client_reference_id we pass through; the /booked page
 *      reads any of `client_reference_id`, `cri`, or `ref`.)
 */

export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK";

export function isStripeLinkConfigured(): boolean {
  return !STRIPE_PAYMENT_LINK.includes("REPLACE_WITH_YOUR_LINK");
}

export type StripeBookingPayload = {
  sessionTypeSlug: string;
  startsAt: number;
  email?: string | null;
  notes?: string;
  utmSource?: string | null;
};

/** Build a Stripe Payment Link URL with our booking metadata attached. */
export function buildStripeUrl(p: StripeBookingPayload): string {
  const url = new URL(STRIPE_PAYMENT_LINK);
  // client_reference_id flows through to Stripe's webhook payload — use it
  // to reconcile the payment back to the booking on our side.
  url.searchParams.set(
    "client_reference_id",
    `lab909:${p.sessionTypeSlug}:${p.startsAt}`,
  );
  if (p.email) url.searchParams.set("prefilled_email", p.email);
  if (p.utmSource) url.searchParams.set("utm_source", p.utmSource);
  if (p.notes) url.searchParams.set("utm_content", p.notes.slice(0, 80));
  return url.toString();
}
