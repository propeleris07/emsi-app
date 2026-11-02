import type { AuthService } from '../types';
import { delay } from './delay';
import { newId } from '@/utils/random';
import { dbClearUser } from './db';
import { loadTransactions } from './transactions';

export const DEMO_SMS_CODE = '1234';

export class MockAuthService implements AuthService {
  async requestCode(_phone: string) {
    await delay(600);
    return { requestId: newId('sms') };
  }

  async verifyCode(_requestId: string, phone: string, code: string) {
    await delay(500);
    if (code !== DEMO_SMS_CODE) throw new Error('INVALID_CODE');
    return {
      isNew: true,
      user: {
        id: newId('usr'),
        phone,
        language: 'lt' as const,
        consents: {
          terms: false,
          privacy: false,
          marketing: false,
          personalizedOffers: false,
          location: false,
          acceptedAt: '',
        },
        createdAt: new Date().toISOString(),
      },
    };
  }

  async saveConsents() {
    await delay(250);
  }

  async updateProfile() {
    await delay(250);
  }

  async deleteAccount(userId: string) {
    await delay(800);
    await dbClearUser(userId);
  }

  async exportData(userId: string) {
    await delay(500);
    const transactions = await loadTransactions(userId);
    return JSON.stringify({ userId, exportedAt: new Date().toISOString(), transactions }, null, 2);
  }
}
