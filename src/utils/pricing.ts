import type { CardType, DiscountLine, DiscountRules, FuelQuote, FuelType, Offer } from '@/models';
import { round3 } from './format';

export function fuelDiscountPerL(rules: DiscountRules | undefined, fuel: FuelType): number {
  return (rules?.fuelCtPerL[fuel] ?? 0) / 100;
}

export function cardPrice(price: number, fuel: FuelType, rules: DiscountRules | undefined): number {
  return round3(price - fuelDiscountPerL(rules, fuel));
}

/** Ar pasiūlymas taikomas šiems degalams šiandien. */
export function offerAppliesToFuel(offer: Offer, fuel: FuelType, cardType: CardType, activatedIds: string[], now = new Date()): boolean {
  if (!offer.fuelCtPerL) return false;
  if (offer.fuels?.length && !offer.fuels.includes(fuel)) return false;
  if (offer.segments.length && !offer.segments.includes(cardType)) return false;
  if (offer.requiresActivation && !activatedIds.includes(offer.id)) return false;
  if (offer.weekday) {
    const isoDay = ((now.getDay() + 6) % 7) + 1;
    if (isoDay !== offer.weekday) return false;
  }
  const today = now.toISOString().slice(0, 10);
  return offer.validFrom <= today && offer.validTo >= today;
}

/**
 * Degalų kainos skaičiavimas mokant programėle: kortelės nuolaida + akcijų dienos + aktyvuoti kuponai.
 * Tą pačią funkciją naudoja ir ekranai (išankstinė kaina), ir mock „serveris“ (galutinė kaina).
 */
export function buildFuelQuote(params: {
  fuel: FuelType;
  pumpPricePerL: number;
  cardType: CardType;
  rules: DiscountRules;
  offers: Offer[];
  activatedOfferIds: string[];
  now?: Date;
}): FuelQuote {
  const { fuel, pumpPricePerL, cardType, rules, offers, activatedOfferIds, now } = params;
  const discounts: DiscountLine[] = [];
  const cardCt = rules.fuelCtPerL[fuel] ?? 0;
  if (cardCt) discounts.push({ kind: 'card', ctPerL: cardCt });
  // Asmeniniai kuponai ir akcijos netaikomi mokant įmonės kortele (įmonei taikomos sutartinės sąlygos).
  for (const o of cardType === 'fleet' ? [] : offers) {
    if (offerAppliesToFuel(o, fuel, cardType, activatedOfferIds, now)) {
      discounts.push({ kind: o.kind === 'promoDay' ? 'promo' : 'coupon', title: o.title, offerId: o.id, ctPerL: o.fuelCtPerL ?? 0 });
    }
  }
  const discountPerL = discounts.reduce((a, d) => a + d.ctPerL, 0) / 100;
  return { fuel, pumpPricePerL, discounts, discountPerL: round3(discountPerL), finalPricePerL: round3(pumpPricePerL - discountPerL) };
}

export const FUEL_ORDER: FuelType[] = ['95', '98', 'D', 'LPG', 'ADBLUE'];

export const FUEL_COLORS: Record<FuelType, string> = {
  '95': '#00A651',
  '98': '#0096D6',
  D: '#4A4A4A',
  LPG: '#E89B00',
  ADBLUE: '#2D6CDF',
};

export const VAT_RATE = 0.21;
