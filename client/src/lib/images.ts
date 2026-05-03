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
import sceneSports from "@/assets/products/scene-sports.png";
import sceneGroup from "@/assets/products/scene-group.png";
import scenePrivate from "@/assets/products/scene-private.png";
import trainerCoaching from "@/assets/trainer-coaching.jpg";

export const IMAGES: Record<string, string> = {
  // Products
  "tee-werk": teeWerk,
  "tee-909": tee909,
  "hoodie-pressure": hoodiePressure,
  "cap-red": capRed,
  "shorts": shorts,
  "supp-whey": suppWhey,
  "supp-pre": suppPre,
  "supp-recovery": suppRecovery,
  "supp-bcaa": suppBcaa,
  // Session-type scenes. Original art (real photos live in the homepage gallery only).
  "consult": trainerCoaching,
  "private": scenePrivate,
  "sports": sceneSports,
  "group": sceneGroup,
  "family": sceneGroup,
  "fitness": sceneGroup,
  "training": trainerCoaching,
  // New 2026-05 menu keys. Reuse existing scenes until bespoke art lands.
  "speed": sceneSports,
  "vertical": sceneSports,
  "team": sceneGroup,
  "offsite": scenePrivate,
};

export function imageFor(key: string): string {
  return IMAGES[key] ?? trainerCoaching;
}
