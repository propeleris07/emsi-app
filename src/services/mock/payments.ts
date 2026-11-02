import { Platform } from 'react-native';
import type { PaymentMethod } from '@/models';
import type { PaymentService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import methodsJson from '@/data/paymentMethods.json';

const key = (userId: string) => `payments.${userId}`;
const DEMO_EXTRA: Omit<PaymentMethod, 'id' | 'isDefault'>[] = [
  { brand: 'visa', last4: '1881', expiry: '12/30', holder: 'DEMO KLIENTAS' },
  { brand: 'mastercard', last4: '7070', expiry: '06/29', holder: 'DEMO KLIENTAS' },
];

// Apple Pay rodomas iPhone, Google Pay – Android telefonuose.
const platformize = (m: PaymentMethod): PaymentMethod =>
  m.brand === 'applepay' && Platform.OS !== 'ios' ? { ...m, brand: 'googlepay' } : m;

async function load(userId: string) {
  return dbGet<PaymentMethod[]>(key(userId), () => methodsJson as PaymentMethod[]);
}

let lastLoaded: PaymentMethod[] = methodsJson as PaymentMethod[];

export class MockPaymentService implements PaymentService {
  async listMethods(userId: string) {
    await delay(150);
    lastLoaded = await load(userId);
    return lastLoaded.map(platformize);
  }

  async addDemoCard(userId: string) {
    await delay(900);
    const list = await load(userId);
    const next = DEMO_EXTRA.find((d) => !list.some((m) => m.last4 === d.last4));
    if (!next) return list.map(platformize);
    const updated = [...list, { ...next, id: `pm-${next.last4}`, isDefault: false }];
    await dbSet(key(userId), updated);
    lastLoaded = updated;
    return updated.map(platformize);
  }

  async setDefault(userId: string, id: string) {
    const updated = (await load(userId)).map((m) => ({ ...m, isDefault: m.id === id }));
    await dbSet(key(userId), updated);
    lastLoaded = updated;
    return updated.map(platformize);
  }

  async remove(userId: string, id: string) {
    let updated = (await load(userId)).filter((m) => m.id !== id);
    if (updated.length && !updated.some((m) => m.isDefault)) updated = updated.map((m, i) => ({ ...m, isDefault: i === 0 }));
    await dbSet(key(userId), updated);
    lastLoaded = updated;
    return updated.map(platformize);
  }
}

/** Kortelės paskutiniai 4 skaitmenys kvitui (piniginėms – nėra). */
export function last4For(paymentMethodId: string): string | undefined {
  return lastLoaded.find((m) => m.id === paymentMethodId)?.last4 || undefined;
}
