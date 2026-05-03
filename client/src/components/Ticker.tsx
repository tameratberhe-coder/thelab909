export function Ticker({ words = ["WERK", "SPEED", "STRENGTH", "POWER", "RECOVERY", "DISCIPLINE", "PRESSURE", "PRECISION"] }: { words?: string[] }) {
  const sequence = words.flatMap((w, i) => [w, "★"]).concat(words);
  return (
    <div className="bg-lab-red text-white py-4 overflow-hidden border-y border-black/20" data-testid="ticker">
      <div className="ticker-track gap-8 px-4">
        {[...sequence, ...sequence].map((w, i) => (
          <span key={i} className="font-archivo text-2xl sm:text-3xl tracking-tight whitespace-nowrap select-none">
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
