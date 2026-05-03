import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { LabA } from "@/components/LabA";
import { STATIC_SESSION_TYPES } from "@/lib/session-types-static";
import { fmtDateTime, money } from "@/lib/format";
import { Check, ArrowRight } from "lucide-react";

/**
 * /booked: Square Checkout Link returns here after a successful payment.
 * (Design move D4.)
 *
 * The booking flow encodes session metadata into the redirect URL as
 * `ref=lab909:<slug>:<startsAtMs>`. Square preserves URL parameters on the
 * post-payment redirect when the link's "Include URL parameters" toggle is
 * on. For backwards-compat with old Stripe-issued receipts we still accept
 * `client_reference_id` and `cri` as well.
 *
 * Until the backend deploys to validate the payment server-side, this page
 * trusts the URL params for display only. The real source of truth is the
 * Square dashboard. We also stash the locked slot in localStorage so the
 * athlete can return to the page later from their phone history.
 */
export default function Booked() {
  const ref = useMemo(() => readReference(), []);
  const [stored, setStored] = useState<{ slug: string; startsAt: number } | null>(null);

  useEffect(() => {
    if (ref) {
      try {
        localStorage.setItem("lab909:lastBooking", JSON.stringify(ref));
      } catch {
        /* ignore quota errors */
      }
      setStored(ref);
      return;
    }
    try {
      const raw = localStorage.getItem("lab909:lastBooking");
      if (raw) setStored(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [ref]);

  const sessionType = stored
    ? STATIC_SESSION_TYPES.find((t) => t.slug === stored.slug)
    : undefined;

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="border-2 border-lab-red bg-lab-red/10 rounded p-8" data-testid="booked-confirmation">
            <div className="w-14 h-14 bg-lab-red rounded-full flex items-center justify-center mb-5">
              <Check className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
            <p className="label-mono text-lab-red mb-2">// LOCKED IN</p>
            <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight mb-6">
              You're<br />in.
            </h1>

            {sessionType && stored ? (
              <>
                <p className="text-white/80 text-lg mb-6">
                  {sessionType.name} · {fmtDateTime(stored.startsAt)}
                </p>
                <dl className="space-y-2 text-sm border-t border-white/10 pt-4 mb-8">
                  <div className="flex justify-between">
                    <dt className="text-white/50">Session</dt>
                    <dd>{sessionType.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/50">Duration</dt>
                    <dd>{sessionType.durationMin} min</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/50">Charged</dt>
                    <dd>{money(sessionType.priceCents, { hideZero: true })}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/50">Receipt</dt>
                    <dd className="text-white/70">Sent by Square to your email</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-white/80 text-lg mb-8">
                Payment received. Square just emailed your receipt. The coach will follow up
                within 24 hours to confirm your time.
              </p>
            )}

            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              Please show up <strong className="text-white">10 minutes early</strong> for your first session.
              Bring training clothes, a water bottle, and any gear from your sport. If you need to
              reschedule, message <a href="https://www.instagram.com/thelab909/" target="_blank" rel="noopener" className="text-lab-red underline">@thelab909</a> on Instagram or email <a href="mailto:hello@thelab909.com" className="text-lab-red underline">hello@thelab909.com</a> at least 24 hours before your slot.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-wider text-sm px-6 py-4 rounded-full thrust hover:bg-black hover:text-white"
                data-testid="link-home"
              >
                Back to home <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://www.instagram.com/thelab909/"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-6 py-4 rounded-full label-mono hover:border-white"
              >
                Follow @thelab909
              </a>
            </div>
          </div>

          <p className="mt-10 text-center text-white/40 text-sm">
            <span className="text-lab-red"><LabA /></span> &nbsp;ALL WE KNOW IS <span className="text-lab-red">WERK.</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}

/** Pull the booking reference out of the URL Square redirected us to. */
function readReference(): { slug: string; startsAt: number } | null {
  if (typeof window === "undefined") return null;
  // Hash routing: real query string lives inside the hash on /booked.
  const hashQuery = window.location.hash.includes("?")
    ? window.location.hash.split("?")[1]
    : "";
  const params = new URLSearchParams(window.location.search || hashQuery);
  const raw =
    params.get("client_reference_id") ||
    params.get("cri") ||
    params.get("ref") ||
    "";
  if (!raw.startsWith("lab909:")) return null;
  const [, slug, startsStr] = raw.split(":");
  const startsAt = Number(startsStr);
  if (!slug || !Number.isFinite(startsAt)) return null;
  return { slug, startsAt };
}
