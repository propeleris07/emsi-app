import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Labai paprasta „duomenų bazė“ mock serveriui (AsyncStorage + atminties talpykla).
 * Tikroje versijoje šiuos duomenis laikys EMSI serveris.
 */
const cache = new Map<string, unknown>();
const PREFIX = 'emsi.mock.';

export async function dbGet<T>(key: string, init: () => T): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T;
  let value: T;
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    value = raw ? (JSON.parse(raw) as T) : init();
  } catch {
    value = init();
  }
  cache.set(key, value);
  return value;
}

export async function dbSet<T>(key: string, value: T): Promise<void> {
  cache.set(key, value);
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Demonstracijoje pakanka atminties.
  }
}

/** Ištrina visus vartotojo mock duomenis (paskyros ištrynimas). */
export async function dbClearUser(userId: string): Promise<void> {
  for (const k of [...cache.keys()]) if (k.includes(userId)) cache.delete(k);
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX) && k.includes(userId)));
}
