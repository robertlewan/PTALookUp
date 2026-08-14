import trainerClassesRaw from '../../data/trainerClasses.json';
import trainerSkillsRaw from '../../data/trainerSkills.json';
import pokemonRaw from '../../data/pokemon.json';
import legendaryPokemonRaw from '../../data/legendaryPokemon.json';
import pokemonSkillsRaw from '../../data/pokemonSkills.json';
import gmGuideRaw from '../../data/gmGuide.json';
import itemsRaw from '../../data/items.json';
import allMovesRaw from '../../data/allMoves.json';
import naturesRaw from '../../data/natures.json';
import type { TrainerClass, TrainerSkill, PokemonFamily, PokemonSkill, GmGuideSection, Item, PokemonMove, Nature } from '../types/models';

function toModifier(v: unknown): number {
  if (typeof v === 'number') return v;
  const n = parseInt(String(v).replace('+', ''), 10);
  return Number.isFinite(n) ? n : 0;
}

export const allMoves = allMovesRaw as PokemonMove[];
export const allMoveByName = new Map(allMoves.map((m) => [m.name, m]));

// The per-species Pokedex movesets were extracted from an older 3.0-era
// Pokedex book, while the master move list (allMoves.json) was extracted
// from the current 3.5 Player's Handbook and is authoritative. Where a move
// name exists in both, the 3.5 version's frequency/range/type/category/
// power/effect wins; a move's own `special` tag (legendary bonus abilities)
// is kept if present. Moves not in the master list (mostly rare signature
// moves documented in a separate PHB chapter that wasn't extracted) fall
// back to the embedded data unchanged.
function reconcileMove(move: any): PokemonMove {
  const canonical = allMoveByName.get(move.name);
  if (!canonical) return move as PokemonMove;
  return { ...canonical, special: move.special ?? canonical.special ?? null };
}

function normalizeFamily(family: any): PokemonFamily {
  return {
    ...family,
    stages: family.stages.map((stage: any) => ({
      ...stage,
      moves: stage.moves.map(reconcileMove),
      moveModifiers: {
        attack: toModifier(stage.moveModifiers?.attack),
        specialAttack: toModifier(stage.moveModifiers?.specialAttack),
        effect: toModifier(stage.moveModifiers?.effect),
      },
    })),
  };
}

export const trainerClasses = trainerClassesRaw as TrainerClass[];
export const trainerSkills = trainerSkillsRaw as TrainerSkill[];
export const pokemonFamilies = [...(pokemonRaw as any[]), ...(legendaryPokemonRaw as any[])].map(normalizeFamily);
export const pokemonSkills = pokemonSkillsRaw as PokemonSkill[];
export const gmGuideSections = gmGuideRaw as GmGuideSection[];
export const items = itemsRaw as Item[];
export const natures = naturesRaw as Nature[];

export const trainerClassById = new Map(trainerClasses.map((c) => [c.id, c]));
export const pokemonFamilyById = new Map(pokemonFamilies.map((p) => [p.familyId, p]));
export const itemById = new Map(items.map((i) => [i.id, i]));
export const itemByName = new Map(items.map((i) => [i.name, i]));
export const natureByName = new Map(natures.map((n) => [n.name, n]));

export function baseClasses(): TrainerClass[] {
  return trainerClasses.filter((c) => c.tier === 'base');
}

export function advancedClassesOf(baseId: string): TrainerClass[] {
  return trainerClasses.filter((c) => c.tier === 'advanced' && c.parentClassId === baseId);
}

export function findPokemonStage(familyId: string, stageName: string) {
  const family = pokemonFamilyById.get(familyId);
  if (!family) return null;
  const stage = family.stages.find((s) => s.name === stageName);
  if (!stage) return null;
  return { family, stage };
}
