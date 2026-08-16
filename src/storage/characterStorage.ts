import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CharacterSheet } from '../types/models';
import { findPokemonStage } from '../data';

const STORAGE_KEY = 'pta_lookup.characters.v1';

async function readAll(): Promise<CharacterSheet[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const characters = JSON.parse(raw) as CharacterSheet[];
    // Migration: characters saved before the Box feature existed have no `box` field.
    return characters.map((c) => ({ ...c, box: c.box ?? [] }));
  } catch {
    return [];
  }
}

async function writeAll(characters: CharacterSheet[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

export async function listCharacters(): Promise<CharacterSheet[]> {
  return readAll();
}

export async function getCharacter(id: string): Promise<CharacterSheet | undefined> {
  const all = await readAll();
  return all.find((c) => c.id === id);
}

export async function saveCharacter(character: CharacterSheet): Promise<void> {
  const all = await readAll();
  const idx = all.findIndex((c) => c.id === character.id);
  character.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    all[idx] = character;
  } else {
    all.push(character);
  }
  await writeAll(all);
}

export async function deleteCharacter(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((c) => c.id !== id));
}

export function newCharacter(name: string): CharacterSheet {
  const now = new Date().toISOString();
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    trainerLevel: 1,
    classes: [],
    stats: { attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 },
    maxHp: 20,
    currentHp: 20,
    skills: [],
    inventory: [],
    notes: '',
    party: [],
    box: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function newOwnedPokemon(familyId: string, stageName: string): CharacterSheet['party'][number] {
  const ref = findPokemonStage(familyId, stageName);
  return {
    id: `mon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    familyId,
    stageName,
    nickname: '',
    currentHp: ref?.stage.stats.hp ?? 1,
    statusConditions: [],
    notes: '',
    heldItem: null,
  };
}
