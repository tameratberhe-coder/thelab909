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
const photoTunnel = "/photos/hero-tunnel.jpg";        // hex tunnel landscape
const photoCoachPose = "/photos/coach-pose.jpg";      // spotlight stance
const photoCommunityPair = "/photos/community-pair.jpg"; // two-up landscape
const photoApparelRed = "/photos/apparel-red.jpg";    // red LAB top
const photoApparelOrange = "/photos/apparel-orange.jpg";
const photoApparelHood = "/photos/apparel-hood-1.jpg";

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
  // Session-type scenes — real photoshoot.
  "private": photoCoachPose,
  "sports": photoTunnel,
  "group": photoCommunityPair,
  "family": photoCommunityPair,
  "fitness": photoTunnel,
  "training": trainerCoaching,
};

export function imageFor(key: string): string {
  return IMAGES[key] ?? trainerCoaching;
}
