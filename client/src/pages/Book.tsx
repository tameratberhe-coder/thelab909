import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { money, fmtDate, fmtDateTime, isoDate } from "@/lib/format";
import { imageFor } from "@/lib/images";
import { MockCardForm, isValidCard, type CardForm } from "@/components/MockCardForm";
import type { SessionType } from "@shared/schema";
import { ArrowRight, Check, Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";

type SlotsResponse = { date: string; dow: number; slots: { ts: number; label: string }[] };

export default function Book() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [date, setDate] = useState<string>(isoDate(addDays(new Date(), 1)));
  const [selectedTs, setSelectedTs] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvc: "", zip: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ booking: any; sessionType: SessionType } | null>(null);

  const { data: sessionTypes = [] } = useQuery<SessionType[]>({ queryKey: ["/api/session-types"] });
  const selectedType = sessionTypes.find((t) => t.id === selectedTypeId) ?? null;

  const slotsQuery = useQuery<SlotsResponse>({
    queryKey: ["/api/slots", date],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/slots?date=${date}`);
      return res.json();
    },
    enabled: step === 2,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!selectedType || !selectedTs) throw new Error("Missing info");
      const res = await apiRequest("POST", "/api/bookings", {
        sessionTypeId: selectedType.id,
        startsAt: selectedTs,
        endsAt: selectedTs + selectedType.durationMin * 60_000,
        amountCents: selectedType.priceCents,
        userId: user?.id ?? 0,
        notes: notes || undefined,
        sourceId: "cnon:card-nonce-demo",
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmed(data);
      setStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/me"] });
    },
    onError: (e: any) => setError(e?.message ?? "Booking failed"),
  });

  function next() { setError(null); setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s)); }
  function back() { setError(null); setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s)); }

  function onTypeSelect(id: number) {
    setSelectedTypeId(id);
    next();
  }

  async function onConfirm() {
    setError(null);
    if (!user) { navigate("/login"); return; }
    if (selectedType && selectedType.priceCents > 0 && !isValidCard(card)) {
      setError("Please complete the payment fields.");
      return;
    }
    bookMutation.mutate();
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
              slotsData={slotsQuery.data}
              loading={slotsQuery.isLoading}
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
              card={card}
              setCard={setCard}
              user={user}
              onBack={back}
              onConfirm={onConfirm}
              error={error}
              busy={bookMutation.isPending}
            />
          )}

          {step === 4 && confirmed && (
            <Confirmation booking={confirmed.booking} type={confirmed.sessionType} />
          )}
        </div>
      </div>
    </Layout>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const items = ["Session", "Time", "Pay", "Locked"];
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
              <p className="font-display text-2xl text-lab-red">{money(t.priceCents, { hideZero: true })}</p>
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
        closed: dow === 0,
      });
    }
    return out;
  }, []);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <h2 className="font-archivo text-2xl uppercase mb-1">{type.name}</h2>
        <p className="label-mono text-white/40 mb-6">{type.durationMin} MIN · {money(type.priceCents, { hideZero: true })}</p>

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
          <div className="flex justify-between"><dt className="text-white/50">Time</dt><dd>{selectedTs ? new Date(selectedTs).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"}</dd></div>
          <div className="flex justify-between border-t border-white/10 pt-3"><dt>Total</dt><dd className="font-archivo text-lab-red">{money(type.priceCents, { hideZero: true })}</dd></div>
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
  type, startsAt, notes, setNotes, card, setCard, user, onBack, onConfirm, error, busy
}: any) {
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

        {!user && (
          <div className="border border-lab-red/40 bg-lab-red/10 p-4 rounded text-sm">
            <p className="label-mono text-lab-red mb-1">SIGN IN REQUIRED</p>
            <p>You need to <Link href="/login" className="underline">sign in</Link> or <Link href="/signup" className="underline">create an account</Link> to lock your slot.</p>
          </div>
        )}

        {user && type.priceCents > 0 && (
          <div className="border border-white/10 bg-white/5 rounded p-6">
            <p className="label-mono text-white/50 mb-4">PAYMENT</p>
            <MockCardForm value={card} onChange={setCard} disabled={busy} />
          </div>
        )}

        {user && type.priceCents === 0 && (
          <div className="border border-white/10 bg-white/5 rounded p-6">
            <p className="label-mono text-lab-red mb-1">// FREE</p>
            <p className="text-white/70 text-sm">No payment needed for the consultation. Lock it in below.</p>
          </div>
        )}

        {error && <p className="text-lab-red text-sm" data-testid="text-error">{error}</p>}
      </div>

      <aside className="border border-white/10 bg-white/5 rounded p-6 h-fit lg:sticky lg:top-24">
        <p className="label-mono text-lab-red mb-3">// TOTAL</p>
        <dl className="space-y-3 text-sm mb-6">
          <div className="flex justify-between"><dt className="text-white/50">{type.name}</dt><dd>{money(type.priceCents, { hideZero: true })}</dd></div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg"><dt className="font-archivo uppercase">Total</dt><dd className="font-archivo text-lab-red">{money(type.priceCents, { hideZero: true })}</dd></div>
        </dl>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red disabled:opacity-50 flex items-center justify-center gap-2"
          data-testid="button-confirm"
        >
          {busy ? "Locking…" : "Lock it in"} <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onBack} className="w-full mt-3 label-mono text-white/50 hover:text-white py-2" data-testid="button-back">← Change time</button>
      </aside>
    </div>
  );
}

function Confirmation({ booking, type }: { booking: any; type: SessionType }) {
  return (
    <div className="max-w-2xl">
      <div className="border-2 border-lab-red bg-lab-red/10 rounded p-8" data-testid="booking-confirmation">
        <div className="w-14 h-14 bg-lab-red rounded-full flex items-center justify-center mb-5">
          <Check className="w-7 h-7 text-white" strokeWidth={3} />
        </div>
        <p className="label-mono text-lab-red mb-2">// LOCKED IN</p>
        <h2 className="font-display text-4xl sm:text-6xl uppercase leading-none tracking-tight mb-4">
          You're In.
        </h2>
        <p className="text-white/80 mb-6">
          {type.name} · {fmtDateTime(booking.startsAt)}
        </p>
        <dl className="space-y-2 text-sm border-t border-white/10 pt-4 mb-8">
          <div className="flex justify-between"><dt className="text-white/50">Booking ID</dt><dd className="font-mono">#{booking.id}</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Duration</dt><dd>{type.durationMin} min</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Charged</dt><dd>{money(booking.amountCents, { hideZero: true })}</dd></div>
          {booking.paymentId && <div className="flex justify-between"><dt className="text-white/50">Payment</dt><dd className="font-mono text-xs">{booking.paymentId.slice(0, 24)}…</dd></div>}
        </dl>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account" className="bg-white text-black font-archivo uppercase tracking-wider px-6 py-3 rounded thrust hover:bg-lab-red hover:text-white text-center" data-testid="link-account">
            View my bookings
          </Link>
          <Link href="/" className="border border-white/30 px-6 py-3 rounded label-mono hover:border-white text-center">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 86400000);
}
