'use client';

import { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Lightbulb,
  BarChart3,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArtifactAnalysis, usePotentialEvaluation } from '@/hooks/useArtifactAnalysis';
import type { UserArtifact } from '@/types/artifact';
import type {
  ArtifactAnalysisResult,
  PotentialEvaluationResult,
} from '@/types/artifactAnalysis';
import {
  GRADE_COLORS,
  TIER_COLORS,
  PRIORITY_COLORS,
  RISK_COLORS,
} from '@/types/artifactAnalysis';

interface ArtifactAnalysisProps {
  accountId: string;
  artifact: UserArtifact;
  characterId?: string;
}

export function ArtifactAnalysis({
  accountId,
  artifact,
  characterId,
}: ArtifactAnalysisProps) {
  const [showPotential, setShowPotential] = useState(false);

  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    analyze,
  } = useArtifactAnalysis(accountId, artifact.id);

  const {
    potential,
    isEvaluating,
    error: potentialError,
    evaluate,
  } = usePotentialEvaluation(accountId, artifact.id);

  const handleAnalyze = async () => {
    await analyze({ characterId });
  };

  const handleEvaluatePotential = async () => {
    setShowPotential(true);
    await evaluate();
  };

  const handleRefresh = async () => {
    await analyze({ characterId, skipCache: true });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-genshin-gold" />
          <h3 className="font-semibold text-foreground">AI Analysis</h3>
        </div>
        {analysis && (
          <button
            onClick={handleRefresh}
            disabled={isAnalyzing}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn('h-3 w-3', isAnalyzing && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Initial state - no analysis yet */}
        {!analysis && !isAnalyzing && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered insights about this artifact
            </p>
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 rounded-md bg-genshin-gold/20 px-4 py-2 text-sm font-medium text-genshin-gold hover:bg-genshin-gold/30 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Analyze Artifact
            </button>
          </div>
        )}

        {/* Loading state */}
        {isAnalyzing && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto text-genshin-gold animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing artifact...</p>
          </div>
        )}

        {/* Error state */}
        {analysisError && (
          <div className="text-center py-6">
            <XCircle className="h-8 w-8 mx-auto text-destructive mb-3" />
            <p className="text-sm text-destructive mb-2">Analysis failed</p>
            <p className="text-xs text-muted-foreground mb-4">{analysisError.message}</p>
            <button
              onClick={handleAnalyze}
              className="text-sm text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Analysis result */}
        {analysis && !isAnalyzing && (
          <div className="space-y-4">
            {/* Score and Grade */}
            <ScoreDisplay analysis={analysis} />

            {/* Main Stat Analysis */}
            <MainStatSection analysis={analysis} />

            {/* Sub-Stat Analysis */}
            <SubStatSection analysis={analysis} />

            {/* Potential & Tier */}
            <PotentialSection analysis={analysis} />

            {/* Suitable Characters */}
            <CharactersSection analysis={analysis} />

            {/* Recommendations */}
            <RecommendationsSection analysis={analysis} />

            {/* Upgrade Potential Evaluation */}
            {artifact.level < 20 && (
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => showPotential ? setShowPotential(false) : handleEvaluatePotential()}
                  className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Upgrade Potential Analysis
                  </span>
                  {showPotential ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showPotential && (
                  <div className="mt-3">
                    {isEvaluating ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-5 w-5 mx-auto text-accent animate-spin" />
                      </div>
                    ) : potential ? (
                      <PotentialDisplay potential={potential} />
                    ) : potentialError ? (
                      <p className="text-xs text-destructive">{potentialError.message}</p>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Score Display Component
function ScoreDisplay({ analysis }: { analysis: ArtifactAnalysisResult }) {
  const gradeColor = GRADE_COLORS[analysis.grade];

  return (
    <div className="flex items-center gap-4">
      {/* Grade Badge */}
      <div
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-lg border-2 text-2xl font-bold',
          gradeColor.bg,
          gradeColor.text,
          gradeColor.border,
        )}
      >
        {analysis.grade}
      </div>

      {/* Score */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{analysis.overallScore}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          CV: {analysis.subStatAnalysis.critValue} | Rolls: {analysis.subStatAnalysis.effectiveRolls}
        </p>
      </div>
    </div>
  );
}

// Main Stat Section
function MainStatSection({ analysis }: { analysis: ArtifactAnalysisResult }) {
  const ratingIcons: Record<string, React.ReactNode> = {
    optimal: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    good: <CheckCircle2 className="h-4 w-4 text-blue-400" />,
    acceptable: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    poor: <XCircle className="h-4 w-4 text-red-400" />,
  };

  return (
    <div className="rounded-md bg-muted/30 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Main Stat
        </span>
        <div className="flex items-center gap-1">
          {ratingIcons[analysis.mainStatAnalysis.rating]}
          <span className="text-xs capitalize">{analysis.mainStatAnalysis.rating}</span>
        </div>
      </div>
      <p className="text-sm text-foreground">{analysis.mainStatAnalysis.comment}</p>
    </div>
  );
}

// Sub-Stat Section
function SubStatSection({ analysis }: { analysis: ArtifactAnalysisResult }) {
  const { subStatAnalysis } = analysis;

  return (
    <div className="rounded-md bg-muted/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Sub-Stats
        </span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded',
            subStatAnalysis.rollQuality === 'high'
              ? 'bg-green-500/20 text-green-400'
              : subStatAnalysis.rollQuality === 'medium'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400',
          )}
        >
          {subStatAnalysis.rollQuality} quality
        </span>
      </div>

      <div className="space-y-2">
        {/* Highlights */}
        {subStatAnalysis.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subStatAnalysis.highlights.map((stat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400"
              >
                <CheckCircle2 className="h-3 w-3" />
                {stat}
              </span>
            ))}
          </div>
        )}

        {/* Weak Points */}
        {subStatAnalysis.weakPoints.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {subStatAnalysis.weakPoints.map((stat, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400"
              >
                <XCircle className="h-3 w-3" />
                {stat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Potential Section
function PotentialSection({ analysis }: { analysis: ArtifactAnalysisResult }) {
  const { potential } = analysis;
  const tierColor = TIER_COLORS[potential.currentTier];
  const priorityColor = PRIORITY_COLORS[potential.upgradePriority];

  return (
    <div className="rounded-md bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Assessment
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={cn('text-xs px-2 py-0.5 rounded capitalize', tierColor.bg, tierColor.text)}>
          {potential.currentTier}
        </span>
        <span className={cn('text-xs px-2 py-0.5 rounded', priorityColor.bg, priorityColor.text)}>
          {potential.upgradePriority} priority
        </span>
      </div>

      <p className="text-sm text-foreground">{potential.reasoning}</p>

      {potential.expectedScoreAt20 && (
        <p className="text-xs text-muted-foreground mt-2">
          Expected at +20: ~{potential.expectedScoreAt20} points
        </p>
      )}
    </div>
  );
}

// Characters Section
function CharactersSection({ analysis }: { analysis: ArtifactAnalysisResult }) {
  if (analysis.suitableCharacters.length === 0) return null;

  return (
    <div className="rounded-md bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Suitable For
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {analysis.suitableCharacters.map((char, i) => (
          <span
            key={i}
            className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent"
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

// Recommendations Section
function RecommendationsSection({ analysis }: { analysis: ArtifactAnalysisResult }) {
  if (analysis.recommendations.length === 0) return null;

  return (
    <div className="rounded-md bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recommendations
        </span>
      </div>
      <ul className="space-y-1">
        {analysis.recommendations.map((rec, i) => (
          <li key={i} className="text-sm text-foreground flex items-start gap-2">
            <span className="text-accent mt-1">•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Potential Evaluation Display
function PotentialDisplay({ potential }: { potential: PotentialEvaluationResult }) {
  const { upgradeScenarios, recommendation, riskAssessment } = potential;
  const priorityColor = PRIORITY_COLORS[recommendation.priority];
  const riskColor = RISK_COLORS[riskAssessment.level];

  return (
    <div className="space-y-3">
      {/* Upgrade Scenarios */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded bg-green-500/10 p-2 text-center">
          <div className="text-xs text-green-400 mb-1">Best</div>
          <div className="text-lg font-bold text-green-400">{upgradeScenarios.bestCase.score}</div>
        </div>
        <div className="rounded bg-yellow-500/10 p-2 text-center">
          <div className="text-xs text-yellow-400 mb-1">Average</div>
          <div className="text-lg font-bold text-yellow-400">{upgradeScenarios.averageCase.score}</div>
        </div>
        <div className="rounded bg-red-500/10 p-2 text-center">
          <div className="text-xs text-red-400 mb-1">Worst</div>
          <div className="text-lg font-bold text-red-400">{upgradeScenarios.worstCase.score}</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="rounded bg-muted/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          {recommendation.shouldUpgrade ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
          <span className="text-sm font-medium">
            {recommendation.shouldUpgrade ? 'Upgrade recommended' : 'Skip upgrade'}
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded ml-auto', priorityColor.bg, priorityColor.text)}>
            {recommendation.priority}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{recommendation.reasoning}</p>
        <p className="text-xs">
          <span className="text-muted-foreground">Breakpoint: </span>
          <span className="text-foreground">{recommendation.breakpoint}</span>
        </p>
      </div>

      {/* Risk Assessment */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Risk Level</span>
        <span className={cn('px-2 py-0.5 rounded capitalize', riskColor.bg, riskColor.text)}>
          {riskAssessment.level} ({riskAssessment.goodRollProbability})
        </span>
      </div>
    </div>
  );
}
