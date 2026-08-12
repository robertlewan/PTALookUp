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
  PokemonSheet: { characterId: string; pokemonId: string };
  AddPokemon: { characterId: string };
  PickClass: { characterId: string; slot: 'base' | 'advanced'; forBaseId?: string };
};

export type HomeStackParamList = {
  Home: undefined;
};

export type GmGuideStackParamList = {
  GmGuideList: undefined;
  GmGuideDetail: { sectionId: string };
};

export type RootTabParamList = {
  HomeTab: undefined;
  ClassesTab: undefined;
  DexTab: undefined;
  CharactersTab: undefined;
  GmGuideTab: undefined;
};
