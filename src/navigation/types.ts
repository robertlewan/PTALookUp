export type ClassesStackParamList = {
  ClassList: undefined;
  ClassDetail: { classId: string };
};

export type DexStackParamList = {
  DexList: undefined;
  DexDetail: { familyId: string };
};

export type CharactersStackParamList = {
  CharacterList: undefined;
  CharacterSheet: { characterId: string };
  PokemonSheet: { characterId: string; pokemonId: string; location?: 'party' | 'box' };
  AddPokemon: { characterId: string };
  PickClass: { characterId: string; slot: 'base' | 'advanced'; forBaseId?: string };
  PickItem: { onPick: (itemId: string) => void | Promise<void>; defaultCategory?: string };
  PickMove: { onPick: (moveName: string) => void | Promise<void>; proficiencies: string[] };
};

export type ItemsStackParamList = {
  ItemList: undefined;
  ItemDetail: { itemId: string };
};

export type MovesStackParamList = {
  MoveList: undefined;
  MoveDetail: { moveName: string };
};

export type HomeStackParamList = {
  Home: undefined;
};

export type GmGuideStackParamList = {
  GmGuideList: undefined;
  GmGuideDetail: { sectionId: string };
};

export type CombatStackParamList = {
  Combat: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  ClassesTab: undefined;
  DexTab: undefined;
  CharactersTab: undefined;
  GmGuideTab: undefined;
  ItemsTab: undefined;
  MovesTab: undefined;
  CombatTab: undefined;
};
