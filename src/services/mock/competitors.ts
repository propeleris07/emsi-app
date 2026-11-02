import type { CompetitorStation, FuelType } from '@/models';
import type { CompetitorService } from '../types';
import { delay } from './delay';
import { MockPriceService } from './stations';
import { distanceKm } from '@/utils/geo';
import stationsJson from '@/data/stations.json';
import competitorsJson from '@/data/competitors.json';

/**
 * Demonstraciniai, sugalvoti konkurentų duomenys (be tikrų prekių ženklų).
 * Tikroje versijoje – kainų stebėjimo duomenų šaltinis.
 */
const COMPETITORS = competitorsJson as CompetitorStation[];
const prices = new MockPriceService();

export class MockCompetitorService implements CompetitorService {
  async compare(stationId: string, fuel: FuelType) {
    await delay(150);
    const st = (stationsJson as { id: string; lat: number; lng: number }[]).find((s) => s.id === stationId);
    if (!st) return null;
    const ours = (await prices.getPrices(stationId)).find((p) => p.fuel === fuel)?.pricePerL;
    if (ours === undefined) return null;
    const nearest = COMPETITORS.filter((c) => c.prices[fuel] !== undefined)
      .map((c) => ({ c, d: distanceKm({ lat: st.lat, lng: st.lng }, { lat: c.lat, lng: c.lng }) }))
      .sort((a, b) => a.d - b.d)[0];
    if (!nearest) return null;
    const theirs = nearest.c.prices[fuel]!;
    return {
      competitorName: nearest.c.brand,
      distanceKm: nearest.d,
      fuel,
      ourPrice: ours,
      theirPrice: theirs,
      diffCt: Math.round((theirs - ours) * 100),
    };
  }
}
