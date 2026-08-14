import type { Nature, PokemonStat, StatKey } from '../types/models';

export const STAT_LABELS: Record<StatKey, string> = {
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Special Attack',
  specialDefense: 'Special Defense',
  speed: 'Speed',
};

// PHB "Favored and Disliked Flavors" table.
export const STAT_FLAVORS: Record<StatKey, string> = {
  attack: 'Spicy',
  defense: 'Sour',
  specialAttack: 'Dry',
  specialDefense: 'Bitter',
  speed: 'Sweet',
};

// Applies a Nature's +1/-1 to a stat block. Per the PHB: if the decrease
// would take a stat to 0, the decrease doesn't happen (the increase still
// does), rather than letting the stat hit 0.
export function applyNature(stats: PokemonStat, nature: Nature | undefined | null): PokemonStat {
  if (!nature) return stats;
  const next = { ...stats };
  const dec = next[nature.decreasedStat];
  if (dec > 1) {
    next[nature.decreasedStat] = dec - 1;
  }
  next[nature.increasedStat] = next[nature.increasedStat] + 1;
  return next;
}
