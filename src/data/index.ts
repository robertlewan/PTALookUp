import trainerClassesRaw from '../../data/trainerClasses.json';
import trainerSkillsRaw from '../../data/trainerSkills.json';
import pokemonRaw from '../../data/pokemon.json';
import legendaryPokemonRaw from '../../data/legendaryPokemon.json';
import pokemonSkillsRaw from '../../data/pokemonSkills.json';
import gmGuideRaw from '../../data/gmGuide.json';
import itemsRaw from '../../data/items.json';
import type { TrainerClass, TrainerSkill, PokemonFamily, PokemonSkill, GmGuideSection, Item } from '../types/models';

function toModifier(v: unknown): number {
  if (typeof v === 'number') return v;
  const n = parseInt(String(v).replace('+', ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function normalizeFamily(family: any): PokemonFamily {
  return {
    ...family,
    stages: family.stages.map((stage: any) => ({
      ...stage,
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

export const trainerClassById = new Map(trainerClasses.map((c) => [c.id, c]));
export const pokemonFamilyById = new Map(pokemonFamilies.map((p) => [p.familyId, p]));
export const itemById = new Map(items.map((i) => [i.id, i]));

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
