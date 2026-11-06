import type { MerchProduct } from '@/models';
import type { MerchService } from '../types';
import { delay } from './delay';
import { last4For } from './payments';
import { addTransaction, makeTransaction } from './transactions';
import { localize } from '../locale';
import { newId, randomDigits } from '@/utils/random';
import { round2 } from '@/utils/format';
import { VAT_RATE } from '@/utils/pricing';
import merchJson from '@/data/merch.json';
import stationsJson from '@/data/stations.json';

const products = () => (merchJson as (MerchProduct & { en?: Partial<MerchProduct> })[]).map((p) => localize(p));

export class MockMerchService implements MerchService {
  async listProducts() {
    await delay(150);
    return products();
  }

  async placeOrder({ userId, lines, stationId, paymentMethodId }: Parameters<MerchService['placeOrder']>[0]) {
    if (!lines.length) throw new Error('EMPTY_CART');
    const station = (stationsJson as { id: string; name: string }[]).find((s) => s.id === stationId);
    if (!station) throw new Error('STATION_NOT_FOUND');
    // Kvite – lietuviški pavadinimai, kaip ir kitur.
    const all = (merchJson as MerchProduct[]);
    await delay(900);
    const now = new Date();
    const transaction = makeTransaction({
      userId,
      stationId,
      stationName: station.name,
      category: 'merch',
      items: lines.map((l) => {
        const p = all.find((x) => x.id === l.productId);
        if (!p) throw new Error('PRODUCT_NOT_FOUND');
        return {
          name: l.size ? `${p.name} (${l.size})` : p.name,
          qty: l.qty,
          unit: 'pcs' as const,
          unitPrice: p.price,
          discount: 0,
          total: round2(p.price * l.qty),
          vatRate: VAT_RATE,
        };
      }),
      paymentMethod: 'app',
      paymentCardLast4: last4For(paymentMethodId),
      createdAt: now.toISOString(),
    });
    await addTransaction(transaction);
    return {
      id: newId('ord'),
      pickupCode: randomDigits(6),
      stationId,
      stationName: station.name,
      transactionId: transaction.id,
      createdAt: now.toISOString(),
    };
  }
}
