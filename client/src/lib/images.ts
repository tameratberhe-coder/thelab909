// Map server imageKey -> URL imported via Vite asset pipeline.
import teeWerk from "@/assets/products/tee-werk.png";
import tee909 from "@/assets/products/tee-909.png";
import hoodiePressure from "@/assets/products/hoodie-pressure.png";
import capRed from "@/assets/products/cap-red.png";
import shorts from "@/assets/products/shorts.png";
import suppWhey from "@/assets/products/supp-whey.png";
import suppPre from "@/assets/products/supp-pre.png";
import suppRecovery from "@/assets/products/supp-recovery.png";
import suppBcaa from "@/assets/products/supp-bcaa.png";
import trainerCoaching from "@/assets/trainer-coaching.jpg";

// True Power Media photoshoot — real LAB athletes/coach.
// Public assets (served from /photos/) so they're not Vite-bundled.
const photoTunnel = "/photos/hero-tunnel.jpg";          // hex tunnel — sprint/performance stage
const photoCoachPose = "/photos/coach-pose.jpg";        // spotlight stance — 1-on-1 focus
const photoCoachPortrait = "/photos/coach-portrait.jpg";// founder portrait — consult/coach
const photoCommunityPair = "/photos/community-pair.jpg";// two-up landscape — family/duo
const photoAthleteStance = "/photos/athlete-stance.jpg";// crew-member stance — small group
const photoPower = "/photos/power.jpg";                 // high-intensity — group fitness/class
const photoApparelRed = "/photos/apparel-red.jpg";      // red LAB top
const photoApparelOrange = "/photos/apparel-orange.jpg";// orange LAB tee
const photoApparelHood = "/photos/apparel-hood-1.jpg";  // white LAB hooded tank

export const IMAGES: Record<string, string> = {
  // Apparel — real LAB-branded photoshoot replaces AI product mocks.
  "tee-werk": photoApparelRed,
  "tee-909": photoApparelOrange,
  "hoodie-pressure": photoApparelHood,
  // Accessories — keep mocks until real product photography.
  "cap-red": capRed,
  "shorts": shorts,
  // Supplements — keep mocks (no real photos yet).
  "supp-whey": suppWhey,
  "supp-pre": suppPre,
  "supp-recovery": suppRecovery,
  "supp-bcaa": suppBcaa,
  // Session-type scenes — each image semantically matches the service:
  // • consult     → founder portrait (it's a conversation with the coach)
  // • private    → single athlete in a spotlight (1-on-1 focus)
  // • sports     → hex tunnel sprint stage (performance/speed work)
  // • family     → two-up frame, multiple people (household training)
  // • group      → determined single crew-member stance (small group)
  // • fitness    → high-intensity LAB athlete (class energy)
  "consult": photoCoachPortrait,
  "private": photoCoachPose,
  "sports": photoTunnel,
  "family": photoCommunityPair,
  "group": photoAthleteStance,
  "fitness": photoPower,
  "training": trainerCoaching,
};

export function imageFor(key: string): string {
  return IMAGES[key] ?? trainerCoaching;
}
