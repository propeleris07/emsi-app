/**
 * Duomenų modeliai. Tie patys tipai naudojami ir mock, ir būsimoje tikroje API implementacijoje.
 * Datos – ISO 8601 eilutės, pinigai – eurais (number), kainos už litrą – €/l.
 */

export type FuelType = '95' | '98' | 'D' | 'LPG' | 'ADBLUE';

export type CardType = 'general' | 'student' | 'farmer' | 'fleet';

export type StationServiceKind =
  | 'open24h'
  | 'carwash'
  | 'lpg'
  | 'adblue'
  | 'food'
  | 'coffee'
  | 'ev'
  | 'shop';

export type Language = 'lt' | 'en';

// ---------- Paskyra ----------

export interface Consents {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
  personalizedOffers: boolean;
  location: boolean;
  acceptedAt: string;
}

export interface User {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  language: Language;
  consents: Consents;
  createdAt: string;
}

// ---------- Lojalumas ----------

export interface DiscountRules {
  /** Nuolaida centais už litrą pagal degalų rūšį. */
  fuelCtPerL: Partial<Record<FuelType, number>>;
  goodsPct: number;
  foodCoffeePct: number;
}

export interface StudentProof {
  kind: 'LSP' | 'ISIC';
  number: string;
  validUntil: string;
}

export interface LoyaltyCard {
  id: string;
  userId: string;
  type: CardType;
  /** 16 skaitmenų kortelės numeris, koduojamas QR ir brūkšniniame kode. */
  number: string;
  status: 'active' | 'pending' | 'blocked';
  linkedPhysicalNumber?: string;
  proof?: StudentProof;
  farmerCode?: string;
  issuedAt: string;
  savedThisYear: number;
  savedTotal: number;
}

export interface SavingsSummary {
  thisYear: number;
  total: number;
  byCategory: Record<TransactionCategory, number>;
}

// ---------- Degalinės ir kainos ----------

export interface OpeningHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  open24h: boolean;
  hours: OpeningHours | null;
  services: StationServiceKind[];
  fuels: FuelType[];
  pumpCount: number;
}

export interface FuelPrice {
  stationId: string;
  fuel: FuelType;
  pricePerL: number;
  updatedAt: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Pump {
  id: string;
  stationId: string;
  number: number;
  fuels: FuelType[];
  status: 'free' | 'busy' | 'offline';
}

export interface CompetitorStation {
  id: string;
  brand: string;
  lat: number;
  lng: number;
  prices: Partial<Record<FuelType, number>>;
}

// ---------- Pirkimai ----------

export type TransactionCategory = 'fuel' | 'carwash' | 'food' | 'coffee' | 'subscription';

export type PaymentMethodKind = 'app' | 'plate' | 'fleet' | 'cashier';

export interface LineItem {
  name: string;
  qty: number;
  unit: 'l' | 'pcs';
  unitPrice: number;
  discount: number;
  total: number;
  vatRate: number;
}

export interface Transaction {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  category: TransactionCategory;
  items: LineItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodKind;
  paymentCardLast4?: string;
  vehiclePlate?: string;
  odometerKm?: number;
  fleetAccountId?: string;
  pumpNumber?: number;
  createdAt: string;
  receiptId: string;
}

export interface VatLine {
  rate: number;
  base: number;
  amount: number;
}

export interface Receipt {
  id: string;
  transactionId: string;
  number: string;
  issuedAt: string;
  station: { name: string; address: string };
  seller: { name: string; companyCode: string; vatCode: string };
  items: LineItem[];
  subtotal: number;
  discount: number;
  vat: VatLine[];
  total: number;
  paymentLabel: string;
  loyaltyCardMasked?: string;
}

export interface PaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'applepay' | 'googlepay';
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
}

// ---------- Plovykla, kava, maistas ----------

export interface CarWashProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  features: string[];
}

export interface WashCode {
  id: string;
  productId: string;
  productName: string;
  code: string;
  purchasedAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired' | 'sent';
  sentTo?: string;
}

export interface SubscriptionPlan {
  kind: 'carwash' | 'coffee';
  name: string;
  description: string;
  priceMonthly: number;
  rule: string;
  /** Kiek kartų per parą galima pasinaudoti. */
  perDay: number;
}

export interface Subscription {
  id: string;
  userId: string;
  kind: 'carwash' | 'coffee';
  name: string;
  priceMonthly: number;
  startsAt: string;
  endsAt: string;
  /** Pvz., „1 kartą per parą“. */
  rule: string;
  lastUsedAt?: string;
  usesCount: number;
  status: 'active' | 'cancelled';
}

