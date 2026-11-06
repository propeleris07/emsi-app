import type { FuelType, LineItem, Receipt, SavingsSummary, Station, Transaction, TransactionCategory } from '@/models';
import type { TransactionService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import { hashString, newId, seededRandom } from '@/utils/random';
import { formatPlate, round2 } from '@/utils/format';
import { VAT_RATE } from '@/utils/pricing';
import stationsJson from '@/data/stations.json';
import pricesJson from '@/data/prices.json';

const STATIONS = stationsJson as Station[];
const BASE = pricesJson.base as Record<FuelType, number>;

export const FUEL_NAMES_LT: Record<FuelType, string> = {
  '95': 'Benzinas 95',
  '98': 'Benzinas 98',
  D: 'Dyzelinas',
  LPG: 'SND (dujos)',
  ADBLUE: 'AdBlue',
};

const txKey = (userId: string) => `tx.${userId}`;

function item(name: string, qty: number, unit: LineItem['unit'], unitPrice: number, discountPct: number): LineItem {
  const gross = round2(qty * unitPrice);
  const discount = round2(gross * discountPct);
  return { name, qty, unit, unitPrice, discount, total: round2(gross - discount), vatRate: VAT_RATE };
}

export function makeTransaction(
  base: Omit<Transaction, 'subtotal' | 'discount' | 'total' | 'receiptId' | 'id'> & { id?: string },
): Transaction {
  const subtotal = round2(base.items.reduce((a, i) => a + i.qty * i.unitPrice, 0));
  const total = round2(base.items.reduce((a, i) => a + i.total, 0));
  const id = base.id ?? newId('tx');
  return { ...base, id, subtotal, total, discount: round2(subtotal - total), receiptId: `rcp_${id}` };
}

/** Demonstracinė ~5 mėnesių pirkimų istorija, kad statistika ir sutaupymai atrodytų tikroviškai. */
function seedHistory(userId: string): Transaction[] {
  const rnd = seededRandom(hashString(userId));
  const favorites = STATIONS.filter((s) => s.city === 'Vilnius');
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const out: Transaction[] = [];
  const now = new Date();

  let nextFuel = 2;
  for (let daysAgo = 150; daysAgo >= 1; daysAgo--) {
    const station = rnd() < 0.8 ? pick(favorites) : pick(STATIONS);
    const at = (h: number) => {
      const d = new Date(now);
      d.setDate(now.getDate() - daysAgo);
      d.setHours(h, Math.floor(rnd() * 60), 0, 0);
      return d.toISOString();
    };
    const common = { userId, stationId: station.id, stationName: station.name };

    // Kuras – reguliariai kas 6–9 dienas.
    if (--nextFuel <= 0) {
      nextFuel = 6 + Math.floor(rnd() * 4);
      const fuel: FuelType = rnd() < 0.7 ? '95' : 'D';
      const litres = round2(30 + rnd() * 25);
      const price = round2(BASE[fuel] + (rnd() - 0.5) * 0.08);
      const discountPerL = 0.03;
      const line: LineItem = {
        name: FUEL_NAMES_LT[fuel],
        qty: litres,
        unit: 'l',
        unitPrice: price,
        discount: round2(litres * discountPerL),
        total: round2(litres * (price - discountPerL)),
        vatRate: VAT_RATE,
      };
      out.push(
        makeTransaction({
          ...common,
          category: 'fuel',
          items: [line],
          paymentMethod: rnd() < 0.6 ? 'app' : 'cashier',
          paymentCardLast4: '4242',
          pumpNumber: 1 + Math.floor(rnd() * 6),
          createdAt: at(7 + Math.floor(rnd() * 13)),
        }),
      );
    }
    if (rnd() < 0.25) {
      const coffee = pick([
        ['Kava Americano (vidutinė)', 1.99],
        ['Kava Latte (didelė)', 2.79],
        ['Kava Cappuccino (vidutinė)', 2.49],
      ] as const);
      out.push(
        makeTransaction({
          ...common,
          category: 'coffee',
          items: [item(coffee[0], 1, 'pcs', coffee[1], 0.1)],
          paymentMethod: 'cashier',
          createdAt: at(7 + Math.floor(rnd() * 4)),
        }),
      );
    }
    if (rnd() < 0.06) {
      out.push(
        makeTransaction({
          ...common,
          category: 'food',
          items: [item('Dešrainis', 1, 'pcs', 2.49, 0.1), item('Gaivusis gėrimas 0,5 l', 1, 'pcs', 1.29, 0.1)],
          paymentMethod: 'cashier',
          createdAt: at(12 + Math.floor(rnd() * 3)),
        }),
      );
    }
    if (rnd() < 0.05) {
      const wash = pick([
        ['Plovimas „Bazinis“', 6.99],
        ['Plovimas „Premium“', 9.99],
        ['Plovimas „Ultra“', 12.99],
      ] as const);
      out.push(
        makeTransaction({
          ...common,
          category: 'carwash',
          items: [item(wash[0], 1, 'pcs', wash[1], 0)],
          paymentMethod: 'cashier',
          createdAt: at(10 + Math.floor(rnd() * 8)),
        }),
      );
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---- Repozitorija (naudojama ir kitų mock paslaugų) ----

export async function loadTransactions(userId: string): Promise<Transaction[]> {
  return dbGet(txKey(userId), () => seedHistory(userId));
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const list = await loadTransactions(tx.userId);
  await dbSet(txKey(tx.userId), [tx, ...list]);
}

export function computeSavings(list: Transaction[], now = new Date()): SavingsSummary {
  const year = String(now.getFullYear());
  const byCategory: Record<TransactionCategory, number> = { fuel: 0, carwash: 0, food: 0, coffee: 0, subscription: 0, merch: 0 };
  let thisYear = 0;
  let total = 0;
  for (const tx of list) {
    // Įmonės pylimai – ne asmeniniai sutaupymai.
    if (tx.fleetAccountId) continue;
    total += tx.discount;
    if (tx.createdAt.startsWith(year)) {
      thisYear += tx.discount;
      byCategory[tx.category] += tx.discount;
    }
  }
  for (const k of Object.keys(byCategory) as TransactionCategory[]) byCategory[k] = round2(byCategory[k]);
  return { thisYear: round2(thisYear), total: round2(total), byCategory };
}

export function buildReceipt(tx: Transaction, cardNumber?: string): Receipt {
  const station = STATIONS.find((s) => s.id === tx.stationId);
  const vatBase = round2(tx.total / (1 + VAT_RATE));
  const methodLabel =
    tx.paymentMethod === 'app'
      ? tx.paymentCardLast4
        ? `EMSI programėlė, kortelė •••• ${tx.paymentCardLast4}`
        : 'EMSI programėlė, Apple Pay / Google Pay'
      : tx.paymentMethod === 'plate'
        ? `Pagal valst. numerį ${formatPlate(tx.vehiclePlate ?? '')}, ${tx.paymentCardLast4 ? `kortelė •••• ${tx.paymentCardLast4}` : 'Apple Pay / Google Pay'}`
        : tx.paymentMethod === 'fleet'
          ? `Įmonės kortelė, ${formatPlate(tx.vehiclePlate ?? '')}${tx.odometerKm ? `, rida ${tx.odometerKm} km` : ''}`
          : 'Banko kortelė kasoje';
  return {
    id: tx.receiptId,
    transactionId: tx.id,
    number: `EM${tx.stationId.slice(0, 3).toUpperCase()}-${tx.id.slice(-8).toUpperCase()}`,
    issuedAt: tx.createdAt,
    station: { name: tx.stationName, address: station ? `${station.address}, ${station.city}` : '' },
    seller: { name: 'UAB „EMSI“ (demonstracija)', companyCode: '000000000', vatCode: 'LT000000000' },
    items: tx.items,
    subtotal: tx.subtotal,
    discount: tx.discount,
    vat: [{ rate: VAT_RATE, base: vatBase, amount: round2(tx.total - vatBase) }],
    total: tx.total,
    paymentLabel: methodLabel,
    loyaltyCardMasked: cardNumber ? `•••• ${cardNumber.slice(-4)}` : undefined,
  };
}

export class MockTransactionService implements TransactionService {
  /** Asmeniniai pirkimai (įmonės pylimai rodomi Fleet ataskaitose). */
  async list(userId: string) {
    await delay(250);
    return (await loadTransactions(userId)).filter((t) => !t.fleetAccountId);
  }

  async get(userId: string, id: string) {
    return (await loadTransactions(userId)).find((t) => t.id === id);
  }

  async getReceipt(userId: string, transactionId: string) {
    await delay(150);
    const tx = await this.get(userId, transactionId);
    return tx ? buildReceipt(tx) : undefined;
  }
}
