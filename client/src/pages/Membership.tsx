import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { money, fmtDate } from "@/lib/format";
import { MockCardForm, isValidCard, type CardForm } from "@/components/MockCardForm";
import type { MembershipPlan, Membership } from "@shared/schema";
import { Check, ArrowRight, X } from "lucide-react";

export default function MembershipPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvc: "", zip: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ membership: Membership; plan: MembershipPlan } | null>(null);

  const { data: plans = [] } = useQuery<MembershipPlan[]>({ queryKey: ["/api/plans"] });
  const { data: meData } = useQuery<{ membership: Membership | null; plan?: MembershipPlan }>({
    queryKey: ["/api/membership/me"],
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest("POST", "/api/membership/subscribe", { planId, sourceId: "cnon:demo" });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmed(data);
      setSelectedPlanId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/membership/me"] });
    },
    onError: (e: any) => setError(e?.message ?? "Subscribe failed"),
  });

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  function onSelectPlan(plan: MembershipPlan) {
    setError(null);
    if (!user) { navigate("/login"); return; }
    if (plan.monthlyCents === 0) {
      // drop-in: just create membership without checkout
      subscribeMutation.mutate(plan.id);
      return;
    }
    setSelectedPlanId(plan.id);
  }

  function onConfirmSubscribe() {
    if (!selectedPlan) return;
    if (selectedPlan.monthlyCents > 0 && !isValidCard(card)) {
      setError("Please complete your card details.");
      return;
    }
    subscribeMutation.mutate(selectedPlan.id);
  }

  return (
    <Layout>
      <div className="bg-black text-white">
        {/* Hero */}
        <div className="pt-28 pb-12 max-w-[1400px] mx-auto px-4 sm:px-8">
          <p className="label-mono text-lab-red mb-3">// MEMBERSHIP</p>
          <h1 className="font-display text-6xl sm:text-8xl uppercase leading-[0.85] tracking-tight mb-4">
            Pick<br />Your Plan.
          </h1>
          <p className="text-white/60 max-w-2xl">No tricks. No gimmicks. Pick a tier, train consistently, and we'll be there every step.</p>
        </div>

        {meData?.membership && meData.plan && !confirmed && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-10">
            <div className="border border-lab-red/40 bg-lab-red/10 rounded p-6">
              <p className="label-mono text-lab-red mb-2">// CURRENT MEMBERSHIP</p>
              <h3 className="font-archivo text-2xl uppercase">{meData.plan.name}</h3>
              <p className="text-white/60 text-sm mt-1">Renews {fmtDate(meData.membership.renewsAt)} · {money(meData.plan.monthlyCents)}/mo</p>
            </div>
          </div>
        )}

        {/* Plan Grid */}
        {!confirmed && !selectedPlanId && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {plans.map((p) => {
                const perks: string[] = JSON.parse(p.perksJson);
                const isHighlight = !!p.highlight;
                return (
                  <div
                    key={p.id}
                    className={`relative rounded p-6 flex flex-col ${
                      isHighlight ? "bg-lab-red text-white border-2 border-lab-red" : "border border-white/15 bg-white/5"
                    }`}
                    data-testid={`card-plan-${p.slug}`}
                  >
                    {isHighlight && (
                      <span className="absolute -top-3 left-6 bg-white text-lab-red label-mono text-xs px-2 py-1 rounded">MOST POPULAR</span>
                    )}
                    <div className="mb-5">
                      <h3 className={`font-archivo text-xl uppercase ${isHighlight ? "text-white" : ""}`}>{p.name}</h3>
                      <p className={`text-sm mt-1 ${isHighlight ? "text-white/80" : "text-white/60"}`}>{p.tagline}</p>
                    </div>
                    <div className="mb-5">
                      {p.monthlyCents > 0 ? (
                        <>
                          <span className="font-display text-5xl">{money(p.monthlyCents)}</span>
                          <span className={`label-mono ml-1 ${isHighlight ? "text-white/80" : "text-white/50"}`}>/MO</span>
                        </>
                      ) : (
                        <span className="font-display text-4xl">No commitment</span>
                      )}
                    </div>
                    <ul className="space-y-2 mb-6 flex-1 text-sm">
                      {perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isHighlight ? "text-white" : "text-lab-red"}`} strokeWidth={3} />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onSelectPlan(p)}
                      disabled={subscribeMutation.isPending && subscribeMutation.variables === p.id}
                      className={`w-full font-archivo uppercase tracking-wider py-3 rounded thrust flex items-center justify-center gap-2 ${
                        isHighlight ? "bg-white text-lab-red hover:bg-black hover:text-white" : "bg-lab-red text-white hover:bg-white hover:text-lab-red"
                      }`}
                      data-testid={`button-select-${p.slug}`}
                    >
                      {meData?.membership?.planId === p.id ? "Current plan" : (p.monthlyCents === 0 ? "Get drop-in" : "Choose")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Checkout */}
        {!confirmed && selectedPlanId && selectedPlan && (
          <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-16">
            <button onClick={() => setSelectedPlanId(null)} className="label-mono text-white/50 hover:text-white mb-6">← Choose a different plan</button>
            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
              <div className="space-y-6">
                <div className="border border-white/10 bg-white/5 rounded p-6">
                  <p className="label-mono text-lab-red mb-2">// SUBSCRIBING TO</p>
                  <h2 className="font-archivo text-2xl uppercase mb-1">{selectedPlan.name}</h2>
                  <p className="text-white/60 text-sm">{selectedPlan.tagline}</p>
                </div>
                <div className="border border-white/10 bg-white/5 rounded p-6">
                  <p className="label-mono text-white/50 mb-4">PAYMENT</p>
                  <MockCardForm value={card} onChange={setCard} disabled={subscribeMutation.isPending} />
                </div>
                {error && <p className="text-lab-red text-sm" data-testid="text-error">{error}</p>}
              </div>
              <aside className="border border-white/10 bg-white/5 rounded p-6 h-fit">
                <p className="label-mono text-lab-red mb-3">// MONTHLY</p>
                <div className="font-display text-5xl text-lab-red mb-1">{money(selectedPlan.monthlyCents)}</div>
                <p className="label-mono text-white/40 mb-6">PER MONTH · CANCEL ANYTIME</p>
                <button
                  onClick={onConfirmSubscribe}
                  disabled={subscribeMutation.isPending}
                  className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="button-confirm"
                >
                  {subscribeMutation.isPending ? "Subscribing…" : "Subscribe"} <ArrowRight className="w-4 h-4" />
                </button>
              </aside>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {confirmed && (
          <div className="max-w-2xl mx-auto px-4 sm:px-8 pb-16">
            <div className="border-2 border-lab-red bg-lab-red/10 rounded p-8" data-testid="membership-confirmation">
              <div className="w-14 h-14 bg-lab-red rounded-full flex items-center justify-center mb-5">
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <p className="label-mono text-lab-red mb-2">// WELCOME TO {confirmed.plan.name.toUpperCase()}</p>
              <h2 className="font-display text-4xl sm:text-6xl uppercase leading-none tracking-tight mb-4">You're in.</h2>
              <p className="text-white/80 mb-6">Your membership is active. Renews {fmtDate(confirmed.membership.renewsAt)}.</p>
              <div className="flex gap-3">
                <Link href="/book" className="bg-white text-black font-archivo uppercase tracking-wider px-6 py-3 rounded thrust hover:bg-lab-red hover:text-white">Book a session</Link>
                <Link href="/account" className="border border-white/30 px-6 py-3 rounded label-mono hover:border-white">My account</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
