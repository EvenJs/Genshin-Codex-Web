'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trophy,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Play,
  Layers,
  BarChart3,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAiBuildRecommendation,
  useApplyBuild,
} from '@/hooks/useAiBuildRecommendation';
import type {
  RecommendedBuild,
  AiBuildRecommendationResult,
  BuildArtifactSelection,
} from '@/types/aiBuildRecommendation';
import {
  VIABILITY_COLORS,
  INVENTORY_QUALITY_COLORS,
} from '@/types/aiBuildRecommendation';
import type { ArtifactSlot } from '@/types/artifact';
import { AiFeedback } from '@/components/ai/AiFeedback';

interface AiBuildRecommendationProps {
  accountId: string;
  characterId: string;
  characterName: string;
  onBuildApplied?: () => void;
}

const SLOT_ICONS: Record<ArtifactSlot, string> = {
  FLOWER: '🌸',
  PLUME: '🪶',
  SANDS: '⏳',
  GOBLET: '🏆',
  CIRCLET: '👑',
};

export function AiBuildRecommendation({
  accountId,
  characterId,
  characterName,
  onBuildApplied,
}: AiBuildRecommendationProps) {
  const t = useTranslations('aiBuild');
  const locale = useLocale();
  const [expandedBuild, setExpandedBuild] = useState<number | null>(null);

  const {
    result,
    isLoading,
    error,
    getRecommendations,
    refresh,
  } = useAiBuildRecommendation(accountId, characterId, locale);

  const {
    isApplying,
    error: applyError,
    applyBuild,
  } = useApplyBuild(accountId, characterId);

  const handleGetRecommendations = async () => {
    await getRecommendations();
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const handleApplyBuild = async (build: RecommendedBuild) => {
    const artifactSelections: Record<string, string | null> = {};
    const slots: ArtifactSlot[] = ['FLOWER', 'PLUME', 'SANDS', 'GOBLET', 'CIRCLET'];

    for (const slot of slots) {
      artifactSelections[slot] = build.selectedArtifacts[slot].artifactId;
    }

    const result = await applyBuild(artifactSelections);
    if (result?.success) {
      onBuildApplied?.();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-genshin-gold" />
          <h3 className="font-semibold text-foreground">{t('title')}</h3>
        </div>
        {result && (
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            {t('refresh')}
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Initial state */}
        {!result && !isLoading && !error && (
          <InitialState
            characterName={characterName}
            onAnalyze={handleGetRecommendations}
          />
        )}

        {/* Loading state */}
        {isLoading && <LoadingState />}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState error={error} onRetry={handleGetRecommendations} />
        )}

        {/* Results */}
        {result && !isLoading && (
          <RecommendationResults
            result={result}
            expandedBuild={expandedBuild}
            setExpandedBuild={setExpandedBuild}
            onApplyBuild={handleApplyBuild}
            isApplying={isApplying}
            applyError={applyError}
          />
        )}
      </div>
    </div>
  );
}

function InitialState({
  characterName,
  onAnalyze,
}: {
  characterName: string;
  onAnalyze: () => void;
}) {
  const t = useTranslations('aiBuild');
  return (
    <div className="text-center py-8">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <Sparkles className="h-20 w-20 text-muted-foreground/30" />
        <Target className="h-8 w-8 text-genshin-gold absolute bottom-0 right-0" />
      </div>
      <h4 className="font-medium text-foreground mb-2">
        {t('initialTitle', { name: characterName })}
      </h4>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {t('initialDescription')}
      </p>
      <button
        onClick={onAnalyze}
        className="inline-flex items-center gap-2 rounded-md bg-genshin-gold/20 px-5 py-2.5 text-sm font-medium text-genshin-gold hover:bg-genshin-gold/30 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        {t('initialAction')}
      </button>
    </div>
  );
}

function LoadingState() {
  const t = useTranslations('aiBuild');
  return (
    <div className="text-center py-12">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <Loader2 className="h-16 w-16 text-genshin-gold animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{t('loadingTitle')}</p>
      <p className="text-xs text-muted-foreground/70">{t('loadingSubtitle')}</p>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const t = useTranslations('aiBuild');
  return (
    <div className="text-center py-8">
      <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-3" />
      <p className="text-sm text-destructive mb-2">{t('errorTitle')}</p>
      <p className="text-xs text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={onRetry}
        className="text-sm text-accent hover:underline"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}

function RecommendationResults({
  result,
  expandedBuild,
  setExpandedBuild,
  onApplyBuild,
  isApplying,
  applyError,
}: {
  result: AiBuildRecommendationResult;
  expandedBuild: number | null;
  setExpandedBuild: (index: number | null) => void;
  onApplyBuild: (build: RecommendedBuild) => void;
  isApplying: boolean;
  applyError: Error | null;
}) {
  const t = useTranslations('aiBuild');
  const qualityColor = INVENTORY_QUALITY_COLORS[result.overallAnalysis.inventoryQuality];

  return (
    <div className="space-y-4">
      {/* Overall Analysis Summary */}
      <div className="rounded-md bg-muted/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('inventoryAssessment')}
            </span>
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded capitalize', qualityColor.bg, qualityColor.text)}>
            {t(`inventoryQuality.${result.overallAnalysis.inventoryQuality}`)}
          </span>
        </div>
        {result.overallAnalysis.farmingSuggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">{t('farmingSuggestions')}</p>
            <div className="flex flex-wrap gap-1">
              {result.overallAnalysis.farmingSuggestions.map((suggestion, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}
        {result.aiGenerated && (
          <div className="flex items-center gap-1 mt-2 text-xs text-genshin-gold">
            <Sparkles className="h-3 w-3" />
            {t('aiGenerated')}
          </div>
        )}
      </div>

      {/* Build Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">{t('recommendedBuilds')}</h4>
        </div>

        {result.builds.map((build, index) => (
          <BuildCard
            key={index}
            build={build}
            index={index}
            isBest={index === result.overallAnalysis.bestBuildIndex}
            isExpanded={expandedBuild === index}
            onToggle={() => setExpandedBuild(expandedBuild === index ? null : index)}
            onApply={() => onApplyBuild(build)}
            isApplying={isApplying}
          />
        ))}
      </div>

      {/* Apply Error */}
      {applyError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {t('applyFailed', { message: applyError.message })}
        </div>
      )}

      {/* Missing Pieces */}
      {result.overallAnalysis.keyMissingPieces.length > 0 && (
        <div className="rounded-md bg-muted/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('missingPieces')}
            </span>
          </div>
          <ul className="space-y-1">
            {result.overallAnalysis.keyMissingPieces.map((piece, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{piece}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.aiResultId && (
        <AiFeedback aiResultId={result.aiResultId} />
      )}
    </div>
  );
}

function BuildCard({
  build,
  index,
  isBest,
  isExpanded,
  onToggle,
  onApply,
  isApplying,
}: {
  build: RecommendedBuild;
  index: number;
  isBest: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onApply: () => void;
  isApplying: boolean;
}) {
  const t = useTranslations('aiBuild');
  const viabilityColor = VIABILITY_COLORS[build.viability];

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-colors',
        isBest ? 'border-genshin-gold/50 bg-genshin-gold/5' : 'border-border bg-card'
      )}
    >
      {/* Build Header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isBest && <Trophy className="h-5 w-5 text-genshin-gold" />}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{build.name}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded', viabilityColor.bg, viabilityColor.text)}>
                {t(`viability.${build.viability}`)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(`setType.${build.setConfiguration.type}`)} • {build.setConfiguration.primarySet}
              {build.setConfiguration.secondarySet && ` + ${build.setConfiguration.secondarySet}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">{build.totalScore}</div>
            <div className="text-xs text-muted-foreground">{t('scoreLabel')}</div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground">{build.description}</p>

          {/* Set Bonus */}
          <div className="rounded-md bg-muted/30 p-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {t('setBonus')}
            </div>
            <p className="text-sm text-foreground">{build.setConfiguration.setBonus}</p>
          </div>

          {/* Stat Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('estimatedStats')}
                </span>
              </div>
              <div className="text-sm text-foreground">
                <div>{t('critRateShort')}: {build.statSummary.estimatedCritRate}</div>
                <div>{t('critDmgShort')}: {build.statSummary.estimatedCritDmg}</div>
              </div>
            </div>
            <div className="rounded-md bg-muted/30 p-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                {t('recommendedMainStats')}
              </div>
              <div className="text-xs text-foreground space-y-0.5">
                <div>{t('slot.SANDS')}: {build.recommendedMainStats.SANDS}</div>
                <div>{t('slot.GOBLET')}: {build.recommendedMainStats.GOBLET}</div>
                <div>{t('slot.CIRCLET')}: {build.recommendedMainStats.CIRCLET}</div>
              </div>
            </div>
          </div>

          {/* Sub-Stat Priority */}
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {t('subStatPriority')}
            </div>
            <div className="flex flex-wrap gap-1">
              {build.subStatPriority.map((stat, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    i === 0 ? 'bg-genshin-gold/20 text-genshin-gold' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {i + 1}. {stat}
                </span>
              ))}
            </div>
          </div>

          {/* Selected Artifacts */}
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {t('selectedArtifacts')}
            </div>
            <div className="grid gap-2">
              {(['FLOWER', 'PLUME', 'SANDS', 'GOBLET', 'CIRCLET'] as ArtifactSlot[]).map((slot) => (
                <ArtifactSlotRow
                  key={slot}
                  slot={slot}
                  selection={build.selectedArtifacts[slot]}
                />
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div className="rounded-md bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('aiReasoning')}
              </span>
            </div>
            <p className="text-sm text-foreground">{build.reasoning}</p>
          </div>

          {/* Improvements */}
          {build.improvements.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {t('improvements')}
              </div>
              <ul className="space-y-1">
                {build.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={onApply}
            disabled={isApplying}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('applying')}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {t('applyBuild')}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ArtifactSlotRow({
  slot,
  selection,
}: {
  slot: ArtifactSlot;
  selection: BuildArtifactSelection;
}) {
  const t = useTranslations('aiBuild');
  const hasArtifact = selection.artifactId !== null;

  return (
    <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
      <span className="text-lg">{SLOT_ICONS[slot]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground capitalize">
            {t(`slot.${slot}`)}
          </span>
          {hasArtifact ? (
            <CheckCircle2 className="h-3 w-3 text-green-400" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-yellow-400" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{selection.notes}</p>
      </div>
      {hasArtifact && (
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            selection.score >= 80
              ? 'bg-genshin-gold/20 text-genshin-gold'
              : selection.score >= 60
                ? 'bg-green-500/20 text-green-400'
                : selection.score >= 40
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-muted text-muted-foreground'
          )}
        >
          {selection.score}
        </span>
      )}
    </div>
  );
}
