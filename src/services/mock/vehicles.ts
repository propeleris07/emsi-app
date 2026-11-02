import type { PriceAlert, Vehicle } from '@/models';
import type { PriceAlertService, VehicleService } from '../types';
import { dbGet, dbSet } from './db';
import { delay } from './delay';

const vKey = (userId: string) => `vehicles.${userId}`;
const aKey = (userId: string) => `alerts.${userId}`;

export class MockVehicleService implements VehicleService {
  async list(userId: string) {
    await delay(100);
    return dbGet<Vehicle[]>(vKey(userId), () => []);
  }

  async save(userId: string, vehicle: Vehicle) {
    await delay(300);
    const list = await dbGet<Vehicle[]>(vKey(userId), () => []);
    if (list.some((v) => v.plate === vehicle.plate && v.id !== vehicle.id)) throw new Error('PLATE_EXISTS');
    const next = list.some((v) => v.id === vehicle.id) ? list.map((v) => (v.id === vehicle.id ? vehicle : v)) : [...list, vehicle];
    await dbSet(vKey(userId), next);
    return next;
  }

  async remove(userId: string, id: string) {
    await delay(200);
    const next = (await dbGet<Vehicle[]>(vKey(userId), () => [])).filter((v) => v.id !== id);
    await dbSet(vKey(userId), next);
    return next;
  }
}

export async function loadAlerts(userId: string) {
  return dbGet<PriceAlert[]>(aKey(userId), () => []);
}

export class MockPriceAlertService implements PriceAlertService {
  async list(userId: string) {
    return loadAlerts(userId);
  }

  async save(userId: string, alert: PriceAlert) {
    await delay(250);
    const list = await loadAlerts(userId);
    const next = list.some((a) => a.id === alert.id) ? list.map((a) => (a.id === alert.id ? alert : a)) : [...list, alert];
    await dbSet(aKey(userId), next);
    return next;
  }

  async remove(userId: string, id: string) {
    const next = (await loadAlerts(userId)).filter((a) => a.id !== id);
    await dbSet(aKey(userId), next);
    return next;
  }
}