/** Vienkartinis kodas (plovyklai ar kavai pagal abonementą). */
export interface DailyCode {
  code: string;
  validUntil: string;
}

export interface MenuItem {
  id: string;
  category: 'coffee' | 'hotfood' | 'snack' | 'drink';
  name: string;
  description: string;
  price: number;
}

export interface StampCard {
  stamps: number;
  required: number;
  freeAvailable: number;
}

// ---------- Pasiūlymai ----------

export interface Offer {
  id: string;
  kind: 'coupon' | 'promoDay' | 'segment';
  title: string;
  body: string;
  discountLabel: string;
  category: 'fuel' | 'carwash' | 'food' | 'coffee' | 'shop';
  /** Kuriems kortelių tipams rodomas (tuščias – visiems). */
  segments: CardType[];
  validFrom: string;
  validTo: string;
  requiresActivation: boolean;
  /** Papildoma degalų nuolaida centais už litrą (jei pasiūlymas degalams). */
  fuelCtPerL?: number;
  /** Kuriems degalams galioja (tuščias – visiems). */
  fuels?: FuelType[];
  /** Prekės/paslaugos nuolaida (pvz. plovimo programai). */
  productIds?: string[];
  discountPct?: number;
  /** Akcija galioja tik mokant programėle. */
  appOnly?: boolean;
  /** Savaitės diena akcijų dienoms (1 – pirmadienis … 7 – sekmadienis). */
  weekday?: number;
}

// ---------- Automobiliai ir verslas ----------

export interface Vehicle {
  id: string;
  plate: string;
  nickname: string;
  fuel: FuelType;
  plateAutopay: boolean;
  isFleet: boolean;
  /** Paskutinė užfiksuota rida (įmonės automobiliams). */
  lastOdometerKm?: number;
}

export interface FleetLimits {
  dailyEur: number;
  monthlyEur: number;
  allowedFuels: FuelType[];
}

export interface FleetAccount {
  id: string;
  companyName: string;
  companyCode: string;
  driverName: string;
  cardNumber: string;
  limits: FleetLimits;
  spentToday: number;
  spentMonth: number;
  vehicles: Vehicle[];
  requireOdometer: boolean;
  manoEmsiLinked: boolean;
}

export interface FleetVehicleReport {
  vehicle: Vehicle;
  fills: number;
  litres: number;
  amount: number;
  distanceKm: number;
  /** Vidutinės sąnaudos l/100 km (jei pakanka ridos duomenų). */
  avgL100?: number;
}

export interface FleetReport {
  month: string;
  total: number;
  litres: number;
  saved: number;
  byVehicle: FleetVehicleReport[];
  transactions: Transaction[];
}

export interface CompetitorComparison {
  competitorName: string;
  distanceKm: number;
  fuel: FuelType;
  ourPrice: number;
  theirPrice: number;
  /** Teigiamas – EMSI pigiau (centais už litrą). */
  diffCt: number;
}

export interface PriceAlert {
  id: string;
  stationId: string;
  fuel: FuelType;
  threshold: number;
  active: boolean;
}

// ---------- Mokėjimas prie kolonėlės ----------

export type PayMode = 'amount' | 'litres' | 'full';

export interface DiscountLine {
  kind: 'card' | 'promo' | 'coupon';
  /** Pasiūlymo pavadinimas (kortelės nuolaidai – tuščias, pavadinimas verčiamas UI). */
  title?: string;
  offerId?: string;
  ctPerL: number;
}

export interface FuelQuote {
  fuel: FuelType;
  pumpPricePerL: number;
  discounts: DiscountLine[];
  discountPerL: number;
  finalPricePerL: number;
}

export type FuelingStatus = 'waiting_nozzle' | 'fueling' | 'completed' | 'cancelled';

export interface FuelingSession {
  id: string;
  userId: string;
  stationId: string;
  pumpNumber: number;
  quote: FuelQuote;
  mode: PayMode;
  /** Rezervuota suma kortelėje (€). */
  authorizedAmount: number;
  targetLitres: number;
  litres: number;
  amount: number;
  status: FuelingStatus;
  paymentMethodId: string;
  /** Pylimas sukurtas atpažinus valstybinį numerį. */
  byPlate?: boolean;
  fleetAccountId?: string;
  vehiclePlate?: string;
  odometerKm?: number;
  startedAt: string;
  transactionId?: string;
}
