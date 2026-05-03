import { LabA } from "@/components/LabA";

/**
 * Chevron divider - promotes the LabA mark to a system artifact.
 * Used once between long sections (Manifesto → Train, Train → Programs, etc.)
 * to give the eye a rest and reinforce the brand glyph without sprinkling it
 * on every CTA. (Design move D3.)
 */
export function ChevronDivider({
  className = "",
  color = "text-lab-red",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center py-12 ${className}`}
      role="presentation"
      aria-hidden="true"
      data-testid="chevron-divider"
    >
      <span className="absolute left-0 right-0 h-px bg-white/10" />
      <span className={`relative bg-black px-6 ${color}`} style={{ fontSize: "28px", lineHeight: 1 }}>
        <LabA />
      </span>
    </div>
  );
}
