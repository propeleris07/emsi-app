import type { CarWashProduct, WashCode } from '@/models';
import type { CarWashService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import { loadActivated, loadOffers } from './offers';
import { last4For } from './payments';
import { addTransaction, makeTransaction } from './transactions';
import { newId, randomDigits } from '@/utils/random';
import { round2 } from '@/utils/format';
import { VAT_RATE } from '@/utils/pricing';
import carwashJson from '@/data/carwash.json';
import { localize } from '../locale';

const ROWS = carwashJson.products as (CarWashProduct & { en?: Partial<CarWashProduct> })[];
const products = () => ROWS.map((r) => localize(r));
const codesKey = (userId: string) => `wash.codes.${userId}`;
const activatedKey = (userId: string) => `offers.activated.${userId}`;

/** Pasibaigusių kodų būsena atnaujinama skaitant. */
function refreshStatus(c: WashCode): WashCode {
  return c.status === 'active' && c.expiresAt < new Date().toISOString() ? { ...c, status: 'expired' } : c;
}

export class MockCarWashService implements CarWashService {
  async listProducts() {
    await delay(150);
    return products();
  }

  async quote(userId: string, productId: string) {
    const product = products().find((p) => p.id === productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    const [offers, activated] = await Promise.all([loadOffers('general'), loadActivated(userId)]);
    const coupon = offers.find((o) => o.productIds?.includes(productId) && o.discountPct && activated.includes(o.id));
    const discount = coupon ? round2((product.price * (coupon.discountPct ?? 0)) / 100) : 0;
    return { price: round2(product.price - discount), discount, couponTitle: coupon?.title, couponId: coupon?.id };
  }

  async listCodes(userId: string) {
    await delay(150);
    return (await dbGet<WashCode[]>(codesKey(userId), () => [])).map(refreshStatus);
  }

  async buy(userId: string, productId: string, paymentMethodId: string) {
    const product = products().find((p) => p.id === productId);
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    const q = await this.quote(userId, productId);
    await delay(900);
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(now.getDate() + carwashJson.codeValidDays);
    const code: WashCode = {
      id: newId('wc'),
      productId,
      productName: product.name,
      code: randomDigits(6),
      purchasedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: 'active',
    };
    const transaction = makeTransaction({
      userId,
      stationId: 'online',
      stationName: 'EMSI programėlė',
      category: 'carwash',
      items: [{ name: `Plovimas „${product.name}“`, qty: 1, unit: 'pcs', unitPrice: product.price, discount: q.discount, total: q.price, vatRate: VAT_RATE }],
      paymentMethod: 'app',
      paymentCardLast4: last4For(paymentMethodId),
      createdAt: now.toISOString(),
    });
    await addTransaction(transaction);
    await dbSet(codesKey(userId), [code, ...(await dbGet<WashCode[]>(codesKey(userId), () => []))]);
    // Kuponas vienkartinis – panaudojus pašalinamas.
    if (q.couponId) {
      const activated = await loadActivated(userId);
      await dbSet(activatedKey(userId), activated.filter((id) => id !== q.couponId));
    }
    return { code, transaction };
  }

  private async update(userId: string, codeId: string, patch: Partial<WashCode>) {
    const list = await dbGet<WashCode[]>(codesKey(userId), () => []);
    const next = list.map((c) => (c.id === codeId ? { ...c, ...patch } : c));
    await dbSet(codesKey(userId), next);
    const updated = next.find((c) => c.id === codeId);
    if (!updated) throw new Error('CODE_NOT_FOUND');
    return updated;
  }

  async markForwarded(userId: string, codeId: string, recipient: string) {
    await delay(200);
    return this.update(userId, codeId, { status: 'sent', sentTo: recipient });
  }

  async redeem(userId: string, codeId: string) {
    await delay(600);
    return this.update(userId, codeId, { status: 'used' });
  }
}
