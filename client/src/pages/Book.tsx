import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { money, fmtDate, fmtDateTime, isoDate } from "@/lib/format";
import { imageFor } from "@/lib/images";
import { getStaticSlots, type SlotsResult } from "@/lib/static-slots";
import { STATIC_SESSION_TYPES, INQUIRY_ONLY_SLUGS } from "@/lib/session-types-static";
import { buildSquareUrl, isSquareLinkConfigured } from "@/lib/square-link";
import { getStoredUtm } from "@/lib/utm";
import type { SessionType } from "@shared/schema";
import { ArrowRight, Check, Calendar as CalIcon } from "lucide-react";

type SlotsResponse = SlotsResult;

export default function Book() {
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [date, setDate] = useState<string>(isoDate(addDays(new Date(), 1)));
  const [selectedTs, setSelectedTs] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Static catalog + static slot generator. No backend needed (P4).
  const sessionTypes = STATIC_SESSION_TYPES;
  const selectedType = sessionTypes.find((t) => t.id === selectedTypeId) ?? null;

  const slotsData: SlotsResponse | undefined = useMemo(
    () => (step === 2 ? getStaticSlots(date) : undefined),
    [step, date],
  );

  function next() { setError(null); setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s)); }
  function back() { setError(null); setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s)); }

  function onTypeSelect(id: number) {
    setSelectedTypeId(id);
    next();
  }

  // "Lock it in": redirect to Square Online Checkout with booking metadata.
  // Inquiry-only session types (team training, off-site, anything priced at $0)
  // skip Square and send a structured quote request via mailto.
  function onConfirm() {
    setError(null);
    if (!selectedType || !selectedTs) return;
    if (!waiverAccepted) {
      setError("Please review and accept the liability waiver to continue.");
      return;
    }
    const utm = getStoredUtm();
    const isInquiry =
      selectedType.priceCents === 0 || INQUIRY_ONLY_SLUGS.has(selectedType.slug);
    if (isInquiry) {
      // Send a quote request via mailto so the coach gets the lead without any
      // backend. Replace with form-handler integration once backend deploys.
      const subject = encodeURIComponent(`LAB 909: ${selectedType.name} request`);
      const body = encodeURIComponent(
        `Session: ${selectedType.name}\n` +
          `Preferred start: ${new Date(selectedTs).toLocaleString()}\n` +
          `Notes: ${notes || "(none)"}\n` +
          `UTM source: ${utm?.source || "direct"}\n` +
          `(Waiver acknowledged on site.)`,
      );
      window.location.href = `mailto:hello@thelab909.com?subject=${subject}&body=${body}`;
      return;
    }
    if (!isSquareLinkConfigured(selectedType.slug)) {
      setError(
        "Online checkout is being set up. Email hello@thelab909.com or DM @thelab909 to lock this slot.",
      );
      return;
    }
    const url = buildSquareUrl({
      sessionTypeSlug: selectedType.slug,
      startsAt: selectedTs,
      email: user?.email ?? null,
      notes,
      utmSource: utm?.source ?? null,
    });
    window.location.href = url;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="mb-8">
            <p className="label-mono text-lab-red mb-2">// BOOK A SESSION</p>
            <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight leading-[0.9]">
              Lock<br />Your Slot
            </h1>
          </div>

          <Stepper step={step} />

          {step === 1 && (
            <SessionTypeGrid types={sessionTypes} onSelect={onTypeSelect} />
          )}

          {step === 2 && selectedType && (
            <DateAndSlotPicker
              date={date}
              setDate={setDate}
              slotsData={slotsData}
              loading={false}
              selectedTs={selectedTs}
              setSelectedTs={setSelectedTs}
              onContinue={next}
              onBack={back}
              type={selectedType}
            />
          )}

          {step === 3 && selectedType && selectedTs && (
            <ReviewPay
              type={selectedType}
              startsAt={selectedTs}
              notes={notes}
              setNotes={setNotes}
              waiverAccepted={waiverAccepted}
              setWaiverAccepted={setWaiverAccepted}
              onBack={back}
              onConfirm={onConfirm}
              error={error}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Session", "Time", "Pay"];
  return (
    <div className="flex items-center gap-2 mb-10 overflow-x-auto" data-testid="booking-stepper">
      {items.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center label-mono text-xs ${
              done ? "bg-lab-red text-white" : active ? "bg-white text-black" : "bg-white/10 text-white/40"
            }`}>
              {done ? <Check className="w-4 h-4" /> : n}
            </div>
            <span className={`label-mono text-xs ${active ? "text-white" : "text-white/40"}`}>{label}</span>
            {i < items.length - 1 && <span className="w-8 h-px bg-white/15" />}
          </div>
        );
      })}
    </div>
  );
}

function SessionTypeGrid({ types, onSelect }: { types: SessionType[]; onSelect: (id: number) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className="text-left group bg-white/5 border border-white/10 hover:border-lab-red rounded overflow-hidden transition-colors"
          data-testid={`button-session-type-${t.slug}`}
        >
          <div className="aspect-[4/3] overflow-hidden bg-black">
            <img src={imageFor(t.imageKey)} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-5">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h3 className="font-archivo text-xl uppercase tracking-tight">{t.name}</h3>
              <p className="font-display text-2xl text-lab-red">{money(t.priceCents, { zeroLabel: "Inquire" })}</p>
            </div>
            <p className="label-mono text-white/40 mb-3">{t.durationMin} MIN · CAP {t.capacity}</p>
            <p className="text-sm text-white/70 mb-4">{t.tagline}</p>
            <div className="flex items-center label-mono text-white group-hover:text-lab-red">
              CHOOSE <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function DateAndSlotPicker({
  date, setDate, slotsData, loading, selectedTs, setSelectedTs, onContinue, onBack, type
}: {
  date: string; setDate: (s: string) => void;
  slotsData: SlotsResponse | undefined; loading: boolean;
  selectedTs: number | null; setSelectedTs: (n: number | null) => void;
  onContinue: () => void; onBack: () => void;
  type: SessionType;
}) {
  const days = useMemo(() => {
    const out: { iso: string; label: string; weekday: string; isToday: boolean; closed: boolean }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getTime() + i * 86400000);
      const dow = d.getDay();
      out.push({
        iso: isoDate(d),
        label: String(d.getDate()),
        weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        isToday: i === 0,
        closed: dow === 0 || dow === 3,
      });
    }
    return out;
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <h2 className="font-archivo text-2xl uppercase mb-1">{type.name}</h2>
        <p className="label-mono text-white/40 mb-6">{type.durationMin} MIN · {money(type.priceCents, { zeroLabel: "Inquire" })}</p>

        <div className="mb-6">
          <p className="label-mono text-white/50 mb-3 flex items-center gap-2">
            <CalIcon className="w-4 h-4" /> PICK A DAY
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2" data-testid="date-picker">
            {days.map((d) => (
              <button
                key={d.iso}
                onClick={() => { setDate(d.iso); setSelectedTs(null); }}
                disabled={d.closed}
                className={`flex-shrink-0 w-16 py-3 rounded text-center transition-colors ${
                  d.iso === date ? "bg-lab-red text-white" :
                  d.closed ? "bg-white/5 text-white/20 cursor-not-allowed" :
                  "bg-white/5 hover:bg-white/10 text-white"
                }`}
                data-testid={`button-date-${d.iso}`}
              >
                <p className="label-mono text-[10px]">{d.weekday}</p>
                <p className="font-archivo text-2xl leading-none mt-1">{d.label}</p>
                {d.closed && <p className="text-[9px] text-white/40 mt-1">CLOSED</p>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-mono text-white/50 mb-3">AVAILABLE SLOTS</p>
          {loading && <p className="label-mono text-white/40">Loading…</p>}
          {!loading && slotsData && slotsData.slots.length === 0 && (
            <div className="border border-white/10 bg-white/5 rounded p-8 text-center" data-testid="empty-slots">
              <p className="label-mono text-white/50 mb-2">NO SLOTS</p>
              <p className="text-white/70 text-sm">No more times available on {fmtDate(new Date(date).getTime())}. Try another day.</p>
            </div>
          )}
          {!loading && slotsData && slotsData.slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2" data-testid="slot-grid">
              {slotsData.slots.map((s) => (
                <button
                  key={s.ts}
                  onClick={() => setSelectedTs(s.ts)}
                  className={`py-3 rounded label-mono transition-colors ${
                    selectedTs === s.ts ? "bg-lab-red text-white" : "bg-white/5 hover:bg-white/10 text-white"
                  }`}
                  data-testid={`button-slot-${s.ts}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="border border-white/10 bg-white/5 rounded p-6 h-fit lg:sticky lg:top-24" data-testid="booking-summary">
        <p className="label-mono text-lab-red mb-3">// SUMMARY</p>
        <h3 className="font-archivo text-lg mb-4">{type.name}</h3>
        <dl className="space-y-3 text-sm mb-6">
          <div className="flex justify-between"><dt className="text-white/50">Duration</dt><dd>{type.durationMin} min</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Date</dt><dd>{fmtDate(new Date(date).getTime())}</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Time</dt><dd>{selectedTs ? new Date(selectedTs).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "-"}</dd></div>
          <div className="flex justify-between border-t border-white/10 pt-3"><dt>Total</dt><dd className="font-archivo text-lab-red">{money(type.priceCents, { zeroLabel: "Inquire" })}</dd></div>
        </dl>
        <button
          disabled={!selectedTs}
          onClick={onContinue}
          className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="button-continue"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onBack} className="w-full mt-3 label-mono text-white/50 hover:text-white py-2" data-testid="button-back">← Change session type</button>
      </aside>
    </div>
  );
}

function ReviewPay({
  type, startsAt, notes, setNotes, waiverAccepted, setWaiverAccepted, onBack, onConfirm, error,
}: {
  type: SessionType;
  startsAt: number;
  notes: string;
  setNotes: (s: string) => void;
  waiverAccepted: boolean;
  setWaiverAccepted: (v: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
  error: string | null;
}) {
  const isInquiry = type.priceCents === 0;
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div className="space-y-8">
        <div className="border border-white/10 bg-white/5 rounded p-6">
          <p className="label-mono text-lab-red mb-2">// CONFIRM</p>
          <h2 className="font-archivo text-2xl uppercase mb-1">{type.name}</h2>
          <p className="label-mono text-white/50">{fmtDateTime(startsAt)} · {type.durationMin} MIN</p>
        </div>

        <div>
          <label className="label-mono text-white/50 mb-2 block">Anything we should know? <span className="text-white/30">(injuries, goals, focus)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/15 px-4 py-3 rounded text-white focus:border-lab-red focus:outline-none"
            placeholder="Optional notes for the coach…"
            data-testid="input-notes"
          />
        </div>

        {/* Liability waiver checkbox. P2. Required before "Lock it in". */}
        <label
          className={`flex gap-3 items-start border rounded p-5 cursor-pointer transition-colors ${
            waiverAccepted ? "border-lab-red/60 bg-lab-red/5" : "border-white/15 bg-white/5"
          }`}
          data-testid="waiver-acknowledge"
        >
          <input
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => setWaiverAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 accent-lab-red"
            data-testid="checkbox-waiver"
          />
          <span className="text-sm text-white/85">
            I have read and agree to the <a href="/lab909-waiver.pdf" target="_blank" rel="noopener" className="text-lab-red underline">Liability Waiver &amp; Release</a>, the <Link href="/terms" className="text-lab-red underline">Terms of Service</Link>, and the <Link href="/privacy" className="text-lab-red underline">Privacy Policy</Link>. I understand training carries risk of injury and I am physically able to participate.
          </span>
        </label>

        {isInquiry && (
          <div className="border border-white/10 bg-white/5 rounded p-6">
            <p className="label-mono text-lab-red mb-1">// QUOTE REQUEST</p>
            <p className="text-white/70 text-sm">This session is priced per group, location, and program length. Hit “Request quote” to email the coach. We’ll respond within 24 hours with a price and confirm the slot.</p>
          </div>
        )}

        {!isInquiry && (
          <div className="border border-white/10 bg-white/5 rounded p-6">
            <p className="label-mono text-white/50 mb-1">PAYMENT</p>
            <p className="text-white/70 text-sm">Hitting “Lock it in” sends you to our secure Square checkout. Your slot is reserved when the payment clears.</p>
          </div>
        )}

        {error && <p className="text-lab-red text-sm" data-testid="text-error">{error}</p>}
      </div>

      <aside className="border border-white/10 bg-white/5 rounded p-6 h-fit lg:sticky lg:top-24">
        <p className="label-mono text-lab-red mb-3">// TOTAL</p>
        <dl className="space-y-3 text-sm mb-6">
          <div className="flex justify-between"><dt className="text-white/50">{type.name}</dt><dd>{money(type.priceCents, { zeroLabel: "Inquire" })}</dd></div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg"><dt className="font-archivo uppercase">Total</dt><dd className="font-archivo text-lab-red">{money(type.priceCents, { zeroLabel: "Inquire" })}</dd></div>
        </dl>
        <button
          onClick={onConfirm}
          disabled={!waiverAccepted}
          className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="button-confirm"
        >
          {isInquiry ? "Request quote" : "Lock it in"} <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onBack} className="w-full mt-3 label-mono text-white/50 hover:text-white py-2" data-testid="button-back">← Change time</button>
      </aside>
    </div>
  );
}

function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 86400000);
}
