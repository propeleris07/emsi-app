import type { FuelingSession, FuelQuote } from '@/models';
import type { FuelingService, QuoteInput, StartFuelingInput } from '../types';
import { delay } from './delay';
import { loadActivated, loadOffers } from './offers';
import { MockPriceService } from './stations';
import { MockLoyaltyService } from './loyalty';
import { addTransaction, FUEL_NAMES_LT, makeTransaction } from './transactions';
import { last4For } from './payments';
import { fleetRemaining, updateFleetOdometer } from './fleet';
import { FULL_TANK_HOLD_EUR } from '@/config/payments';
import { newId } from '@/utils/random';
import { round2 } from '@/utils/format';
import { buildFuelQuote, VAT_RATE } from '@/utils/pricing';
import stationsJson from '@/data/stations.json';

/** Demonstracijoje pylimas pagreitintas, kad nereikėtų laukti. */
const LITRES_PER_SECOND = 2.6;
const NOZZLE_WAIT_MS = 3000;

const prices = new MockPriceService();
const loyalty = new MockLoyaltyService();
const sessions = new Map<string, { session: FuelingSession; startedMs: number; stoppedAtLitres?: number }>();

export class MockFuelingService implements FuelingService {
  async quote({ userId, card, stationId, fuel }: QuoteInput): Promise<FuelQuote> {
    const [stationPrices, offers, activated] = await Promise.all([
      prices.getPrices(stationId),
      loadOffers(card.type),
      loadActivated(userId),
    ]);
    const pump = stationPrices.find((p) => p.fuel === fuel);
    if (!pump) throw new Error('FUEL_NOT_AVAILABLE');
    return buildFuelQuote({
      fuel,
      pumpPricePerL: pump.pricePerL,
      cardType: card.type,
      rules: loyalty.getRules(card.type),
      offers,
      activatedOfferIds: activated,
    });
  }

  async start(input: StartFuelingInput): Promise<FuelingSession> {
    const quote = await this.quote(input);
    await delay(1200); // lėšų rezervavimas banke
    const price = quote.finalPricePerL;
    let targetLitres: number;
    let authorizedAmount: number;
    // Įmonės kortelė: tikrinami leidžiami degalai ir likę limitai.
    let fleetCap = Infinity;
    if (input.fleetAccountId) {
      const remaining = await fleetRemaining(input.userId, input.fuel);
      if (remaining <= 0) throw new Error('FLEET_LIMIT');
      fleetCap = remaining;
    }
    if (input.mode === 'amount') {
      authorizedAmount = input.value;
      targetLitres = input.value / price;
    } else if (input.mode === 'litres') {
      targetLitres = input.value;
      authorizedAmount = Math.ceil(input.value * price);
    } else {
      authorizedAmount = FULL_TANK_HOLD_EUR;
      targetLitres = Math.min(38 + Math.random() * 16, FULL_TANK_HOLD_EUR / price);
    }
    if (authorizedAmount > fleetCap) {
      authorizedAmount = fleetCap;
      targetLitres = Math.min(targetLitres, fleetCap / price);
    }
    const session: FuelingSession = {
      id: newId('fs'),
      userId: input.userId,
      stationId: input.stationId,
      pumpNumber: input.pumpNumber,
      quote,
      mode: input.mode,
      authorizedAmount,
      targetLitres: round2(targetLitres),
      litres: 0,
      amount: 0,
      status: 'waiting_nozzle',
      paymentMethodId: input.paymentMethodId,
      byPlate: input.byPlate,
      fleetAccountId: input.fleetAccountId,
      vehiclePlate: input.vehiclePlate,
      odometerKm: input.odometerKm,
      startedAt: new Date().toISOString(),
    };
    sessions.set(session.id, { session, startedMs: Date.now() });
    return session;
  }

  async poll(sessionId: string): Promise<FuelingSession> {
    const entry = sessions.get(sessionId);
    if (!entry) throw new Error('SESSION_NOT_FOUND');
    const { session } = entry;
    if (session.status === 'completed' || session.status === 'cancelled') return session;

    const elapsed = Date.now() - entry.startedMs - NOZZLE_WAIT_MS;
    if (elapsed < 0) return session;
    const limit = entry.stoppedAtLitres ?? session.targetLitres;
    const litres = Math.min(limit, (elapsed / 1000) * LITRES_PER_SECOND);
    session.status = 'fueling';
    session.litres = round2(litres);
    session.amount = round2(litres * session.quote.finalPricePerL);
    if (litres >= limit) await this.complete(entry);
    return { ...session };
  }

  async stop(sessionId: string): Promise<FuelingSession> {
    const entry = sessions.get(sessionId);
    if (!entry) throw new Error('SESSION_NOT_FOUND');
    if (entry.session.litres === 0) {
      entry.session.status = 'cancelled';
      return { ...entry.session };
    }
    entry.stoppedAtLitres = entry.session.litres;
    return this.poll(sessionId);
  }

  private async complete(entry: { session: FuelingSession; stoppedAtLitres?: number }) {
    const s = entry.session;
    if (s.transactionId) return;
    const { quote } = s;
    // Pasirinkus sumą – nuskaičiuojama tiksliai ta suma.
    const total = s.mode === 'amount' && entry.stoppedAtLitres === undefined ? s.authorizedAmount : s.amount;
    s.amount = total;
    s.litres = s.mode === 'amount' && entry.stoppedAtLitres === undefined ? round2(total / quote.finalPricePerL) : s.litres;
    const station = (stationsJson as { id: string; name: string }[]).find((x) => x.id === s.stationId);
    const tx = makeTransaction({
      userId: s.userId,
      stationId: s.stationId,
      stationName: station?.name ?? '',
      category: 'fuel',
      items: [
        {
          name: FUEL_NAMES_LT[quote.fuel],
          qty: s.litres,
          unit: 'l',
          unitPrice: quote.pumpPricePerL,
          discount: round2(s.litres * quote.pumpPricePerL - total),
          total,
          vatRate: VAT_RATE,
        },
      ],
      paymentMethod: s.fleetAccountId ? 'fleet' : s.byPlate ? 'plate' : 'app',
      paymentCardLast4: s.fleetAccountId ? undefined : last4For(s.paymentMethodId),
      fleetAccountId: s.fleetAccountId,
      vehiclePlate: s.vehiclePlate,
      odometerKm: s.odometerKm,
      pumpNumber: s.pumpNumber,
      createdAt: new Date().toISOString(),
    });
    await addTransaction(tx);
    if (s.fleetAccountId && s.vehiclePlate && s.odometerKm) await updateFleetOdometer(s.userId, s.vehiclePlate, s.odometerKm);
    s.transactionId = tx.id;
    s.status = 'completed';
  }
}
