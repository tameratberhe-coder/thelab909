import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useCart, unitCents } from "@/lib/cart";
import { money } from "@/lib/format";
import { imageFor } from "@/lib/images";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, setQty, remove, toggleSubscribe, subtotalCents } = useCart();
  const shipping = subtotalCents >= 7500 ? 0 : 795;
  const tax = Math.round(subtotalCents * 0.0875);
  const total = subtotalCents + shipping + tax;

  return (
    <Layout>
      <div className="bg-black text-white min-h-screen pt-28 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <p className="label-mono text-lab-red mb-3">// CART</p>
          <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.85] tracking-tight mb-8">Your Bag</h1>

          {items.length === 0 ? (
            <div className="border border-white/10 bg-white/5 rounded p-12 text-center" data-testid="empty-cart">
              <ShoppingBag className="w-12 h-12 mx-auto text-white/30 mb-4" />
              <h3 className="font-archivo text-xl uppercase mb-2">Your bag is empty</h3>
              <p className="text-white/60 mb-6">Pick up some gear or grab a supplement.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/shop/apparel" className="bg-lab-red text-white font-archivo uppercase tracking-wider px-6 py-3 rounded thrust hover:bg-white hover:text-lab-red">Shop apparel</Link>
                <Link href="/shop/supplements" className="border border-white/30 px-6 py-3 rounded label-mono hover:border-white">Shop supplements</Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_360px] gap-10">
              <div className="space-y-4" data-testid="cart-items">
                {items.map((it) => (
                  <div key={`${it.productId}::${it.variant}`} className="flex gap-4 p-4 border border-white/10 bg-white/5 rounded" data-testid={`cart-item-${it.productId}-${it.variant}`}>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-white/5 rounded overflow-hidden">
                      <img src={imageFor(it.imageKey)} alt={it.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/product/${it.slug}`} className="font-archivo text-base sm:text-lg uppercase hover:text-lab-red truncate" data-testid="link-product">{it.name}</Link>
                        <button onClick={() => remove(it.productId, it.variant)} className="text-white/40 hover:text-lab-red" aria-label="Remove" data-testid="button-remove"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="label-mono text-white/40 mb-3">{it.variant}{it.subscribeSave && ` · SUB & SAVE ${it.subscribeSavePct}%`}</p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="inline-flex items-center border border-white/15 rounded text-sm">
                          <button onClick={() => setQty(it.productId, it.variant, it.qty - 1)} className="px-3 py-1.5 hover:bg-white/5"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="px-3 font-archivo">{it.qty}</span>
                          <button onClick={() => setQty(it.productId, it.variant, it.qty + 1)} className="px-3 py-1.5 hover:bg-white/5"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="text-right">
                          <p className="font-archivo">{money(unitCents(it) * it.qty)}</p>
                          {it.qty > 1 && <p className="label-mono text-white/40 text-[10px]">{money(unitCents(it))} EA</p>}
                        </div>
                      </div>
                      {it.subscribeSavePct && (
                        <label className="flex items-center gap-2 mt-3 text-xs text-white/60 cursor-pointer">
                          <input type="checkbox" checked={it.subscribeSave} onChange={() => toggleSubscribe(it.productId, it.variant)} className="accent-lab-red" />
                          Subscribe & save {it.subscribeSavePct}%
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <aside className="border border-white/10 bg-white/5 rounded p-6 h-fit lg:sticky lg:top-24" data-testid="cart-summary">
                <p className="label-mono text-lab-red mb-4">// ORDER</p>
                <dl className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between"><dt className="text-white/50">Subtotal</dt><dd>{money(subtotalCents)}</dd></div>
                  <div className="flex justify-between"><dt className="text-white/50">Shipping</dt><dd>{shipping === 0 ? <span className="text-lab-red">FREE</span> : money(shipping)}</dd></div>
                  <div className="flex justify-between"><dt className="text-white/50">Tax (8.75%)</dt><dd>{money(tax)}</dd></div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg"><dt className="font-archivo uppercase">Total</dt><dd className="font-archivo text-lab-red">{money(total)}</dd></div>
                </dl>
                {subtotalCents < 7500 && (
                  <p className="label-mono text-white/40 text-[10px] mb-4">SPEND {money(7500 - subtotalCents)} MORE FOR FREE SHIPPING</p>
                )}
                <Link
                  href="/checkout"
                  className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-3 rounded thrust hover:bg-white hover:text-lab-red flex items-center justify-center gap-2"
                  data-testid="button-checkout"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/shop/apparel" className="block text-center mt-3 label-mono text-white/50 hover:text-white py-2">← Continue shopping</Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
