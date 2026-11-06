import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Vienodas ikonų stilius: sąrašuose ir nuorodose naudojamos kontūrinės (`-outline`) ikonos,
 * užpildytos – tik aktyvioms būsenoms.
 */
export function outlineIcon(name: IconName): IconName {
  if (name.endsWith('-outline')) return name;
  const outline = `${name}-outline`;
  return outline in Ionicons.glyphMap ? (outline as IconName) : name;
}
