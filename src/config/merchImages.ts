/**
 * Atributikos nuotraukos. Kol nuotraukos nėra, rodomas žalias rezervinis paveikslėlis su ikona.
 *
 * Kaip pridėti nuotrauką:
 *   1. Įkelkite failą į `assets/merch/` (pvz., `cap.jpg`; geriausia kvadratinė, ~1000×1000 px).
 *   2. Žemiau įrašykite eilutę su prekės ID iš `src/data/merch.json`, pvz.:
 *        'm-cap': require('../../assets/merch/cap.jpg'),
 */
export const merchImages: Partial<Record<string, number>> = {
  // 'm-cap': require('../../assets/merch/cap.jpg'),
  // 'm-tshirt': require('../../assets/merch/tshirt.jpg'),
};
