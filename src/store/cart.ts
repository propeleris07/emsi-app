import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/models';
import { persistStorage } from './storage';

interface CartState {
  lines: CartLine[];
  add: (productId: string, size: string | undefined, qty: number) => void;
  setQty: (productId: string, size: string | undefined, qty: number) => void;
  clear: () => void;
}

const same = (l: CartLine, productId: string, size?: string) => l.productId === productId && l.size === size;

/** Atributikos krepšelis (išsaugomas telefone). */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, size, qty) =>
        set((s) =>
          s.lines.some((l) => same(l, productId, size))
            ? { lines: s.lines.map((l) => (same(l, productId, size) ? { ...l, qty: Math.min(l.qty + qty, 20) } : l)) }
            : { lines: [...s.lines, { productId, size, qty }] },
        ),
      setQty: (productId, size, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => !same(l, productId, size)) : s.lines.map((l) => (same(l, productId, size) ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'emsi.cart', storage: persistStorage },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty, 0);
