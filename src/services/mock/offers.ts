import type { CardType, Offer } from '@/models';
import type { OfferService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import offersJson from '@/data/offers.json';
import { localize } from '../locale';

type OfferBase = Omit<Offer, 'validFrom' | 'validTo'> & { validDays: number };
type OfferRow = OfferBase & { en?: Partial<OfferBase> };

const ROWS = offersJson as OfferRow[];

/** Galiojimas skaičiuojamas nuo šiandienos, kad demonstracija niekada „nepasentų“. */
function withDates(input: OfferRow): Offer {
  const { validDays, ...row } = localize<OfferBase>(input);
  const from = new Date();
  const to = new Date();
  to.setDate(from.getDate() + validDays);
  return { ...row, validFrom: from.toISOString().slice(0, 10), validTo: to.toISOString().slice(0, 10) };
}

const activatedKey = (userId: string) => `offers.activated.${userId}`;

export async function loadOffers(cardType: CardType): Promise<Offer[]> {
  return ROWS.filter((o) => o.segments.length === 0 || o.segments.includes(cardType)).map(withDates);
}

export async function loadActivated(userId: string): Promise<string[]> {
  return dbGet<string[]>(activatedKey(userId), () => []);
}

export class MockOfferService implements OfferService {
  async listOffers(cardType: CardType) {
    await delay(250);
    return loadOffers(cardType);
  }

  async listActivated(userId: string) {
    return loadActivated(userId);
  }

  async activate(userId: string, offerId: string) {
    await delay(400);
    const current = await loadActivated(userId);
    const next = current.includes(offerId) ? current : [...current, offerId];
    await dbSet(activatedKey(userId), next);
    return next;
  }
}
