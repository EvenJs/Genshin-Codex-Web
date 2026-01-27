export type ArtifactSlot = 'FLOWER' | 'PLUME' | 'SANDS' | 'GOBLET' | 'CIRCLET';

export interface SubStat {
  stat: string;
  value: number;
}

export interface ArtifactSet {
  id: string;
  name: string;
  rarity: number[];
  twoPieceBonus: string;
  fourPieceBonus: string | null;
  imageUrl: string | null;
}

export interface ArtifactSetBasic {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface EquippedCharacter {
  id: string;
  character: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface UserArtifact {
  id: string;
  slot: ArtifactSlot;
  mainStat: string;
  mainStatValue: number;
  subStats: SubStat[];
  level: number;
  rarity: number;
  locked: boolean;
  equippedById: string | null;
  createdAt: string;
  set: ArtifactSetBasic;
  equippedBy: EquippedCharacter | null;
}

export interface UserArtifactsResponse {
  items: UserArtifact[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArtifactStats {
  totalCount: number;
  equippedCount: number;
  unequippedCount: number;
  bySlot: Record<ArtifactSlot, number>;
  byRarity: Record<number, number>;
}

export interface CreateArtifactDto {
  setId: string;
  slot: ArtifactSlot;
  mainStat: string;
  mainStatValue: number;
  subStats: SubStat[];
  level: number;
  rarity: number;
  locked?: boolean;
}

export interface UpdateArtifactDto {
  setId?: string;
  slot?: ArtifactSlot;
  mainStat?: string;
  mainStatValue?: number;
  subStats?: SubStat[];
  level?: number;
  rarity?: number;
  locked?: boolean;
  equippedById?: string | null;
}

// Slot display names
export const SLOT_NAMES: Record<ArtifactSlot, string> = {
  FLOWER: 'Flower of Life',
  PLUME: 'Plume of Death',
  SANDS: 'Sands of Eon',
  GOBLET: 'Goblet of Eonothem',
  CIRCLET: 'Circlet of Logos',
};

export const SLOT_NAMES_SHORT: Record<ArtifactSlot, string> = {
  FLOWER: 'Flower',
  PLUME: 'Plume',
  SANDS: 'Sands',
  GOBLET: 'Goblet',
  CIRCLET: 'Circlet',
};

// Main stat options per slot
export const MAIN_STATS_BY_SLOT: Record<ArtifactSlot, string[]> = {
  FLOWER: ['HP'],
  PLUME: ['ATK'],
  SANDS: ['HP%', 'ATK%', 'DEF%', 'Elemental Mastery', 'Energy Recharge%'],
  GOBLET: [
    'HP%',
    'ATK%',
    'DEF%',
    'Elemental Mastery',
    'Pyro DMG%',
    'Hydro DMG%',
    'Electro DMG%',
    'Cryo DMG%',
    'Anemo DMG%',
    'Geo DMG%',
    'Dendro DMG%',
    'Physical DMG%',
  ],
  CIRCLET: [
    'HP%',
    'ATK%',
    'DEF%',
    'Elemental Mastery',
    'Crit Rate%',
    'Crit DMG%',
    'Healing Bonus%',
  ],
};

// All possible sub stats
export const SUB_STATS = [
  'HP',
  'ATK',
  'DEF',
  'HP%',
  'ATK%',
  'DEF%',
  'Elemental Mastery',
  'Energy Recharge%',
  'Crit Rate%',
  'Crit DMG%',
];
