/**
 * LabA — the chevron-style "A" from the LAB 909 wordmark.
 *
 * No crossbar. Pure inverted-V (Λ) with the same proportions as the
 * letterform in the logo. Uses currentColor so it inherits text color
 * (works in white/black/red contexts).
 *
 * Sized as an inline glyph: width is 0.7em (slightly narrower than a
 * normal A in display fonts) and height matches cap-height via 1em.
 */
export function LabA({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 70 100"
      aria-hidden="true"
      focusable="false"
      className={`inline-block align-baseline ${className}`}
      style={{
        width: "0.78em",
        height: "0.78em",
        // Pull the glyph down so the apex sits on the cap-line and the
        // legs land on the baseline of surrounding text.
        verticalAlign: "-0.04em",
      }}
    >
      {/* Chevron / inverted V — solid filled triangle outline, NO crossbar. */}
      <path
        d="M 35 0 L 70 100 L 52 100 L 35 51 L 18 100 L 0 100 Z"
        fill="currentColor"
      />
    </svg>
  );
}
