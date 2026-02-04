import type { Character } from './character';

export interface BuildPreferences {
  prioritizeDamage?: boolean;
  prioritizeSurvival?: boolean;
  prioritizeSupport?: boolean;
  specificRole?: string;
}

export interface BuildArtifactSelection {
  artifactId: string | null;
  score: number;
  notes: string;
}

export interface SetConfiguration {
  type: '4piece' | '2plus2' | 'rainbow';
  primarySet: string;
  secondarySet: string | null;
  setBonus: string;
}

export interface RecommendedMainStats {
  SANDS: string;
  GOBLET: string;
  CIRCLET: string;
}

export interface StatSummary {
  estimatedCritRate: string;
  estimatedCritDmg: string;
  otherKeyStats: string[];
}

export interface RecommendedBuild {
  name: string;
  description: string;
  priority: number;
  setConfiguration: SetConfiguration;
  recommendedMainStats: RecommendedMainStats;
  subStatPriority: string[];
  selectedArtifacts: {
    FLOWER: BuildArtifactSelection;
    PLUME: BuildArtifactSelection;
    SANDS: BuildArtifactSelection;
    GOBLET: BuildArtifactSelection;
    CIRCLET: BuildArtifactSelection;
  };
  totalScore: number;
  statSummary: StatSummary;
  reasoning: string;
  improvements: string[];
  viability: 'excellent' | 'good' | 'workable' | 'needs-improvement';
}

export interface OverallAnalysis {
  inventoryQuality: 'excellent' | 'good' | 'average' | 'limited';
  bestBuildIndex: number;
  farmingSuggestions: string[];
  keyMissingPieces: string[];
}

export interface AiBuildRecommendationResult {
  character: Character;
  builds: RecommendedBuild[];
  overallAnalysis: OverallAnalysis;
  generatedAt: string;
  aiGenerated: boolean;
}

export interface BuildComparisonBuild {
  index: number;
  name: string;
  overallScore: number;
  damageScore: number;
  consistencyScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ComparisonWinner {
  index: number;
  name: string;
  marginOfVictory: 'small' | 'moderate' | 'significant';
  explanation: string;
}

export interface SituationalNotes {
  forBossRush: number;
  forAbyss: number;
  forOverworld: number;
  reasoning: string;
}

export interface BuildComparisonResult {
  comparison: {
    builds: BuildComparisonBuild[];
    winner: ComparisonWinner;
    situationalNotes: SituationalNotes;
    improvements: {
      buildIndex: number;
      suggestion: string;
    }[];
  };
}

export interface BuildReasoningResult {
  reasoning: {
    setChoice: {
      explanation: string;
      alternativeSets: string[];
      setScore: number;
    };
    mainStats: {
      SANDS: { chosen: string; optimal: string; assessment: string };
      GOBLET: { chosen: string; optimal: string; assessment: string };
      CIRCLET: { chosen: string; optimal: string; assessment: string };
    };
    subStats: {
      totalCritValue: number;
      effectiveSubStats: number;
      wastedStats: string[];
      assessment: string;
    };
    synergy: {
      withKit: string;
      withTeam: string;
      playstyleNotes: string;
    };
    overallVerdict: {
      rating: 'S' | 'A' | 'B' | 'C' | 'D';
      summary: string;
      priorities: string[];
    };
  };
}

export interface ApplyBuildResult {
  success: boolean;
  equipped: string[];
  errors: string[];
}

// Color mappings for UI
export const VIABILITY_COLORS: Record<RecommendedBuild['viability'], { bg: string; text: string }> = {
  excellent: { bg: 'bg-green-500/20', text: 'text-green-400' },
  good: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  workable: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  'needs-improvement': { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export const INVENTORY_QUALITY_COLORS: Record<OverallAnalysis['inventoryQuality'], { bg: string; text: string }> = {
  excellent: { bg: 'bg-green-500/20', text: 'text-green-400' },
  good: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  average: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  limited: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export const SET_TYPE_LABELS: Record<SetConfiguration['type'], string> = {
  '4piece': '4-Piece Set',
  '2plus2': '2+2 Combination',
  rainbow: 'Rainbow Build',
};

export const RATING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: 'bg-genshin-gold/20', text: 'text-genshin-gold', border: 'border-genshin-gold' },
  A: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  B: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  C: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  D: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
};
