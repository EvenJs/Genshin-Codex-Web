export type Element = 'PYRO' | 'HYDRO' | 'ANEMO' | 'ELECTRO' | 'DENDRO' | 'CRYO' | 'GEO';

export type WeaponType = 'SWORD' | 'CLAYMORE' | 'POLEARM' | 'BOW' | 'CATALYST';

export interface Character {
  id: string;
  name: string;
  element: Element;
  weaponType: WeaponType;
  rarity: number;
  region: string | null;
  imageUrl: string | null;
}

export interface AccountCharacter {
  id: string;
  accountId: string;
  characterId: string;
  level: number;
  constellation: number;
  character: Character;
}

export interface CharactersResponse {
  items: Character[];
}

export interface AccountCharactersResponse {
  items: AccountCharacter[];
}

// Element display names and colors
export const ELEMENT_NAMES: Record<Element, string> = {
  PYRO: 'Pyro',
  HYDRO: 'Hydro',
  ANEMO: 'Anemo',
  ELECTRO: 'Electro',
  DENDRO: 'Dendro',
  CRYO: 'Cryo',
  GEO: 'Geo',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  PYRO: '#EF7938',
  HYDRO: '#4CC2F1',
  ANEMO: '#74C2A8',
  ELECTRO: '#AF8EC1',
  DENDRO: '#A5C83B',
  CRYO: '#99D7E7',
  GEO: '#FAB632',
};

export const WEAPON_TYPE_NAMES: Record<WeaponType, string> = {
  SWORD: 'Sword',
  CLAYMORE: 'Claymore',
  POLEARM: 'Polearm',
  BOW: 'Bow',
  CATALYST: 'Catalyst',
};
