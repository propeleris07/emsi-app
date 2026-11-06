/**
 * Paslaugų sąsajos. Ekranai naudoja TIK šias sąsajas (per `services` iš ./index.ts),
 * todėl tikrą EMSI API, kasų sistemą ar mokėjimų tiekėją galima prijungti
 * parašius naują implementaciją, nekeičiant ekranų.
 */
import type {
  CardType,
  CarWashProduct,
  CompetitorComparison,
  Consents,
  DailyCode,
  FleetAccount,
  FleetReport,
  DiscountRules,
  FuelingSession,
  FuelPrice,
  FuelQuote,
  FuelType,
  LoyaltyCard,
  MenuItem,
  CartLine,
  MerchOrder,
  MerchProduct,
  Offer,
  PaymentMethod,
  PayMode,
  PriceAlert,
  PricePoint,
  Pump,
  Receipt,
  SavingsSummary,
  StampCard,
  Station,
  StudentProof,
  Subscription,
  SubscriptionPlan,
  Transaction,
  User,
  Vehicle,
  WashCode,
} from '@/models';

export interface AuthService {
  /** Išsiunčia SMS kodą. Demonstracijoje kodas visada 1234. */
  requestCode(phone: string): Promise<{ requestId: string }>;
  verifyCode(requestId: string, phone: string, code: string): Promise<{ user: User; isNew: boolean }>;
  saveConsents(userId: string, consents: Consents): Promise<void>;
  updateProfile(userId: string, patch: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'language'>>): Promise<void>;
  /** Ištrina paskyrą ir visus su ja susijusius duomenis (BDAR 17 str.). */
  deleteAccount(userId: string): Promise<void>;
  /** Asmens duomenų kopija (BDAR 15 ir 20 str.). */
  exportData(userId: string): Promise<string>;
}

export interface IssueCardInput {
  userId: string;
  type: Exclude<CardType, 'fleet'>;
  proof?: StudentProof;
  farmerCode?: string;
}

export interface LoyaltyService {
  getRules(type: CardType): DiscountRules;
  issueCard(input: IssueCardInput): Promise<LoyaltyCard>;
  /** Susieja esamą plastikinę kortelę (16 skaitmenų). */
  linkPhysicalCard(card: LoyaltyCard, physicalNumber: string): Promise<LoyaltyCard>;
  changeCardType(card: LoyaltyCard, input: Omit<IssueCardInput, 'userId'>): Promise<LoyaltyCard>;
  /** Sutaupyta suma, apskaičiuota iš pirkimų istorijos. */
  getSavings(userId: string): Promise<SavingsSummary>;
}

export type WalletProvider = 'apple' | 'google';

export interface WalletService {
  addToWallet(card: LoyaltyCard, provider: WalletProvider): Promise<{ added: boolean }>;
}

export interface StationService {
  listStations(): Promise<Station[]>;
  getStation(id: string): Promise<Station | undefined>;
  getPumps(stationId: string): Promise<Pump[]>;
}

export interface PriceService {
  getPrices(stationId: string): Promise<FuelPrice[]>;
  getAllPrices(): Promise<Record<string, FuelPrice[]>>;
  getPriceHistory(stationId: string, fuel: FuelType, days: number): Promise<PricePoint[]>;
}

export interface OfferService {
  listOffers(cardType: CardType): Promise<Offer[]>;
  listActivated(userId: string): Promise<string[]>;
  /** Aktyvuoja kuponą; grąžina visų aktyvuotų pasiūlymų ID. */
  activate(userId: string, offerId: string): Promise<string[]>;
}

export interface PaymentService {
  /** Išsaugotos mokėjimo priemonės (tikroje versijoje – tokenai iš mokėjimų tiekėjo). */
  listMethods(userId: string): Promise<PaymentMethod[]>;
  /**
   * Prideda kortelę. Tikroje versijoje kortelės duomenis įveda vartotojas mokėjimų tiekėjo
   * saugiame lange (programėlė jų nemato) – demonstracijoje pridedama sugalvota kortelė.
   */
  addDemoCard(userId: string): Promise<PaymentMethod[]>;
  setDefault(userId: string, id: string): Promise<PaymentMethod[]>;
  remove(userId: string, id: string): Promise<PaymentMethod[]>;
}

export interface QuoteInput {
  userId: string;
  card: LoyaltyCard;
  stationId: string;
  fuel: FuelType;
}

export interface StartFuelingInput extends QuoteInput {
  pumpNumber: number;
  mode: PayMode;
  /** € (mode = amount) arba litrai (mode = litres); „pilnam bakui“ nenaudojama. */
  value: number;
  paymentMethodId: string;
  byPlate?: boolean;
  /** Pylimas įmonės kortele (Fleet). */
  fleetAccountId?: string;
  vehiclePlate?: string;
  odometerKm?: number;
}

