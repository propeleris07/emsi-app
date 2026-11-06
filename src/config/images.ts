import type { Offer } from '@/models';

/**
 * Nuotraukos. Visos – nemokamos Unsplash nuotraukos (Unsplash License), autoriai nurodyti README.
 * Norėdami pakeisti – įdėkite savo failą į `assets/images/` ir pakeiskite kelią čia.
 */
export const photos = {
  coffee: require('../../assets/images/coffee.jpg'),
  coffeeLeaf: require('../../assets/images/coffee-leaf.jpg'),
  coffeeToGo: require('../../assets/images/coffee-togo.jpg'),
  hotdog: require('../../assets/images/hotdog.jpg'),
  croissant: require('../../assets/images/croissant.jpg'),
  drink: require('../../assets/images/drink.jpg'),
  carwash: require('../../assets/images/carwash.jpg'),
  fuel: require('../../assets/images/fuel.jpg'),
  road: require('../../assets/images/road.jpg'),
  /** Pradžios ekrano viršus. Pakeiskite tikra EMSI degalinės nuotrauka (tas pats failo vardas). */
  station: require('../../assets/images/station.jpg'),
} satisfies Record<string, number>;

export type PhotoKey = keyof typeof photos;

/** Konkretaus pasiūlymo nuotrauka (jei nenurodyta – pagal kategoriją). */
const OFFER_PHOTOS: Record<string, PhotoKey> = {
  'promo-friday': 'fuel',
  'promo-monday-coffee': 'coffee',
  'coupon-coffee': 'coffeeToGo',
  'coupon-wash': 'carwash',
  'coupon-hotdog': 'hotdog',
  'seg-student': 'coffeeLeaf',
  'seg-farmer': 'road',
  'coupon-adblue': 'fuel',
  'coupon-fuel-weekend': 'road',
};

const CATEGORY_PHOTOS: Record<Offer['category'], PhotoKey> = {
  fuel: 'fuel',
  carwash: 'carwash',
  food: 'hotdog',
  coffee: 'coffee',
  shop: 'drink',
};

export function offerPhoto(offer: Offer): number {
  return photos[OFFER_PHOTOS[offer.id] ?? CATEGORY_PHOTOS[offer.category]];
}

