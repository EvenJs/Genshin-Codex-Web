import type { Character } from './character';
import type { ArtifactSet, ArtifactSlot, UserArtifact } from './artifact';

export interface BuildCreator {
  id: string;
  email: string;
}

export interface RecommendedMainStats {
  SANDS?: string;
  GOBLET?: string;
  CIRCLET?: string;
}

export interface StatWeights {
  critRate?: number;
  critDmg?: number;
  atk?: number;
  atkPercent?: number;
  def?: number;
  defPercent?: number;
  hp?: number;
  hpPercent?: number;
  em?: number;
  er?: number;
}

export interface Build {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  useFullSet: boolean;
  recommendedMainStats: RecommendedMainStats;
  subStatPriority: string[];
  statWeights: StatWeights | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  character: Character;
  creator: BuildCreator;
  primarySet: ArtifactSet;
  secondarySet: ArtifactSet | null;
  saveCount: number;
}

export interface SavedBuild {
  id: string;
  userId: string;
  buildId: string;
  notes: string | null;
  createdAt: string;
  build: Build;
}

export interface BuildsResponse {
  items: Build[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SavedBuildsResponse {
  items: SavedBuild[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateBuildDto {
  name: string;
  description?: string;
  characterId: string;
  isPublic?: boolean;
  primarySetId: string;
  secondarySetId?: string;
  useFullSet?: boolean;
  recommendedMainStats: RecommendedMainStats;
  subStatPriority: string[];
  statWeights?: StatWeights;
  notes?: string;
}

export interface UpdateBuildDto {
  name?: string;
  description?: string;
  characterId?: string;
  isPublic?: boolean;
  primarySetId?: string;
  secondarySetId?: string;
  useFullSet?: boolean;
  recommendedMainStats?: RecommendedMainStats;
  subStatPriority?: string[];
  statWeights?: StatWeights;
  notes?: string;
}

export interface SaveBuildDto {
  buildId: string;
  notes?: string;
}

// Recommendation types
export interface SubStatScore {
  stat: string;
  value: number;
  score: number;
}

export interface ScoredArtifact {
  artifact: UserArtifact;
  score: number;
  mainStatMatch: boolean;
  subStatScores: SubStatScore[];
}

export interface SlotRecommendation {
  slot: ArtifactSlot;
  artifacts: ScoredArtifact[];
}

export interface OptimalSet {
  artifacts: ScoredArtifact[];
  totalScore: number;
  setBonus: string;
}

export interface RecommendationBuild {
  id: string;
  name: string;
  useFullSet: boolean;
  primarySet: ArtifactSet;
  secondarySet: ArtifactSet | null;
  recommendedMainStats: RecommendedMainStats;
  subStatPriority: string[];
}

export interface RecommendationResult {
  build: RecommendationBuild;
  character: Character;
  recommendations: SlotRecommendation[];
  optimalSet: OptimalSet | null;
}

// Default stat weights for reference
export const DEFAULT_STAT_WEIGHTS: StatWeights = {
  critRate: 2,
  critDmg: 1,
  atk: 0.1,
  atkPercent: 0.5,
  def: 0,
  defPercent: 0,
  hp: 0,
  hpPercent: 0,
  em: 0.3,
  er: 0.3,
};

// Priority stat display names
export const STAT_PRIORITY_OPTIONS = [
  'Crit Rate%',
  'Crit DMG%',
  'ATK%',
  'ATK',
  'DEF%',
  'DEF',
  'HP%',
  'HP',
  'Elemental Mastery',
  'Energy Recharge%',
];

// Stat weight keys mapping
export const STAT_WEIGHT_KEYS: Record<string, keyof StatWeights> = {
  'Crit Rate%': 'critRate',
  'Crit DMG%': 'critDmg',
  'ATK%': 'atkPercent',
  ATK: 'atk',
  'DEF%': 'defPercent',
  DEF: 'def',
  'HP%': 'hpPercent',
  HP: 'hp',
  'Elemental Mastery': 'em',
  'Energy Recharge%': 'er',
};
