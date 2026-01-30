import type { ArtifactSlot } from '@/types/artifact';

export const ARTIFACT_STAT_KEY_BY_LABEL: Record<string, string> = {
  HP: 'HP',
  ATK: 'ATK',
  DEF: 'DEF',
  'HP%': 'HP_PERCENT',
  'ATK%': 'ATK_PERCENT',
  'DEF%': 'DEF_PERCENT',
  'Elemental Mastery': 'ELEMENTAL_MASTERY',
  'Energy Recharge%': 'ENERGY_RECHARGE_PERCENT',
  'Pyro DMG%': 'PYRO_DMG_PERCENT',
  'Hydro DMG%': 'HYDRO_DMG_PERCENT',
  'Electro DMG%': 'ELECTRO_DMG_PERCENT',
  'Cryo DMG%': 'CRYO_DMG_PERCENT',
  'Anemo DMG%': 'ANEMO_DMG_PERCENT',
  'Geo DMG%': 'GEO_DMG_PERCENT',
  'Dendro DMG%': 'DENDRO_DMG_PERCENT',
  'Physical DMG%': 'PHYSICAL_DMG_PERCENT',
  'Crit Rate%': 'CRIT_RATE_PERCENT',
  'Crit DMG%': 'CRIT_DMG_PERCENT',
  'Healing Bonus%': 'HEALING_BONUS_PERCENT',
};

export const getArtifactStatLabel = (tStat: (key: string) => string, stat: string): string => {
  const key = ARTIFACT_STAT_KEY_BY_LABEL[stat];
  return key ? tStat(key) : stat;
};

export const getArtifactSlotLabel = (tSlot: (key: string) => string, slot: ArtifactSlot): string =>
  tSlot(slot);

export const getArtifactSlotShortLabel = (
  tSlotShort: (key: string) => string,
  slot: ArtifactSlot
): string => tSlotShort(slot);
