import type { CardType, DiscountRules, LoyaltyCard } from '@/models';
import type { IssueCardInput, LoyaltyService, WalletProvider, WalletService } from '../types';
import { delay } from './delay';
import { newId, randomDigits } from '@/utils/random';
import cardRules from '@/data/cardRules.json';
import { computeSavings, loadTransactions } from './transactions';

const RULES = cardRules as Record<CardType, DiscountRules>;


export class MockLoyaltyService implements LoyaltyService {
  getRules(type: CardType) {
    return RULES[type];
  }

  async issueCard(input: IssueCardInput): Promise<LoyaltyCard> {
    await delay(700);
    return {
      id: newId('card'),
      userId: input.userId,
      type: input.type,
      number: `7300${randomDigits(12)}`,
      status: 'active',
      proof: input.proof,
      farmerCode: input.farmerCode,
      issuedAt: new Date().toISOString(),
      savedThisYear: 0,
      savedTotal: 0,
    };
  }

  async linkPhysicalCard(card: LoyaltyCard, physicalNumber: string): Promise<LoyaltyCard> {
    await delay(800);
    const digits = physicalNumber.replace(/\D/g, '');
    if (digits.length !== 16) throw new Error('INVALID_CARD_NUMBER');
    // Susiejus programėlės kortelė perima plastikinės kortelės numerį ir istoriją.
    return { ...card, number: digits, linkedPhysicalNumber: digits };
  }

  async getSavings(userId: string) {
    await delay(150);
    return computeSavings(await loadTransactions(userId));
  }

  async changeCardType(card: LoyaltyCard, input: Omit<IssueCardInput, 'userId'>): Promise<LoyaltyCard> {
    await delay(600);
    return { ...card, type: input.type, proof: input.proof, farmerCode: input.farmerCode };
  }
}

export class MockWalletService implements WalletService {
  async addToWallet(_card: LoyaltyCard, _provider: WalletProvider) {
    // Tikroje versijoje: serveris sugeneruoja .pkpass (Apple) arba Google Wallet „save“ nuorodą.
    await delay(900);
    return { added: true };
  }
}
