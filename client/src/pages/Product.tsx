import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { money } from "@/lib/format";
import { imageFor } from "@/lib/images";
import { useCart } from "@/lib/cart";
import type { Product } from "@shared/schema";
import { ArrowRight, Minus, Plus, Check } from "lucide-react";

type Variant = { name: string; sku: string; stock: number };

export default function ProductPage() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug ?? "";
  const { add } = useCart();
  const [variantName, setVariantName] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [subscribeSave, setSubscribeSave] = useState(false);
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const variants = useMemo<Variant[]>(() => {
    if (!product) return [];
    try { return JSON.parse(product.variantsJson); } catch { return []; }
  }, [product]);

  // auto-pick first variant if none chosen
  const activeVariant = variantName ?? variants[0]?.name ?? "Default";

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    if (subscribeSave && product.subscribeSavePct) {
      return Math.round(product.priceCents * (100 - product.subscribeSavePct) / 100);
    }
    return product.priceCents;
  }, [product, subscribeSave]);

  function onAdd() {
    if (!product) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageKey: product.imageKey,
      variant: activeVariant,
      qty,
      basePriceCents: product.priceCents,
      subscribeSave,
      subscribeSavePct: product.subscribeSavePct,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (isLoading) {
    return <Layout><div className="pt-32 pb-16 text-center text-white/40 label-mono">LOADING…</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-32 pb-16 max-w-md mx-auto text-center px-6 text-white">
          <h1 className="font-display text-4xl uppercase mb-3">Product not found</h1>
          <Link href="/shop/apparel" className="label-mono text-lab-red">← Back to shop</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black text-white pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <Link href={`/shop/${product.category}`} className="label-mono text-white/50 hover:text-white inline-flex items-center mb-6" data-testid="link-back">
            ← Back to {product.category}
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <div className="bg-white/5 rounded overflow-hidden aspect-square">
              <img src={imageFor(product.imageKey)} alt={product.name} className="w-full h-full object-cover" data-testid="img-product" />
            </div>

            {/* Details */}
            <div>
              <p className="label-mono text-lab-red mb-2">// {product.subcategory.toUpperCase()}</p>
              <h1 className="font-display text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight mb-3" data-testid="text-product-name">{product.name}</h1>
              <p className="text-white/70 text-lg mb-6">{product.tagline}</p>

              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-5xl text-lab-red" data-testid="text-price">{money(displayPrice)}</span>
                {subscribeSave && product.subscribeSavePct && (
                  <span className="label-mono text-white/50 line-through">{money(product.priceCents)}</span>
                )}
              </div>

              {/* Variant picker */}
              {variants.length > 1 && (
                <div className="mb-6">
                  <p className="label-mono text-white/50 mb-3">{product.category === "apparel" ? "SIZE" : "FLAVOR"}</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.sku}
                        onClick={() => setVariantName(v.name)}
                        className={`label-mono px-4 py-2.5 border rounded transition-colors ${
                          activeVariant === v.name ? "bg-lab-red text-white border-lab-red" : "border-white/15 hover:border-white/40"
                        }`}
                        data-testid={`button-variant-${v.sku}`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty */}
              <div className="mb-6">
                <p className="label-mono text-white/50 mb-3">QUANTITY</p>
                <div className="inline-flex items-center border border-white/15 rounded">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-white/5" data-testid="button-qty-minus"><Minus className="w-4 h-4" /></button>
                  <span className="px-5 font-archivo" data-testid="text-qty">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="px-4 py-2.5 hover:bg-white/5" data-testid="button-qty-plus"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Subscribe & Save */}
              {product.subscribeSavePct && (
                <label className="flex items-start gap-3 mb-6 p-4 border border-white/15 rounded cursor-pointer hover:border-white/30">
                  <input
                    type="checkbox"
                    checked={subscribeSave}
                    onChange={(e) => setSubscribeSave(e.target.checked)}
                    className="mt-1 accent-lab-red w-4 h-4"
                    data-testid="input-subscribe"
                  />
                  <div className="flex-1">
                    <p className="font-archivo uppercase text-sm">Subscribe & save {product.subscribeSavePct}%</p>
                    <p className="text-white/50 text-xs mt-1">Ships every 30 days. Cancel anytime. Saves {money(Math.round(product.priceCents * product.subscribeSavePct / 100))} per shipment.</p>
                  </div>
                </label>
              )}

              <button
                onClick={onAdd}
                className="w-full bg-lab-red text-white font-archivo uppercase tracking-wider py-4 rounded thrust hover:bg-white hover:text-lab-red flex items-center justify-center gap-2"
                data-testid="button-add-cart"
              >
                {added ? <><Check className="w-5 h-5" /> Added to cart</> : <>Add to cart · {money(displayPrice * qty)} <ArrowRight className="w-4 h-4" /></>}
              </button>

              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="label-mono text-white/50 mb-3">ABOUT</p>
                <p className="text-white/80 text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
