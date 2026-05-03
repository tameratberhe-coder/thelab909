import { useState } from "react";
import { Lock } from "lucide-react";

export type CardForm = { number: string; expiry: string; cvc: string; zip: string };

export function MockCardForm({ value, onChange, disabled }: { value: CardForm; onChange: (v: CardForm) => void; disabled?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 label-mono text-white/40">
        <Lock className="w-3.5 h-3.5" /> SECURE PAYMENT · POWERED BY SQUARE
      </div>
      <div>
        <label className="label-mono text-white/50 mb-2 block">Card number</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="4111 1111 1111 1111"
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          disabled={disabled}
          className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white font-mono focus:border-lab-red focus:outline-none disabled:opacity-50"
          data-testid="input-card-number"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label-mono text-white/50 mb-2 block">Expiry</label>
          <input
            type="text"
            placeholder="MM / YY"
            value={value.expiry}
            onChange={(e) => onChange({ ...value, expiry: e.target.value })}
            disabled={disabled}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white font-mono focus:border-lab-red focus:outline-none disabled:opacity-50"
            data-testid="input-card-expiry"
          />
        </div>
        <div>
          <label className="label-mono text-white/50 mb-2 block">CVC</label>
          <input
            type="text"
            placeholder="123"
            value={value.cvc}
            onChange={(e) => onChange({ ...value, cvc: e.target.value })}
            disabled={disabled}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white font-mono focus:border-lab-red focus:outline-none disabled:opacity-50"
            data-testid="input-card-cvc"
          />
        </div>
        <div>
          <label className="label-mono text-white/50 mb-2 block">ZIP</label>
          <input
            type="text"
            placeholder="91786"
            value={value.zip}
            onChange={(e) => onChange({ ...value, zip: e.target.value })}
            disabled={disabled}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white font-mono focus:border-lab-red focus:outline-none disabled:opacity-50"
            data-testid="input-card-zip"
          />
        </div>
      </div>
      <p className="text-xs text-white/40">Demo mode. No real card is charged. Enter any digits to proceed.</p>
    </div>
  );
}

export function isValidCard(v: CardForm): boolean {
  return v.number.replace(/\s+/g, "").length >= 12 && v.expiry.length >= 4 && v.cvc.length >= 3 && v.zip.length >= 4;
}
