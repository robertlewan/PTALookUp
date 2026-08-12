import type { PokemonMove } from '../types/models';
import { typeColors } from '../theme/theme';

// Parses a move's `frequency` field (e.g. "3/day", "1/day", "At-Will") into a
// max-uses-before-Rest count. Returns null for unlimited/unparseable frequencies.
export function moveMaxUses(frequency: string | null): number | null {
  if (!frequency) return null;
  const m = frequency.match(/^(\d+)\s*\/\s*day$/i);
  return m ? parseInt(m[1], 10) : null;
}

export function remainingUses(moveUses: Record<string, number> | undefined, move: PokemonMove): number | null {
  const max = moveMaxUses(move.frequency);
  if (max === null) return null;
  const stored = moveUses?.[move.name];
  return stored === undefined ? max : Math.max(0, Math.min(max, stored));
}

// Groups a stage's moves under a family's proficiency tags. Type-named
// proficiencies (e.g. "Grass") match by the move's own type; "Attack" /
// "Special Attack" / "Effect" proficiencies match by move category. Other
// proficiency tags (move-class flavor tags like "Bruiser") have no reliable
// mapping from the extracted data, so they're returned with an empty list.
export function movesForProficiency(moves: PokemonMove[], proficiency: string): PokemonMove[] {
  const p = proficiency.trim();
  const isType = Object.prototype.hasOwnProperty.call(typeColors, p);
  if (isType) {
    return moves.filter((m) => m.moveType === p);
  }
  const pLower = p.toLowerCase();
  if (pLower === 'attack' || pLower === 'physical attack') {
    return moves.filter((m) => m.category === 'Attack');
  }
  if (pLower === 'special attack') {
    return moves.filter((m) => m.category === 'Special Attack');
  }
  if (pLower === 'effect') {
    return moves.filter((m) => m.category === 'Effect');
  }
  return [];
}
