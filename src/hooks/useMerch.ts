import { useEffect, useState } from 'react';
import type { MerchProduct } from '@/models';
import { services } from '@/services';
import { cartCount, useCart } from '@/store/cart';
import { useLang } from './useLang';

/** Atributikos katalogas (persikrauna pakeitus kalbą). */
export function useMerchProducts() {
  const lang = useLang();
  const [state, setState] = useState<{ lang: string; products: MerchProduct[] } | null>(null);
  useEffect(() => {
    let alive = true;
    services.merch.listProducts().then((products) => alive && setState({ lang, products }));
    return () => {
      alive = false;
    };
  }, [lang]);
  return state?.products ?? [];
}

/** Krepšelio eilutės su prekėmis ir suma. */
export function useCartSummary(products: MerchProduct[]) {
  const lines = useCart((s) => s.lines);
  const rows = lines
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.productId) }))
    .filter((r): r is typeof r & { product: MerchProduct } => !!r.product);
  const total = Math.round(rows.reduce((a, r) => a + r.product.price * r.qty, 0) * 100) / 100;
  return { rows, total, count: cartCount(lines) };
}
