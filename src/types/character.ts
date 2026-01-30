export type Element = 'PYRO' | 'HYDRO' | 'ANEMO' | 'ELECTRO' | 'DENDRO' | 'CRYO' | 'GEO';

export type WeaponType = 'SWORD' | 'CLAYMORE' | 'POLEARM' | 'BOW' | 'CATALYST';

export interface CharacterTalents {
  '天赋1（普通攻击）'?: string;
  '天赋2（元素战技）'?: string;
  '天赋3（元素爆发）'?: string;
  '天赋4（突破天赋）'?: string;
  '天赋5（突破天赋）'?: string;
  '天赋6（固有天赋）'?: string;
  '天赋7（固有天赋）'?: string;
  '天赋6（额外天赋）'?: string;
  [key: string]: string | undefined;
}

export interface CharacterConstellations {
  [key: string]: string;
}

export interface Character {
  id: string;
  name: string;
  element: Element;
  weaponType: WeaponType | null;
  rarity: number | null;
  region: string | null;
  affiliation: string | null; // 所属组织
  visionAffiliation: string | null; // 神之眼所属地区
  role: string | null; // 定位（如：辅助、输出）
  talents: CharacterTalents | null; // 天赋详情
  constellations: CharacterConstellations | null; // 命之座详情
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

export interface CreateAccountCharacterDto {
  characterId: string;
  level: number;
  constellation?: number;
}

export interface UpdateAccountCharacterDto {
  level?: number;
  constellation?: number;
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
