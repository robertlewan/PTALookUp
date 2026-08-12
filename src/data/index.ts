import trainerClassesRaw from '../../data/trainerClasses.json';
import trainerSkillsRaw from '../../data/trainerSkills.json';
import pokemonRaw from '../../data/pokemon.json';
import pokemonSkillsRaw from '../../data/pokemonSkills.json';
import type { TrainerClass, TrainerSkill, PokemonFamily, PokemonSkill } from '../types/models';

export const trainerClasses = trainerClassesRaw as TrainerClass[];
export const trainerSkills = trainerSkillsRaw as TrainerSkill[];
export const pokemonFamilies = pokemonRaw as PokemonFamily[];
export const pokemonSkills = pokemonSkillsRaw as PokemonSkill[];

export const trainerClassById = new Map(trainerClasses.map((c) => [c.id, c]));
export const pokemonFamilyById = new Map(pokemonFamilies.map((p) => [p.familyId, p]));

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
