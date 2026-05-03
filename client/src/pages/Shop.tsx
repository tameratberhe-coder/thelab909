import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { money } from "@/lib/format";
import { imageFor } from "@/lib/images";
import type { Product } from "@shared/schema";
import { ArrowRight } from "lucide-react";

export default function Shop() {
  const [, params] = useRoute("/shop/:category");
  const category = params?.category ?? "apparel";
  const isApparel = category === "apparel";

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", category],
    queryFn: async () => {
      const res = await fetch(`/api/products?category=${category}`);
      return res.json();
    },
  });

  return (
    <Layout>
      <div className="bg-black text-white min-h-screen">
        {/* Hero */}
        <div className="pt-28 pb-10 max-w-[1400px] mx-auto px-4 sm:px-8">
          <p className="label-mono text-lab-red mb-3">// SHOP / {category.toUpperCase()}</p>
          <h1 className="font-display text-6xl sm:text-8xl uppercase leading-[0.85] tracking-tight mb-3">
            {isApparel ? <>The Drop.<br />Lab Issue.</> : <>Built<br />For Werk.</>}
          </h1>
          <p className="text-white/60 max-w-2xl">
            {isApparel ? "Heavyweight cotton. Built to be wrecked, washed, and worn again." : "Third-party tested. Coach-approved. Subscribe & save 15%."}
          </p>
        </div>

        {/* Category Toggle */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-8">
          <div className="inline-flex border border-white/15 rounded overflow-hidden">
            <Link href="/shop/apparel" className={`label-mono px-5 py-2.5 ${isApparel ? "bg-lab-red text-white" : "text-white/60 hover:text-white"}`} data-testid="tab-apparel">APPAREL</Link>
            <Link href="/shop/supplements" className={`label-mono px-5 py-2.5 ${!isApparel ? "bg-lab-red text-white" : "text-white/60 hover:text-white"}`} data-testid="tab-supplements">SUPPLEMENTS</Link>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-16">
          {isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded animate-pulse" />)}
            </div>
          )}
          {!isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" data-testid="product-grid">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group block"
      data-testid={`card-product-${p.slug}`}
    >
      <div className="aspect-square overflow-hidden bg-white/5 rounded mb-3 relative">
        <img src={imageFor(p.imageKey)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {p.subscribeSavePct && (
          <span className="absolute top-3 left-3 bg-lab-red text-white label-mono text-[10px] px-2 py-1 rounded">SUBSCRIBE & SAVE {p.subscribeSavePct}%</span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-archivo text-base uppercase tracking-tight group-hover:text-lab-red transition-colors">{p.name}</h3>
        <p className="font-archivo text-base">{money(p.priceCents)}</p>
      </div>
      <p className="label-mono text-white/40 mt-1">{p.tagline}</p>
      <span className="inline-flex items-center label-mono text-white/60 group-hover:text-lab-red mt-2">
        VIEW <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
      </span>
    </Link>
  );
}
