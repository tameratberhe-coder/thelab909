/**
 * Static session-type catalog for when the Express backend is not deployed.
 * (Board memo #001, P4.) Mirrors the seeded rows from server/storage.ts so the
 * booking page renders identically with or without a backend.
 *
 * IDs are stable; the booking flow uses them in the URL passed to Square so
 * we can reconcile sessions later.
 *
 * Pricing convention:
 *   priceCents > 0  → Square Checkout Link required (see lib/square-link.ts)
 *   priceCents === 0 → "Inquiry / quote" flow → mailto in Book.tsx
 *
 * NOTE: paid prices below are placeholder defaults sized to Inland Empire
 * performance-training market rates. Override `priceCents` once Tam confirms
 * actual rates.
 */
import type { SessionType } from "@shared/schema";

/** Slugs that should NEVER hit Square — they always go to mailto inquiry. */
export const INQUIRY_ONLY_SLUGS = new Set<string>([
  "team-training",
  "off-site-training",
]);

export const STATIC_SESSION_TYPES: SessionType[] = [
  {
    id: 1,
    slug: "sports-performance",
    name: "Sports Performance",
    durationMin: 60,
    capacity: 1,
    priceCents: 12500,
    tagline: "Dynamic speed and power training. Position-specific. Built for in-season and off-season athletes.",
    imageKey: "sports",
  },
  {
    id: 2,
    slug: "fitness",
    name: "Fitness",
    durationMin: 60,
    capacity: 1,
    priceCents: 7500,
    tagline: "1-on-1 strength and conditioning. Get in shape under a coach who actually programs for you.",
    imageKey: "fitness",
  },
  {
    id: 3,
    slug: "team-training",
    name: "Team Training",
    durationMin: 90,
    capacity: 20,
    priceCents: 0,
    tagline: "Whole-team performance training at the LAB or your facility. Custom block, custom price.",
    imageKey: "team",
  },
  {
    id: 4,
    slug: "off-site-training",
    name: "Off Site Training",
    durationMin: 60,
    capacity: 1,
    priceCents: 0,
    tagline: "We come to your school, club, or home gym. Travel + private programming included.",
    imageKey: "offsite",
  },
  {
    id: 5,
    slug: "speed-training",
    name: "Speed Training",
    durationMin: 60,
    capacity: 1,
    priceCents: 12500,
    tagline: "Pure acceleration, top-end speed, change of direction. Sprint mechanics dialed in.",
    imageKey: "speed",
  },
  {
    id: 6,
    slug: "vertical-training",
    name: "Vertical Training",
    durationMin: 60,
    capacity: 1,
    priceCents: 12500,
    tagline: "Add inches to your vertical. Plyometrics, force production, jump mechanics — measured every session.",
    imageKey: "vertical",
  },
];
