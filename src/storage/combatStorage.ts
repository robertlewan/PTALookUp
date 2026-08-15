import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CombatMap } from '../types/models';

const STORAGE_KEY = 'pta_lookup.combat.v1';

const DEFAULT_MAP: CombatMap = { rows: 8, cols: 8, tokens: [] };

export async function getCombatMap(): Promise<CombatMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_MAP;
  try {
    const parsed = JSON.parse(raw) as Partial<CombatMap>;
    return {
      rows: parsed.rows ?? DEFAULT_MAP.rows,
      cols: parsed.cols ?? DEFAULT_MAP.cols,
      tokens: (parsed.tokens ?? []).map((t) => ({ ...t, size: t.size ?? 1 })),
    };
  } catch {
    return DEFAULT_MAP;
  }
}

export async function saveCombatMap(map: CombatMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}
