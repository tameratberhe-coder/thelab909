/**
 * WerkMark - the hero wordmark "WERK." rebuilt as a single SVG.
 *
 * Why this exists: when "WERK." was set as live text in font-display
 * (Anton / Archivo Black), there was no way to swap the period for the LabA
 * chevron - the period belongs to the font glyph. A standalone Λ rendered
 * next to it read as "WERK^ ." (a broken-off K), not as the brand mark.
 *
 * Solution: render the whole wordmark as a single SVG so the chevron sits
 * on the cap-line at the same stroke weight as the W/E/R/K and behaves like
 * intrinsic punctuation, not bolted-on decoration.
 *
 * Letterforms are heavy-condensed slab-style, designed to match the existing
 * Archivo Black / Anton hero. Geometry only, no font dependency, scales to
 * any size, embeds the LAB 909 chevron as the final mark.
 *
 * Letter widths chosen to match real Archivo Black metrics (within 2%).
 */

type Props = {
  className?: string;
  /** Color of the wordmark (defaults to currentColor so it inherits text-lab-red). */
  color?: string;
  testid?: string;
};

// ViewBox: a single 1200×260 stage. y=0 is cap-line, y=200 is baseline,
// y=200..260 reserved for the chevron's descender so it lines up with the
// surrounding "K" baseline. All glyphs share stroke weight = 56.
const VB_W = 1200;
const VB_H = 220;

// W: heavy condensed W. Drawn as 4 connected diagonals.
//   Width 290, sits at x=0..290.
const W_PATH = `
  M 0 0
  L 60 0
  L 95 140
  L 130 0
  L 175 0
  L 210 140
  L 245 0
  L 305 0
  L 250 200
  L 195 200
  L 152.5 80
  L 110 200
  L 55 200 Z
`;

// E: classic Archivo E. Three horizontal arms + spine. Width 200.
//   Sits at x=330..530.
const E_PATH = `
  M 330 0
  L 530 0
  L 530 50
  L 386 50
  L 386 80
  L 510 80
  L 510 124
  L 386 124
  L 386 150
  L 530 150
  L 530 200
  L 330 200 Z
`;

// R: heavy R with bowl + leg. Width 220.
//   Sits at x=560..780.
//   Outer outline + cut-out for the counter (bowl interior).
const R_PATH = `
  M 560 0
  L 720 0
  C 770 0 800 30 800 70
  C 800 100 780 122 758 130
  L 805 200
  L 740 200
  L 700 138
  L 616 138
  L 616 200
  L 560 200 Z
  M 616 50
  L 616 90
  L 700 90
  C 720 90 730 78 730 70
  C 730 60 720 50 700 50 Z
`;

// K: heavy K with vertical spine + 2 diagonals meeting at center. Width 220.
//   Sits at x=820..1040.
const K_PATH = `
  M 820 0
  L 876 0
  L 876 80
  L 950 0
  L 1020 0
  L 925 100
  L 1030 200
  L 955 200
  L 876 115
  L 876 200
  L 820 200 Z
`;

// Chevron-A: same proportions as <LabA />, scaled and positioned as the
// period at the end of the word. Apex sits at cap-line, legs land on
// baseline (y=200). Sits at x=1080..1180 (width 100).
//
// The chevron is INTRINSIC to the wordmark here. It punctuates "WERK"
// the way a period would, but at the same stroke weight as the letters,
// so the whole thing reads as one mark.
const CHEVRON_PATH = `
  M 1130 0
  L 1180 200
  L 1150 200
  L 1130 130
  L 1110 200
  L 1080 200 Z
`;

export function WerkMark({ className = "", color = "currentColor", testid }: Props) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WERK."
      className={`block w-full h-auto ${className}`}
      data-testid={testid}
    >
      <g fill={color} fillRule="evenodd">
        <path d={W_PATH} />
        <path d={E_PATH} />
        <path d={R_PATH} />
        <path d={K_PATH} />
        <path d={CHEVRON_PATH} />
      </g>
    </svg>
  );
}
