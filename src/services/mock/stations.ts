import type { FuelPrice, FuelType, PricePoint, Pump, Station } from '@/models';
import type { PriceService, StationService } from '../types';
import { delay } from './delay';
import { hashString, seededRandom } from '@/utils/random';
import { round3 } from '@/utils/format';
import stationsJson from '@/data/stations.json';
import pricesJson from '@/data/prices.json';

type StationRow = Station & { priceOffset: number };

const STATIONS = stationsJson as StationRow[];
const BASE = pricesJson.base as Record<FuelType, number>;

function toStation({ priceOffset: _o, ...s }: StationRow): Station {
  return s;
}

/** Kainos „atnaujinamos“ kasdien 06:00 – kad demonstracijoje data visada būtų šiandienos. */
function todayUpdatedAt(): string {
  const d = new Date();
  d.setHours(6, 0, 0, 0);
  return d.toISOString();
}

/** Demonstracinis kainų pakeitimas (simuliuojamas kainos kritimas). Raktas: `stoties id:degalai`. */
export const priceAdjustments = new Map<string, { delta: number; at: string }>();

function pricesFor(row: StationRow): FuelPrice[] {
  const baseUpdatedAt = todayUpdatedAt();
  return row.fuels.map((fuel) => {
    const adj = priceAdjustments.get(`${row.id}:${fuel}`);
    return {
      stationId: row.id,
      fuel,
      // SND ir AdBlue kainos tinkle vienodos, kitų degalų – skiriasi pagal degalinę.
      pricePerL: round3(BASE[fuel] + (fuel === 'LPG' || fuel === 'ADBLUE' ? 0 : row.priceOffset) + (adj?.delta ?? 0)),
      updatedAt: adj?.at ?? baseUpdatedAt,
    };
  });
}

export class MockStationService implements StationService {
  async listStations() {
    await delay(200);
    return STATIONS.map(toStation);
  }

  async getStation(id: string) {
    await delay(100);
    const row = STATIONS.find((s) => s.id === id);
    return row ? toStation(row) : undefined;
  }

  async getPumps(stationId: string): Promise<Pump[]> {
    await delay(250);
    const row = STATIONS.find((s) => s.id === stationId);
    if (!row) return [];
    const rnd = seededRandom(hashString(stationId) + new Date().getHours());
    return Array.from({ length: row.pumpCount }, (_, i) => {
      const r = rnd();
      // Pusė kolonėlių – be SND ir AdBlue, kaip įprasta degalinėse.
      const fuels = row.fuels.filter((f) => i < 2 || (f !== 'LPG' && f !== 'ADBLUE'));
      return {
        id: `${stationId}-p${i + 1}`,
        stationId,
        number: i + 1,
        fuels,
        // Pirmos dvi kolonėlės visada laisvos, kad demonstracija nesustrigtų.
        status: i < 2 ? 'free' : r < 0.08 ? 'offline' : r < 0.3 ? 'busy' : 'free',
      };
    });
  }
}

export class MockPriceService implements PriceService {
  async getPrices(stationId: string) {
    await delay(150);
    const row = STATIONS.find((s) => s.id === stationId);
    return row ? pricesFor(row) : [];
  }

  async getAllPrices() {
    await delay(200);
    return Object.fromEntries(STATIONS.map((s) => [s.id, pricesFor(s)]));
  }

  async getPriceHistory(stationId: string, fuel: FuelType, days: number): Promise<PricePoint[]> {
    await delay(250);
    const current = (await this.getPrices(stationId)).find((p) => p.fuel === fuel)?.pricePerL ?? BASE[fuel];
    const rnd = seededRandom(hashString(`${stationId}:${fuel}`));
    // Atsitiktinis klaidžiojimas atgal nuo šiandienos kainos.
    const points: PricePoint[] = [];
    let price = current;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      points.push({ date: d.toISOString().slice(0, 10), price: round3(price) });
      const step = (rnd() - 0.45) * 0.018;
      price = Math.max(BASE[fuel] * 0.9, Math.min(BASE[fuel] * 1.1, price + step));
    }
    return points.reverse();
  }
}
