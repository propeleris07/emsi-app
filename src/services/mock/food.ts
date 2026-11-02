import type { MenuItem, StampCard } from '@/models';
import type { FoodService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import menuJson from '@/data/menu.json';
import { localize } from '../locale';

/** Kas 6-a kava nemokamai: surinkus 5 spaudelius, 6-a kava – dovana. */
export const STAMPS_REQUIRED = 5;
const key = (userId: string) => `stamps.${userId}`;
// Demonstracijai pradedame su 3 spaudeliais.
const initial = (): StampCard => ({ stamps: 3, required: STAMPS_REQUIRED, freeAvailable: 0 });

export class MockFoodService implements FoodService {
  async getMenu() {
    await delay(150);
    return (menuJson as (MenuItem & { en?: Partial<MenuItem> })[]).map((m) => localize(m));
  }

  async getStampCard(userId: string) {
    return dbGet(key(userId), initial);
  }

  async addStamp(userId: string) {
    await delay(400);
    const card = await this.getStampCard(userId);
    const stamps = card.stamps + 1;
    const next: StampCard =
      stamps >= card.required
        ? { ...card, stamps: 0, freeAvailable: card.freeAvailable + 1 }
        : { ...card, stamps };
    await dbSet(key(userId), next);
    return next;
  }

  async redeemFreeCoffee(userId: string) {
    await delay(400);
    const card = await this.getStampCard(userId);
    if (card.freeAvailable < 1) throw new Error('NO_FREE_COFFEE');
    const next = { ...card, freeAvailable: card.freeAvailable - 1 };
    await dbSet(key(userId), next);
    return next;
  }
}
