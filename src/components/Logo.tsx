import { Image } from 'expo-image';

/** Logotipas. Pakeiskite failą assets/logo.png (rekomenduojama ~490×203 px, permatomas fonas). */
const LOGO = require('../../assets/logo.png');
const RATIO = 490 / 203;

export function Logo({ height = 32 }: { height?: number }) {
  return (
    <Image
      source={LOGO}
      style={{ height, width: height * RATIO }}
      contentFit="contain"
      accessibilityLabel="EMSI"
    />
  );
}
