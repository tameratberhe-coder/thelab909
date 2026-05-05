# thelab909

The codebase behind [thelab909.com](https://thelab909.com). Inland Empire training ground.
Vite + React + TypeScript + Tailwind + wouter, deployed on Netlify.

> **Brand note:** "Werk" (with an E) is the intentional spelling.
> Do not auto-correct to "Work" on any content update.
> See `Lab909_OwnershipHandoff.pdf` section 06.

## Local development

```bash
npm install
npm run dev          # Vite dev server, http://localhost:5173
npm run build        # production bundle into dist/public
```

## Deploy

Push to `master`. Netlify auto-builds in ~50 seconds and ships to
[thelab909.com](https://thelab909.com). No manual deploy step.

## Routing

The site is currently in **waitlist mode**:

- `/` renders `client/src/pages/Soon.tsx` (the coming-soon waitlist).
- `/site` renders the full marketing home (`client/src/pages/Home.tsx`).
- All other routes (`/book`, `/membership`, `/shop`, `/privacy`, `/terms`,
  `/booked`) are intact and reachable directly.

To flip the site out of waitlist mode and make `/` the marketing home again,
swap the route mounting in `client/src/App.tsx`.

## The four files you will touch most often

| File | What lives here |
|---|---|
| `client/src/lib/square-link.ts` | `SQUARE_PAYMENT_LINK` (currently a placeholder, see handoff PDF section 02 for wiring) |
| `client/src/lib/session-types-static.ts` | Six bookable services, prices, and inquiry-only flags |
| `client/src/pages/Soon.tsx` | The waitlist page that lives at `/` |
| `client/src/pages/Home.tsx` | The full marketing home that lives at `/site` |

## Forms

The waitlist form posts to Netlify Forms (form name: `waitlist`).
Submissions land in **Netlify Dashboard > Forms > waitlist**.
Export to CSV from that page.

## Stack reference

- **Framework:** Vite 5 + React 18 + TypeScript
- **Router:** wouter (hash routing in production)
- **Styling:** Tailwind CSS, custom design tokens in `tailwind.config.ts`
- **Components:** Local `client/src/components/` (Logo, LabA, AutoVideo, Ticker)
- **Deploy:** Netlify (Pro plan), auto-build from `master`
- **Domain:** GoDaddy, DNS pointing to Netlify

## Non-engineering context

For everything that is not code (account ownership, payment processor wiring,
Instagram bio, the photographer license, the brand voice doc, the waiver),
read **`Lab909_OwnershipHandoff.pdf`** delivered with this repo.

## Mandatory waiver

`scripts/build_waiver.py` regenerates the participant waiver PDF.
The waiver references The LAB 909 by name and is governed by California law.
Do not modify the legal language without an attorney review.
