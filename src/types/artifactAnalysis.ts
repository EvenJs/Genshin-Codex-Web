/**
 * Artifact Analysis Types
 */

export interface MainStatAnalysis {
  rating: 'optimal' | 'good' | 'acceptable' | 'poor';
  comment: string;
}

export interface SubStatAnalysis {
  critValue: number;
  rollQuality: 'high' | 'medium' | 'low';
  effectiveRolls: number;
  highlights: string[];
  weakPoints: string[];
}

export interface ArtifactPotential {
  currentTier: 'endgame' | 'transitional' | 'fodder';
  upgradePriority: 'high' | 'medium' | 'low' | 'skip';
  expectedScoreAt20?: number;
  reasoning: string;
}

export interface ArtifactAnalysisResult {
  artifactId: string;
  overallScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  mainStatAnalysis: MainStatAnalysis;
  subStatAnalysis: SubStatAnalysis;
  potential: ArtifactPotential;
  suitableCharacters: string[];
  recommendations: string[];
  analyzedAt: string;
}

export interface BatchArtifactSummary {
  artifactId: string;
  index: number;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  tier: 'endgame' | 'transitional' | 'fodder';
  keyStrength: string;
  keyWeakness: string;
}

export interface SetAnalysis {
  completeSets: string[];
  recommendation: string;
}

export interface BatchAnalysisResult {
  artifacts: BatchArtifactSummary[];
  ranking: string[];
  setAnalysis: SetAnalysis;
  overallSuggestion: string;
  analyzedAt: string;
}

export interface UpgradeScenario {
  score: number;
  description: string;
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  goodRollProbability: string;
  factors: string[];
}

export interface UpgradeRecommendation {
  shouldUpgrade: boolean;
  priority: 'high' | 'medium' | 'low' | 'skip';
  reasoning: string;
  breakpoint: string;
}

export interface PotentialEvaluationResult {
  artifactId: string;
  currentState: {
    score: number;
    critValue: number;
    subStatCount: number;
  };
  upgradeScenarios: {
    bestCase: UpgradeScenario;
    worstCase: UpgradeScenario;
    averageCase: UpgradeScenario;
  };
  recommendation: UpgradeRecommendation;
  riskAssessment: RiskAssessment;
  analyzedAt: string;
}

// Grade color utilities
export const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  A: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  B: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  C: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  D: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
};

export const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  endgame: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  transitional: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  fodder: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-green-500/20', text: 'text-green-400' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  low: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  skip: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export const RISK_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400' },
};
