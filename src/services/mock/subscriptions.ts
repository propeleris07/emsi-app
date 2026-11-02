import type { DailyCode, Subscription, SubscriptionPlan } from '@/models';
import type { SubscriptionService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import { last4For } from './payments';
import { addTransaction, makeTransaction } from './transactions';
import { newId, randomDigits } from '@/utils/random';
import { VAT_RATE } from '@/utils/pricing';
import plansJson from '@/data/subscriptions.json';
import { localize } from '../locale';

const ROWS = plansJson as (SubscriptionPlan & { en?: Partial<SubscriptionPlan> })[];
const plans = () => ROWS.map((r) => localize(r));
const key = (userId: string) => `subs.${userId}`;
const today = () => new Date().toISOString().slice(0, 10);

export class MockSubscriptionService implements SubscriptionService {
  async listPlans() {
    return plans();
  }

  async list(userId: string) {
    await delay(150);
    const now = new Date().toISOString();
    return (await dbGet<Subscription[]>(key(userId), () => [])).filter((s) => s.endsAt > now);
  }

  async subscribe(userId: string, kind: Subscription['kind'], paymentMethodId: string) {
    const plan = plans().find((p) => p.kind === kind);
    if (!plan) throw new Error('PLAN_NOT_FOUND');
    await delay(900);
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + 30);
    const subscription: Subscription = {
      id: newId('sub'),
      userId,
      kind,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      rule: plan.rule,
      usesCount: 0,
      status: 'active',
    };
    const transaction = makeTransaction({
      userId,
      stationId: 'online',
      stationName: 'EMSI programėlė',
      category: 'subscription',
      items: [{ name: `${plan.name} (30 d.)`, qty: 1, unit: 'pcs', unitPrice: plan.priceMonthly, discount: 0, total: plan.priceMonthly, vatRate: VAT_RATE }],
      paymentMethod: 'app',
      paymentCardLast4: last4For(paymentMethodId),
      createdAt: start.toISOString(),
    });
    await addTransaction(transaction);
    const all = await dbGet<Subscription[]>(key(userId), () => []);
    await dbSet(key(userId), [subscription, ...all.filter((s) => s.kind !== kind)]);
    return { subscription, transaction };
  }

  async cancel(userId: string, id: string) {
    await delay(500);
    const all = await dbGet<Subscription[]>(key(userId), () => []);
    // Atšauktas abonementas galioja iki apmokėto laikotarpio pabaigos.
    const next = all.map((s) => (s.id === id ? { ...s, status: 'cancelled' as const } : s));
    await dbSet(key(userId), next);
    return next.find((s) => s.id === id)!;
  }

  async useToday(userId: string, id: string): Promise<DailyCode> {
    await delay(500);
    const all = await dbGet<Subscription[]>(key(userId), () => []);
    const sub = all.find((s) => s.id === id);
    if (!sub) throw new Error('SUBSCRIPTION_NOT_FOUND');
    if (sub.lastUsedAt?.slice(0, 10) === today()) throw new Error('ALREADY_USED_TODAY');
    const now = new Date();
    await dbSet(
      key(userId),
      all.map((s) => (s.id === id ? { ...s, lastUsedAt: now.toISOString(), usesCount: s.usesCount + 1 } : s)),
    );
    const end = new Date(now);
    end.setHours(23, 59, 59, 0);
    return { code: randomDigits(6), validUntil: end.toISOString() };
  }
}
