import type { PokemonMove } from '../types/models';
import { typeColors } from '../theme/theme';
import { proficiencyMoveListByName, proficiencyMoveLists } from '../data';

// Parses a move's `frequency` field (e.g. "3/day", "1/day", "At-Will") into a
// max-uses-before-Rest count. Returns null for unlimited/unparseable frequencies.
export function moveMaxUses(frequency: string | null): number | null {
  if (!frequency) return null;
  const m = frequency.match(/^(\d+)\s*\/\s*day$/i);
  return m ? parseInt(m[1], 10) : null;
}

export function remainingUses(moveUses: Record<string, number> | undefined, move: Pick<PokemonMove, 'name' | 'frequency'>): number | null {
  const max = moveMaxUses(move.frequency);
  if (max === null) return null;
  const stored = moveUses?.[move.name];
  return stored === undefined ? max : Math.max(0, Math.min(max, stored));
}

// Groups a stage's moves under a family's proficiency tags. Type-named
// proficiencies (e.g. "Grass") match by the move's own type; "Attack" /
// "Special Attack" / "Effect" proficiencies match by move category; move-class
// flavor tags (e.g. "Bruiser", "Floral", "Healer") match against the PHB's
// "Proficiency Lists" chapter (data/proficiencyMoveLists.json). A trailing
// parenthetical on a family's proficiency string (e.g. "Pulse (Blastoise)",
// "Stampeding (Venusaur)") is stripped before matching.
export function movesForProficiency(moves: PokemonMove[], proficiency: string): PokemonMove[] {
  const p = proficiency
    .trim()
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
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
  const list = proficiencyMoveListByName.get(p);
  if (list) {
    const nameSet = new Set(list.moves);
    return moves.filter((m) => nameSet.has(m.name));
  }
  return [];
}

// The reverse of movesForProficiency: every proficiency tag a given move
// belongs to (its type, its category, and any move-class flavor lists from
// the PHB's "Proficiency Lists" chapter that name it).
export function proficienciesForMove(move: PokemonMove): string[] {
  const tags = new Set<string>();
  if (move.moveType) tags.add(move.moveType);
  if (move.category) tags.add(move.category);
  for (const list of proficiencyMoveLists) {
    if (list.moves.includes(move.name)) tags.add(list.proficiency);
  }
  return [...tags];
}
