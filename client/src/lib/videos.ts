// Centralized map of every reel + poster import.
// Vite handles hashing + URL rewrites at build.

import reelHero from "@/assets/video/reel-hero.mp4";
import reelHeroPoster from "@/assets/video/reel-hero.jpg";
import reelMaster from "@/assets/video/reel-master.mp4";
import reelMasterPoster from "@/assets/video/reel-master.jpg";
import reelAlex from "@/assets/video/reel-alex.mp4";
import reelAlexPoster from "@/assets/video/reel-alex.jpg";
import reelJp from "@/assets/video/reel-jp.mp4";
import reelJpPoster from "@/assets/video/reel-jp.jpg";
import reelAq from "@/assets/video/reel-aq.mp4";
import reelAqPoster from "@/assets/video/reel-aq.jpg";
import reelSdsu from "@/assets/video/reel-sdsu.mp4";
import reelSdsuPoster from "@/assets/video/reel-sdsu.jpg";
import reelApp1 from "@/assets/video/reel-app1.mp4";
import reelApp1Poster from "@/assets/video/reel-app1.jpg";
import reelApp2 from "@/assets/video/reel-app2.mp4";
import reelApp2Poster from "@/assets/video/reel-app2.jpg";
import reelWide from "@/assets/video/reel-wide.mp4";
import reelWidePoster from "@/assets/video/reel-wide.jpg";
import reelCinematic from "@/assets/video/reel-cinematic.mp4";
import reelCinematicPoster from "@/assets/video/reel-cinematic.jpg";

export type Reel = {
  id: string;
  src: string;
  poster: string;
  label: string;
  caption: string;
  orientation: "portrait" | "landscape";
};

export const REELS: Record<string, Reel> = {
  hero: { id: "hero", src: reelHero, poster: reelHeroPoster, label: "THE LAB 909", caption: "Inside the facility", orientation: "portrait" },
  master: { id: "master", src: reelMaster, poster: reelMasterPoster, label: "PRESSURE.MOV", caption: "Featured film", orientation: "portrait" },
  alex: { id: "alex", src: reelAlex, poster: reelAlexPoster, label: "ALEX", caption: "Sports performance", orientation: "portrait" },
  jp: { id: "jp", src: reelJp, poster: reelJpPoster, label: "JP", caption: "1-on-1 coaching", orientation: "portrait" },
  aq: { id: "aq", src: reelAq, poster: reelAqPoster, label: "AQ × LAB", caption: "Basketball performance", orientation: "portrait" },
  sdsu: { id: "sdsu", src: reelSdsu, poster: reelSdsuPoster, label: "LAB × SDSU", caption: "Collegiate prep", orientation: "portrait" },
  app1: { id: "app1", src: reelApp1, poster: reelApp1Poster, label: "FACILITY 01", caption: "Live training", orientation: "portrait" },
  app2: { id: "app2", src: reelApp2, poster: reelApp2Poster, label: "FACILITY 02", caption: "Reps, sound, breath", orientation: "portrait" },
  wide: { id: "wide", src: reelWide, poster: reelWidePoster, label: "THE FLOOR", caption: "Wide angle", orientation: "landscape" },
  cinematic: { id: "cinematic", src: reelCinematic, poster: reelCinematicPoster, label: "DON'T TRAIN. WERK.", caption: "Cinematic", orientation: "portrait" },
};

export const REEL_LIST = Object.values(REELS);
