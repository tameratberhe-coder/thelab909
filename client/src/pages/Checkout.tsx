import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useCart, unitCents } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { money } from "@/lib/format";
import { imageFor } from "@/lib/images";
import { MockCardForm, isValidCard, type CardForm } from "@/components/MockCardForm";
import { ArrowRight, Check } from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { items, subtotalCents, clear } = useCart();
  const shipping = subtotalCents >= 7500 ? 0 : 795;
  const tax = Math.round(subtotalCents * 0.0875);
  const total = subtotalCents + shipping + tax;

  const [ship, setShip] = useState({ name: "", address: "", city: "", state: "", zip: "" });
  const [card, setCard] = useState<CardForm>({ number: "", expiry: "", cvc: "", zip: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  const orderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        items: items.map((it) => ({ productId: it.productId, variant: it.variant, qty: it.qty, subscribeSave: it.subscribeSave })),
        ship,
        sourceId: "cnon:demo",
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmedOrderId(data.order.id);
      clear();
      queryClient.invalidateQueries({ queryKey: ["/api/orders/me"] });
    },
    onError: (e: any) => setError(e?.message ?? "Order failed"),
  });

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) { navigate("/login"); return; }
    if (!ship.name || !ship.address || !ship.city || !ship.state || !ship.zip) { setError("Complete shipping address"); return; }
    if (!isValidCard(card)) { setError("Complete card details"); return; }
    orderMutation.mutate();
  }

  if (confirmedOrderId !== null) {
    return (
      <Layout>
        <div className="bg-black text-white pt-28 pb-16 min-h-screen">
          <div className="max-w-2xl mx-auto px-6">
            <div className="border-2 border-lab-red bg-lab-red/10 rounded p-8" data-testid="order-confirmation">
              <div className="w-14 h-14 bg-lab-red rounded-full flex items-center justify-center mb-5">
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <p className="label-mono text-lab-red mb-2">// ORDER PLACED</p>
              <h1 className="font-display text-5xl sm:text-6xl uppercase leading-none tracking-tight mb-3">Locked.<br />Loaded.</h1>
              <p className="text-white/80 mb-6">Order #{confirmedOrderId} · A confirmation will be on its way.</p>
              <div className="flex gap-3">
                <Link href="/account" className="bg-white text-black font-archivo uppercase tracking-wider px-6 py-3 rounded thrust hover:bg-lab-red hover:text-white">My orders</Link>
                <Link href="/shop/apparel" className="border border-white/30 px-6 py-3 rounded label-mono hover:border-white">Keep shopping</Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="bg-black text-white pt-32 pb-16 min-h-screen text-center px-6">
          <h1 className="font-display text-4xl uppercase mb-3">Your bag is empty</h1>
          <Link href="/shop/apparel" className="label-mono text-lab-red">← Shop apparel</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black text-white pt-28 pb-16 min-h-screen">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
          <p className="label-mono text-lab-red mb-3">// CHECKOUT</p>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.85] tracking-tight mb-10">Checkout</h1>

          {!user && (
            <div className="border border-lab-red/40 bg-lab-red/10 p-4 rounded text-sm mb-6" data-testid="auth-banner">
              <p className="label-mono text-lab-red mb-1">SIGN IN REQUIRED</p>
              <p>You need to <Link href="/login" className="underline">sign in</Link> or <Link href="/signup" className="underline">create an account</Link> to place an order.</p>
            </div>
          )}

          <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_360px] gap-10" data-testid="form-checkout">
            <div className="space-y-8">
              <section className="border border-white/10 bg-white/5 rounded p-6">
                <p className="label-mono text-white/50 mb-4">SHIPPING</p>
                <div className="space-y-3">
                  <Field label="Full name" value={ship.name} onChange={(v) => setShip({ ...ship, name: v })} testId="input-ship-name" required />
                  <Field label="Address" value={ship.address} onChange={(v) => setShip({ ...ship, address: v })} testId="input-ship-address" required />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field label="City" value={ship.city} onChange={(v) => setShip({ ...ship, city: v })} testId="input-ship-city" required />
                    <Field label="State" value={ship.state} onChange={(v) => setShip({ ...ship, state: v.toUpperCase() })} maxLength={2} testId="input-ship-state" required />
                    <Field label="ZIP" value={ship.zip} onChange={(v) => setShip({ ...ship, zip: v })} testId="input-ship-zip" required />
                  </div>
                </div>
              </section>

              <section className="border border-white/10 bg-white/5 rounded p-6">
                <p className="label-mono text-white/50 mb-4">PAYMENT</p>
                <MockCardForm value={card} onChange={setCard} disabled={orderMutation.isPending} />
              </section>

              {error && <p className="text-lab-red text-sm" data-testid="text-error">{error}</p>}
            </div>

            <aside className="border border-white/10 bg-white/5 rounded p-6 h-fit lg:sticky lg:top-24">
              <p className="label-mono text-lab-red mb-4">// ORDER</p>
              <ul className="space-y-3 mb-5 max-h-72 overflow-y-auto">
                {items.map((it) => (
                  <li key={`${it.productId}::${it.variant}`} className="flex gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded overflow-hidden flex-shrink-0">
                      <img src={imageFor(it.imageKey)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-archivo uppercase truncate">{it.name}</p>
                      <p className="text-white/40">{it.variant} · QTY {it.qty}</p>
                    </div>
                    <p className="text-xs font-mono">{money(unitCents(it) * it.qty)}</p>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 text-sm mb-5 border-t border-white/10 pt-4">
                <div className="flex justify-between"><dt className="text-white/50">Subtotal</dt><dd>{money(subtotalCents)}</dd></div>
                <div className="flex justify-between"><dt className="text-white/50">Shipping</dt><dd>{shipping === 0 ? <span className="text-lab-red">FREE</span> : money(shipping)}</dd></div>
                <div className="flex justify-between"><dt className="text-white/50">Tax</dt><dd>{money(tax)}</dd></div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base"><dt className="font-archivo uppercase">Total</dt><dd className="font-archivo text-lab-red">{money(total)}</dd></div>
              </dl>
              <button
                type="submit"
                disabled={orderMutation.isPending}
                className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="button-place-order"
              >
                {orderMutation.isPending ? "Placing…" : `Place order · ${money(total)}`} <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/cart" className="block text-center mt-3 label-mono text-white/50 hover:text-white py-2">← Back to cart</Link>
            </aside>
          </form>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, value, onChange, testId, maxLength, required }: { label: string; value: string; onChange: (v: string) => void; testId: string; maxLength?: number; required?: boolean }) {
  return (
    <div>
      <label className="label-mono text-white/50 mb-1.5 block">{label}</label>
      <input
        type="text"
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/15 px-4 py-2.5 rounded text-white focus:border-lab-red focus:outline-none"
        data-testid={testId}
      />
    </div>
  );
}
