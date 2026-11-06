/**
 * VIENINTELĖ vieta, kur pasirenkamos paslaugų implementacijos.
 * Prijungiant tikrą API, čia pakeiskite Mock* klases tikromis.
 */
import type { Services } from './types';
import { MockAuthService } from './mock/auth';
import { MockLoyaltyService, MockWalletService } from './mock/loyalty';
import { MockPriceService, MockStationService } from './mock/stations';
import { MockOfferService } from './mock/offers';
import { MockPaymentService } from './mock/payments';
import { MockFuelingService } from './mock/fueling';
import { MockTransactionService } from './mock/transactions';
import { MockCarWashService } from './mock/carwash';
import { MockSubscriptionService } from './mock/subscriptions';
import { MockFoodService } from './mock/food';
import { MockMerchService } from './mock/merch';
import { MockPriceAlertService, MockVehicleService } from './mock/vehicles';
import { MockDemoService } from './mock/demo';
import { LocalNotificationService } from './device/notifications';
import { MockFleetService } from './mock/fleet';
import { MockCompetitorService } from './mock/competitors';

export const services: Services = {
  auth: new MockAuthService(),
  loyalty: new MockLoyaltyService(),
  wallet: new MockWalletService(),
  stations: new MockStationService(),
  prices: new MockPriceService(),
  offers: new MockOfferService(),
  payments: new MockPaymentService(),
  fueling: new MockFuelingService(),
  transactions: new MockTransactionService(),
  carwash: new MockCarWashService(),
  subscriptions: new MockSubscriptionService(),
  food: new MockFoodService(),
  merch: new MockMerchService(),
  vehicles: new MockVehicleService(),
  priceAlerts: new MockPriceAlertService(),
  notifications: new LocalNotificationService(),
  demo: new MockDemoService(),
  fleet: new MockFleetService(),
  competitors: new MockCompetitorService(),
};

export type * from './types';
