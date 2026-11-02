import type { FuelType } from '@/models';
import type { DemoService } from '../types';
import { delay } from './delay';
import { MockPriceService, priceAdjustments } from './stations';
import { loadAlerts } from './vehicles';

const prices = new MockPriceService();

export class MockDemoService implements DemoService {
  async simulatePriceDrop(userId: string, stationId: string, fuel: FuelType, byEur: number) {
    await delay(300);
    const k = `${stationId}:${fuel}`;
    const prev = priceAdjustments.get(k)?.delta ?? 0;
    priceAdjustments.set(k, { delta: prev - byEur, at: new Date().toISOString() });
    const newPrice = (await prices.getPrices(stationId)).find((p) => p.fuel === fuel)?.pricePerL ?? 0;
    // Tikroje sistemoje signalus tikrina serveris ir siunčia push pranešimą.
    const alerts = (await loadAlerts(userId)).filter(
      (a) => a.active && a.stationId === stationId && a.fuel === fuel && newPrice <= a.threshold,
    );
    return alerts.map((alert) => ({ alert, newPrice }));
  }
}
