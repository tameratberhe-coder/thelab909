import { ReactNode } from "react";
import { LabA } from "./LabA";

/**
 * LabText — replaces every "A" / "a" in plain text children with the
 * LAB 909 chevron-A glyph. Other characters pass through untouched.
 *
 * Children can include arbitrary React nodes (e.g. <br />, <span>, ...).
 * Strings are tokenised letter-by-letter so spacing & word-breaking
 * remain identical to the original text. Non-string children are
 * passed through unchanged so you can mix in <br /> for line breaks.
 *
 * Usage:
 *   <h1 className="font-display"><LabText>BOOK A SESSION</LabText></h1>
 *   <button><LabText>Train</LabText></button>
 *   <LabText>Locked.<br />Loaded.</LabText>
 */
export function LabText({ children }: { children: ReactNode }) {
  const transform = (node: ReactNode, key: string | number = 0): ReactNode => {
    if (typeof node === "string") {
      // Split on A/a; keep delimiters so we can render a glyph for each.
      const parts = node.split(/([Aa])/);
      return parts.map((part, i) => {
        if (part === "A" || part === "a") {
          return <LabA key={`${key}-a-${i}`} />;
        }
        return part;
      });
    }
    if (typeof node === "number" || typeof node === "boolean" || node == null) {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map((n, i) => transform(n, `${key}-${i}`));
    }
    // ReactElement, fragment, etc — leave intact
    return node;
  };
  return <>{transform(children)}</>;
}
