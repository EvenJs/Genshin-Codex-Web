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

// Element-based gradient backgrounds for cards
export const ELEMENT_GRADIENTS: Record<Element, string> = {
  PYRO: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 100%)',
  HYDRO: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
  ANEMO: 'linear-gradient(180deg, #FFFFFF 0%, #F0FFF4 100%)',
  ELECTRO: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
  DENDRO: 'linear-gradient(180deg, #FFFFFF 0%, #F7FFF0 100%)',
  CRYO: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDFF 100%)',
  GEO: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBF0 100%)',
};

// Dark mode gradients
export const ELEMENT_GRADIENTS_DARK: Record<Element, string> = {
  PYRO: 'linear-gradient(180deg, #1F1F1F 0%, #2A1A1A 100%)',
  HYDRO: 'linear-gradient(180deg, #1F1F1F 0%, #1A2533 100%)',
  ANEMO: 'linear-gradient(180deg, #1F1F1F 0%, #1A2A22 100%)',
  ELECTRO: 'linear-gradient(180deg, #1F1F1F 0%, #251A2A 100%)',
  DENDRO: 'linear-gradient(180deg, #1F1F1F 0%, #222A1A 100%)',
  CRYO: 'linear-gradient(180deg, #1F1F1F 0%, #1A2A2D 100%)',
  GEO: 'linear-gradient(180deg, #1F1F1F 0%, #2A2518 100%)',
};

// Character role types
export type CharacterRole = 'MAIN_DPS' | 'SUB_DPS' | 'SUPPORT' | 'HEALER' | 'SHIELD';

export const ROLE_ICONS: Record<CharacterRole, string> = {
  MAIN_DPS: '⚔️',
  SUB_DPS: '🗡️',
  SUPPORT: '🛡️',
  HEALER: '💚',
  SHIELD: '🔰',
};

export const ROLE_NAMES: Record<CharacterRole, string> = {
  MAIN_DPS: 'Main DPS',
  SUB_DPS: 'Sub DPS',
  SUPPORT: 'Support',
  HEALER: 'Healer',
  SHIELD: 'Shielder',
};
