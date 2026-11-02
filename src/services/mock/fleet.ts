import type { FleetAccount, FleetReport, FleetVehicleReport, FuelType, Transaction } from '@/models';
import type { FleetService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';
import { addTransaction, FUEL_NAMES_LT, loadTransactions, makeTransaction } from './transactions';
import { hashString, seededRandom } from '@/utils/random';
import { round2 } from '@/utils/format';
import { VAT_RATE } from '@/utils/pricing';
import fleetJson from '@/data/fleet.json';
import stationsJson from '@/data/stations.json';
import pricesJson from '@/data/prices.json';

const accKey = (userId: string) => `fleet.${userId}`;
const TEMPLATE = fleetJson.account as FleetAccount;

const sameDay = (a: string, b: Date) => a.slice(0, 10) === b.toISOString().slice(0, 10);
const sameMonth = (a: string, b: Date) => a.slice(0, 7) === b.toISOString().slice(0, 7);

async function fleetTx(userId: string, accountId: string): Promise<Transaction[]> {
  return (await loadTransactions(userId)).filter((t) => t.fleetAccountId === accountId);
}

/** Demonstracinė įmonės pylimų istorija (praėjęs ir šis mėnuo) su ridos rodmenimis. */
async function seedFleetHistory(userId: string, account: FleetAccount): Promise<FleetAccount> {
  const rnd = seededRandom(hashString(`fleet:${userId}`));
  const stations = (stationsJson as { id: string; name: string }[]).slice(0, 8);
  const base = pricesJson.base as Record<FuelType, number>;
  const vehicles = account.vehicles.map((v) => ({ ...v }));
  const now = new Date();
  // Praėjęs mėnuo ir šis mėnuo iki šiandien + vienas šios dienos pylimas (kad matytųsi limitai).
  const startDaysAgo = now.getDate() + 30;
  for (let daysAgo = startDaysAgo; daysAgo >= 0; daysAgo--) {
    if (daysAgo % 2 === 1) continue;
    for (const v of vehicles) {
      const isToday = daysAgo === 0;
      if (isToday ? v.id !== 'fv-3' : rnd() > (v.fuel === 'D' ? 0.4 : 0.2)) continue;
      const litres = round2(v.nickname.startsWith('MAN') ? 90 + rnd() * 60 : 35 + rnd() * 25);
      const price = base[v.fuel];
      const discountPerL = 0.04;
      const km = Math.round(litres * (v.nickname.startsWith('MAN') ? 4 : 11) * (0.9 + rnd() * 0.2));
      v.lastOdometerKm = (v.lastOdometerKm ?? 0) + km;
      const d = new Date(now);
      d.setDate(now.getDate() - daysAgo);
      d.setHours(6 + Math.floor(rnd() * 12), Math.floor(rnd() * 60));
      if (isToday) d.setTime(now.getTime() - 2 * 3600_000);
      const st = stations[Math.floor(rnd() * stations.length)];
      await addTransaction(
        makeTransaction({
          userId,
          stationId: st.id,
          stationName: st.name,
          category: 'fuel',
          items: [
            {
              name: FUEL_NAMES_LT[v.fuel],
              qty: litres,
              unit: 'l',
              unitPrice: price,
              discount: round2(litres * discountPerL),
              total: round2(litres * (price - discountPerL)),
              vatRate: VAT_RATE,
            },
          ],
          paymentMethod: 'fleet',
          fleetAccountId: account.id,
          vehiclePlate: v.plate,
          odometerKm: v.lastOdometerKm,
          pumpNumber: 1 + Math.floor(rnd() * 4),
          createdAt: d.toISOString(),
        }),
      );
    }
  }
  return { ...account, vehicles };
}

async function withSpent(userId: string, account: FleetAccount): Promise<FleetAccount> {
  const list = await fleetTx(userId, account.id);
  const now = new Date();
  const spentToday = round2(list.filter((t) => sameDay(t.createdAt, now)).reduce((a, t) => a + t.total, 0));
  const spentMonth = round2(list.filter((t) => sameMonth(t.createdAt, now)).reduce((a, t) => a + t.total, 0));
  return { ...account, spentToday, spentMonth };
}

/** Kiek dar galima išleisti šiandien (mažiausias iš dienos ir mėnesio likučių). */
export async function fleetRemaining(userId: string, fuel: FuelType): Promise<number> {
  const acc = await dbGet<FleetAccount | null>(accKey(userId), () => null);
  if (!acc) throw new Error('FLEET_NOT_LINKED');
  if (!acc.limits.allowedFuels.includes(fuel)) throw new Error('FLEET_FUEL_NOT_ALLOWED');
  const a = await withSpent(userId, acc);
  return round2(Math.min(a.limits.dailyEur - a.spentToday, a.limits.monthlyEur - a.spentMonth));
}

export async function updateFleetOdometer(userId: string, plate: string, km: number) {
  const acc = await dbGet<FleetAccount | null>(accKey(userId), () => null);
  if (!acc) return;
  await dbSet(accKey(userId), { ...acc, vehicles: acc.vehicles.map((v) => (v.plate === plate ? { ...v, lastOdometerKm: km } : v)) });
}

export class MockFleetService implements FleetService {
  async getAccount(userId: string) {
    const acc = await dbGet<FleetAccount | null>(accKey(userId), () => null);
    return acc ? withSpent(userId, acc) : null;
  }

  async link(userId: string, companyCode: string, driverPin: string) {
    await delay(1000);
    const demo = fleetJson.demoCredentials;
    if (companyCode.trim() !== demo.companyCode || driverPin.trim() !== demo.driverPin) throw new Error('INVALID_CREDENTIALS');
    const existing = await dbGet<FleetAccount | null>(accKey(userId), () => null);
    // Istorija generuojama tik pirmą kartą – vėl susiejus naudojama ta pati.
    const seeded = await dbGet<FleetAccount | null>(`fleet.seed.${userId}`, () => null);
    const acc = existing ?? seeded ?? (await seedFleetHistory(userId, TEMPLATE));
    await dbSet(`fleet.seed.${userId}`, acc);
    await dbSet(accKey(userId), acc);
    return withSpent(userId, acc);
  }

  async unlink(userId: string) {
    await delay(300);
    await dbSet(accKey(userId), null);
  }

  async report(userId: string, month: string): Promise<FleetReport> {
    await delay(300);
    const acc = await dbGet<FleetAccount | null>(accKey(userId), () => null);
    if (!acc) throw new Error('FLEET_NOT_LINKED');
    const all = (await fleetTx(userId, acc.id)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const inMonth = all.filter((t) => t.createdAt.startsWith(month));
    const litresOf = (t: Transaction) => t.items.reduce((a, i) => a + (i.unit === 'l' ? i.qty : 0), 0);

    const byVehicle: FleetVehicleReport[] = acc.vehicles.map((vehicle) => {
      const own = inMonth.filter((t) => t.vehiclePlate === vehicle.plate);
      const litres = round2(own.reduce((a, t) => a + litresOf(t), 0));
      const odos = own.map((t) => t.odometerKm).filter((x): x is number => typeof x === 'number');
      // Ankstesnis rodmuo prieš mėnesį – kad atstumas apimtų visą mėnesį.
      const before = all.filter((t) => t.vehiclePlate === vehicle.plate && t.createdAt < `${month}-01` && t.odometerKm).pop()?.odometerKm;
      const start = before ?? odos[0];
      const distanceKm = odos.length && start !== undefined ? Math.max(0, odos[odos.length - 1] - start) : 0;
      // Sąnaudos: pirmasis pylimas mėnesyje „užpildo“ ankstesnį ridos tarpą, jei yra ankstesnis rodmuo.
      const litresForConsumption = before !== undefined ? litres : litres - (own[0] ? litresOf(own[0]) : 0);
      return {
        vehicle,
        fills: own.length,
        litres,
        amount: round2(own.reduce((a, t) => a + t.total, 0)),
        distanceKm,
        avgL100: distanceKm > 0 ? round2((litresForConsumption / distanceKm) * 100) : undefined,
      };
    });

    return {
      month,
      total: round2(inMonth.reduce((a, t) => a + t.total, 0)),
      litres: round2(inMonth.reduce((a, t) => a + litresOf(t), 0)),
      saved: round2(inMonth.reduce((a, t) => a + t.discount, 0)),
      byVehicle,
      transactions: inMonth.reverse(),
    };
  }
}
