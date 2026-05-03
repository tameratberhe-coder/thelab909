/**
 * Static session-type catalog for when the Express backend is not deployed.
 * (Board memo #001, P4.) Mirrors the seeded rows from server/storage.ts so the
 * booking page renders identically with or without a backend.
 *
 * IDs are stable; the booking flow uses them in the URL passed to Square so
 * we can reconcile sessions later.
 */
import type { SessionType } from "@shared/schema";

export const STATIC_SESSION_TYPES: SessionType[] = [
  {
    id: 1,
    slug: "free-consult",
    name: "Free Consultation",
    durationMin: 10,
    capacity: 1,
    priceCents: 0,
    tagline: "Tell us your goal — we map a plan. No card, no commitment.",
    imageKey: "consult",
  },
  {
    id: 2,
    slug: "private-1on1",
    name: "1-on-1 Private",
    durationMin: 60,
    capacity: 1,
    priceCents: 12500,
    tagline: "Private coaching designed around your body, goals, and schedule.",
    imageKey: "private",
  },
  {
    id: 3,
    slug: "sports-performance",
    name: "Sports Performance",
    durationMin: 60,
    capacity: 1,
    priceCents: 12500,
    tagline: "Position-specific training. Speed, agility, explosive power, recovery.",
    imageKey: "sports",
  },
  {
    id: 4,
    slug: "family",
    name: "Family Training",
    durationMin: 60,
    capacity: 4,
    priceCents: 18000,
    tagline: "The whole family in the gym at once. Different intensities, same standard.",
    imageKey: "family",
  },
  {
    id: 5,
    slug: "small-group",
    name: "Small Group",
    durationMin: 60,
    capacity: 4,
    priceCents: 9000,
    tagline: "Train with a small crew pushing the same direction.",
    imageKey: "group",
  },
  {
    id: 6,
    slug: "group-fitness",
    name: "Group Fitness",
    durationMin: 60,
    capacity: 12,
    priceCents: 3500,
    tagline: "Coach-led conditioning class. Drop in, push hard, leave wrecked.",
    imageKey: "fitness",
  },
];
