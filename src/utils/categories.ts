import type { Ionicons } from '@expo/vector-icons';
import type { TransactionCategory } from '@/models';
import { brand } from '@/config/theme';

export const CATEGORY_ORDER: TransactionCategory[] = ['fuel', 'carwash', 'food', 'coffee', 'subscription'];

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  fuel: brand.green,
  carwash: brand.blue,
  food: brand.red,
  coffee: '#A0682F',
  subscription: '#E89B00',
};

export const CATEGORY_ICONS: Record<TransactionCategory, keyof typeof Ionicons.glyphMap> = {
  fuel: 'speedometer',
  carwash: 'water',
  food: 'fast-food',
  coffee: 'cafe',
  subscription: 'repeat',
};