/** Kolonėlės valdymas: lėšų rezervavimas, kolonėlės atrakinimas, pylimo būsena. */
export interface FuelingService {
  quote(input: QuoteInput): Promise<FuelQuote>;
  start(input: StartFuelingInput): Promise<FuelingSession>;
  poll(sessionId: string): Promise<FuelingSession>;
  stop(sessionId: string): Promise<FuelingSession>;
}

export interface TransactionService {
  list(userId: string): Promise<Transaction[]>;
  get(userId: string, id: string): Promise<Transaction | undefined>;
  getReceipt(userId: string, transactionId: string): Promise<Receipt | undefined>;
}

export interface PurchaseResult {
  transaction: Transaction;
}

export interface CarWashService {
  listProducts(): Promise<CarWashProduct[]>;
  /** Kaina su aktyvuotais kuponais. */
  quote(userId: string, productId: string): Promise<{ price: number; discount: number; couponTitle?: string }>;
  listCodes(userId: string): Promise<WashCode[]>;
  buy(userId: string, productId: string, paymentMethodId: string): Promise<PurchaseResult & { code: WashCode }>;
  /** Pažymi kodą kaip persiųstą draugui (pats siuntimas – per telefono „Bendrinti“). */
  markForwarded(userId: string, codeId: string, recipient: string): Promise<WashCode>;
  /** Demonstracija: kodas įvestas plovykloje. */
  redeem(userId: string, codeId: string): Promise<WashCode>;
}

export interface SubscriptionService {
  listPlans(): Promise<SubscriptionPlan[]>;
  list(userId: string): Promise<Subscription[]>;
  subscribe(userId: string, kind: Subscription['kind'], paymentMethodId: string): Promise<PurchaseResult & { subscription: Subscription }>;
  cancel(userId: string, id: string): Promise<Subscription>;
  /** Šiandienos kodas pagal abonementą; klaida ALREADY_USED_TODAY, jei jau panaudota. */
  useToday(userId: string, id: string): Promise<DailyCode>;
}

export interface MerchService {
  listProducts(): Promise<MerchProduct[]>;
  /** Užsakymas atsiėmimui degalinėje (demonstracinis apmokėjimas). */
  placeOrder(input: { userId: string; lines: CartLine[]; stationId: string; paymentMethodId: string }): Promise<MerchOrder>;
}

export interface FoodService {
  getMenu(): Promise<MenuItem[]>;
  getStampCard(userId: string): Promise<StampCard>;
  /** Demonstracija: kasininkas nuskenavo kortelę perkant kavą. */
  addStamp(userId: string): Promise<StampCard>;
  redeemFreeCoffee(userId: string): Promise<StampCard>;
}

export interface VehicleService {
  list(userId: string): Promise<Vehicle[]>;
  save(userId: string, vehicle: Vehicle): Promise<Vehicle[]>;
  remove(userId: string, id: string): Promise<Vehicle[]>;
}

export interface PriceAlertService {
  list(userId: string): Promise<PriceAlert[]>;
  save(userId: string, alert: PriceAlert): Promise<PriceAlert[]>;
  remove(userId: string, id: string): Promise<PriceAlert[]>;
}

/** Vietiniai pranešimai (tikroje versijoje – ir push pranešimai iš serverio). */
export interface NotificationService {
  requestPermission(): Promise<boolean>;
  notify(title: string, body: string, url?: string): Promise<void>;
  scheduleAt(date: Date, title: string, body: string, url?: string): Promise<void>;
}

/** Verslo klientai: įmonės kortelė, limitai, ataskaitos („Mano EMSI“ integracija). */
export interface FleetService {
  getAccount(userId: string): Promise<FleetAccount | null>;
  /** Susieja vairuotoją su įmonės paskyra „Mano EMSI“ sistemoje. */
  link(userId: string, companyCode: string, driverPin: string): Promise<FleetAccount>;
  unlink(userId: string): Promise<void>;
  /** month formatu YYYY-MM. */
  report(userId: string, month: string): Promise<FleetReport>;
}

export interface CompetitorService {
  /** Palyginimas su artimiausia kito tinklo degaline (rodomas tik įjungus jungiklį). */
  compare(stationId: string, fuel: FuelType): Promise<CompetitorComparison | null>;
}

/** Tik demonstracijai skirti veiksmai – tikroje versijoje jų nebus. */
export interface DemoService {
  /** Sumažina kainą ir grąžina suveikusius kainų signalus. */
  simulatePriceDrop(userId: string, stationId: string, fuel: FuelType, byEur: number): Promise<{ alert: PriceAlert; newPrice: number }[]>;
}

export interface Services {
  auth: AuthService;
  loyalty: LoyaltyService;
  wallet: WalletService;
  stations: StationService;
  prices: PriceService;
  offers: OfferService;
  payments: PaymentService;
  fueling: FuelingService;
  transactions: TransactionService;
  carwash: CarWashService;
  subscriptions: SubscriptionService;
  food: FoodService;
  merch: MerchService;
  vehicles: VehicleService;
  priceAlerts: PriceAlertService;
  notifications: NotificationService;
  demo: DemoService;
  fleet: FleetService;
  competitors: CompetitorService;
}
