// Shared data models for PTA Lookup.
// These mirror the JSON schemas produced by the data-extraction scripts in /data.

export interface TrainerSkill {
  name: string;
  governingStat: string;
  description: string;
}

export interface ClassLevelEntry {
  level: number;
  features: string[];
}

export interface ClassFeature {
  name: string;
  level: number;
  description: string;
}

export interface TrainerClass {
  id: string;
  name: string;
  tier: 'base' | 'advanced';
  parentClassId: string | null;
  flavorText: string;
  favoredStats: string[] | null;
  advancedClassOptions: string[] | null;
  skillTalents: { choose: number; options: string[] } | null;
  levelTable: ClassLevelEntry[];
  features: ClassFeature[];
}

export interface PokemonSkill {
  name: string;
  shortDescription: string;
  description: string;
}

export interface PokemonStat {
  hp: number;
  defense: number;
  specialDefense: number;
  speed: number;
  speedFt: number;
  attack: number;
  specialAttack: number;
}

export interface PokemonMove {
  name: string;
  frequency: string;
  range: string;
  moveType: string;
  category: string;
  power: string | null;
  effect: string;
  special?: string | null;
}

export interface PokemonSkillRef {
  name: string;
  description: string;
  special?: string | null;
}

export interface PokemonPassive {
  name: string;
  description: string;
  special?: string | null;
}

export interface PokemonStage {
  name: string;
  types: string[];
  size: string;
  weight: string;
  stats: PokemonStat;
  skills: PokemonSkillRef[];
  passives: PokemonPassive[];
  moveModifiers: { attack: number; specialAttack: number; effect: number };
  moves: PokemonMove[];
}

export interface PokemonBiology {
  eggGroups: string[];
  hatchRate: string | null;
  diet: string | null;
  habitats: string[];
}

export interface GmGuideTable {
  columns: string[];
  rows: (string | number)[][];
}

export interface GmGuideSection {
  id: string;
  title: string;
  body: string;
  table: GmGuideTable | null;
}

export interface ProficiencyMoveList {
  proficiency: string;
  flavorText: string | null;
  moves: string[];
}

export interface Item {
  id: string;
  name: string;
  category: string;
  price: string | null;
  effect: string;
}

export type StatKey = 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

export interface Nature {
  name: string;
  increasedStat: StatKey;
  decreasedStat: StatKey;
}

export interface PokemonFamily {
  familyId: string;
  familyName: string;
  rarity: string | null;
  biology: PokemonBiology | null;
  evolutionText: string | null;
  proficiencies: string[];
  megaEvolution: boolean;
  gigantamax: boolean;
  stages: PokemonStage[];
}

// ---- Character sheet / save data (local to the app, not extracted) ----

export interface TrainerClassPick {
  classId: string;
  level: number;
}

export interface CustomMove {
  name: string;
  frequency: string;
  effect: string;
}

export interface OwnedPokemon {
  id: string;
  familyId: string;
  stageName: string;
  nickname: string;
  currentHp: number;
  statusConditions: string[];
  notes: string;
  moveUses?: Record<string, number>;
  heldItem?: string | null;
  extraMoves?: string[];
  removedMoves?: string[];
  customMoves?: CustomMove[];
  extraPassives?: string[];
  nature?: string | null;
}

export interface CharacterSheet {
  id: string;
  name: string;
  trainerLevel: number;
  classes: TrainerClassPick[];
  stats: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  maxHp: number;
  currentHp: number;
  skills: string[];
  inventory: string[];
  notes: string;
  party: OwnedPokemon[];
  box: OwnedPokemon[];
  createdAt: string;
  updatedAt: string;
}

// ---- Combat map (battle grid, local to the app) ----

export type CombatTokenKind =
  | 'circle-black'
  | 'circle-white'
  | 'square-black'
  | 'square-white'
  | 'triangle-black'
  | 'tree'
  | 'rock'
  | 'water';

export interface CombatToken {
  id: string;
  kind: CombatTokenKind;
  row: number;
  col: number;
  // Footprint in grid cells (row/col mark the top-left cell). Only circle
  // tokens support anything beyond 1 (for Large/Huge/Gigantic creatures).
  size: 1 | 2 | 3 | 4;
  label?: string;
}

export interface CombatMap {
  rows: number;
  cols: number;
  tokens: CombatToken[];
}
