import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  imageKey: string;
  variant: string;
  qty: number;
  basePriceCents: number; // canonical (non-discounted)
  subscribeSave: boolean;
  subscribeSavePct?: number | null;
};

type CartCtx = {
  items: CartItem[];
  add: (it: CartItem) => void;
  remove: (productId: number, variant: string) => void;
  setQty: (productId: number, variant: string, qty: number) => void;
  toggleSubscribe: (productId: number, variant: string) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
};

const Ctx = createContext<CartCtx | null>(null);

function lineCents(it: CartItem): number {
  if (it.subscribeSave && it.subscribeSavePct) {
    return Math.round(it.basePriceCents * (100 - it.subscribeSavePct) / 100);
  }
  return it.basePriceCents;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((it: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === it.productId && x.variant === it.variant);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + it.qty };
        return next;
      }
      return [...prev, it];
    });
  }, []);

  const remove = useCallback((productId: number, variant: string) => {
    setItems((prev) => prev.filter((x) => !(x.productId === productId && x.variant === variant)));
  }, []);

  const setQty = useCallback((productId: number, variant: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((x) => !(x.productId === productId && x.variant === variant)));
      return;
    }
    setItems((prev) => prev.map((x) => (x.productId === productId && x.variant === variant ? { ...x, qty } : x)));
  }, []);

  const toggleSubscribe = useCallback((productId: number, variant: string) => {
    setItems((prev) => prev.map((x) => {
      if (x.productId !== productId || x.variant !== variant) return x;
      if (!x.subscribeSavePct) return x;
      return { ...x, subscribeSave: !x.subscribeSave };
    }));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const subtotalCents = useMemo(() => items.reduce((s, x) => s + lineCents(x) * x.qty, 0), [items]);

  return <Ctx.Provider value={{ items, add, remove, setQty, toggleSubscribe, clear, count, subtotalCents }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}

export function unitCents(it: CartItem): number {
  return lineCents(it);
}
