/**
 * Funkcijų jungikliai. Pakeiskite reikšmę ir perkraukite programėlę.
 */
export const featureFlags = {
  /** Kainų palyginimas su artimiausiomis kitų tinklų degalinėmis. */
  competitorPriceComparison: false,
  /** Ženklas „Demonstracinė versija“ ekrano viršuje. */
  showDemoBadge: true,
  /** Apple Wallet / Google Wallet mygtukai kortelės ekrane. */
  walletButtons: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
