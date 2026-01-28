'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecommendationResult as RecommendationResultType, ScoredArtifact } from '@/types/build';
import { SLOT_NAMES_SHORT, type ArtifactSlot } from '@/types/artifact';

interface RecommendationResultProps {
  result: RecommendationResultType | null;
  isLoading: boolean;
  error: Error | null;
}

export function RecommendationResult({ result, isLoading, error }: RecommendationResultProps) {
  const [expandedSlots, setExpandedSlots] = useState<Set<ArtifactSlot>>(new Set());
  const [showOptimal, setShowOptimal] = useState(true);

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Analyzing your artifacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-destructive">
        <p>Failed to get recommendations: {error.message}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const toggleSlot = (slot: ArtifactSlot) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(slot)) {
      newExpanded.delete(slot);
    } else {
      newExpanded.add(slot);
    }
    setExpandedSlots(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Optimal Set */}
      {result.optimalSet && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <button
            onClick={() => setShowOptimal(!showOptimal)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-genshin-gold" />
              <h3 className="font-semibold text-foreground">Optimal Set</h3>
              <span className="px-2 py-0.5 rounded bg-genshin-gold/20 text-genshin-gold text-sm font-medium">
                Score: {result.optimalSet.totalScore.toFixed(1)}
              </span>
            </div>
            {showOptimal ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showOptimal && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{result.optimalSet.setBonus}</p>
              <div className="grid gap-2">
                {result.optimalSet.artifacts.map((scored) => (
                  <OptimalArtifactRow key={scored.artifact.id} scored={scored} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-Slot Recommendations */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Recommendations by Slot</h3>
        {result.recommendations.map((slotRec) => {
          const isExpanded = expandedSlots.has(slotRec.slot);
          const topArtifact = slotRec.artifacts[0];

          return (
            <div
              key={slotRec.slot}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => toggleSlot(slotRec.slot)}
                className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SlotIcon slot={slotRec.slot} />
                  <span className="font-medium text-foreground">
                    {SLOT_NAMES_SHORT[slotRec.slot]}
                  </span>
                  {topArtifact && (
                    <span className="text-sm text-muted-foreground">
                      Top: {topArtifact.artifact.set.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {topArtifact && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-sm font-medium',
                        getScoreColorClass(topArtifact.score)
                      )}
                    >
                      {topArtifact.score.toFixed(1)}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-3 space-y-2">
                  {slotRec.artifacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No artifacts found for this slot
                    </p>
                  ) : (
                    slotRec.artifacts.map((scored, index) => (
                      <ArtifactRecommendationRow
                        key={scored.artifact.id}
                        scored={scored}
                        rank={index + 1}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlotIcon({ slot }: { slot: ArtifactSlot }) {
  const icons: Record<ArtifactSlot, string> = {
    FLOWER: '🌸',
    PLUME: '🪶',
    SANDS: '⏳',
    GOBLET: '🏆',
    CIRCLET: '👑',
  };
  return <span className="text-lg">{icons[slot]}</span>;
}

function OptimalArtifactRow({ scored }: { scored: ScoredArtifact }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded bg-card border border-border">
      <SlotIcon slot={scored.artifact.slot} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {scored.artifact.set.name}
          </span>
          <span className="text-xs text-muted-foreground">+{scored.artifact.level}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {scored.artifact.mainStat}: {scored.artifact.mainStatValue}
          {scored.mainStatMatch ? (
            <Check className="h-3 w-3 inline ml-1 text-green-500" />
          ) : (
            <X className="h-3 w-3 inline ml-1 text-destructive" />
          )}
        </div>
      </div>
      <span className={cn('px-2 py-0.5 rounded text-sm font-medium', getScoreColorClass(scored.score))}>
        {scored.score.toFixed(1)}
      </span>
    </div>
  );
}

function ArtifactRecommendationRow({ scored, rank }: { scored: ScoredArtifact; rank: number }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded border border-border bg-muted/30 overflow-hidden">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-3 w-full p-2 hover:bg-muted/50 transition-colors"
      >
        <span
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
            rank === 1 && 'bg-genshin-gold/20 text-genshin-gold',
            rank === 2 && 'bg-gray-300/20 text-gray-400',
            rank === 3 && 'bg-amber-700/20 text-amber-700',
            rank > 3 && 'bg-muted text-muted-foreground'
          )}
        >
          {rank}
        </span>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {scored.artifact.set.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {'★'.repeat(scored.artifact.rarity)} +{scored.artifact.level}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            {scored.artifact.mainStat}: {scored.artifact.mainStatValue}
            {scored.mainStatMatch ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-destructive" />
            )}
          </div>
        </div>
        <span className={cn('px-2 py-0.5 rounded text-sm font-medium', getScoreColorClass(scored.score))}>
          {scored.score.toFixed(1)}
        </span>
      </button>

      {showDetails && (
        <div className="border-t border-border p-2 bg-card">
          <div className="text-xs text-muted-foreground mb-1">Sub Stats:</div>
          <div className="grid grid-cols-2 gap-1">
            {scored.subStatScores.map((ss) => (
              <div key={ss.stat} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{ss.stat}</span>
                <span className="text-muted-foreground">
                  {ss.value} ({ss.score.toFixed(1)})
                </span>
              </div>
            ))}
          </div>
          {scored.artifact.equippedBy && (
            <div className="mt-2 text-xs text-muted-foreground">
              Equipped by: {scored.artifact.equippedBy.character.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-genshin-gold/20 text-genshin-gold';
  if (score >= 60) return 'bg-green-500/20 text-green-600';
  if (score >= 40) return 'bg-blue-500/20 text-blue-600';
  if (score >= 20) return 'bg-yellow-500/20 text-yellow-600';
  return 'bg-muted text-muted-foreground';
}
