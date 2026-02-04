'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Package,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBatchAnalysis } from '@/hooks/useArtifactAnalysis';
import type { UserArtifact } from '@/types/artifact';
import type { BatchArtifactSummary } from '@/types/artifactAnalysis';
import { GRADE_COLORS, TIER_COLORS } from '@/types/artifactAnalysis';

interface ArtifactBatchAnalysisProps {
  accountId: string;
  artifacts: UserArtifact[];
  selectedIds: string[];
  characterId?: string;
  onArtifactClick?: (artifactId: string) => void;
}

export function ArtifactBatchAnalysis({
  accountId,
  artifacts,
  selectedIds,
  characterId,
  onArtifactClick,
}: ArtifactBatchAnalysisProps) {
  const { batchResult, isAnalyzing, error, analyzeBatch } = useBatchAnalysis(accountId);
  const [sortBy, setSortBy] = useState<'rank' | 'grade' | 'name'>('rank');

  const handleAnalyze = async () => {
    if (selectedIds.length === 0) return;
    await analyzeBatch(selectedIds, characterId);
  };

  // Create a map of artifact details
  const artifactMap = useMemo(() => {
    const map = new Map<string, UserArtifact>();
    artifacts.forEach((a) => map.set(a.id, a));
    return map;
  }, [artifacts]);

  // Sort artifacts based on analysis results
  const sortedArtifacts = useMemo(() => {
    if (!batchResult) return [];

    let sorted = [...batchResult.artifacts];

    switch (sortBy) {
      case 'rank':
        // Already sorted by ranking in result
        sorted = batchResult.ranking.map(
          (id) => batchResult.artifacts.find((a) => a.artifactId === id)!,
        ).filter(Boolean);
        break;
      case 'grade':
        const gradeOrder = { S: 0, A: 1, B: 2, C: 3, D: 4 };
        sorted.sort((a, b) => gradeOrder[a.grade] - gradeOrder[b.grade]);
        break;
      case 'name':
        sorted.sort((a, b) => {
          const artifactA = artifactMap.get(a.artifactId);
          const artifactB = artifactMap.get(b.artifactId);
          return (artifactA?.set.name || '').localeCompare(artifactB?.set.name || '');
        });
        break;
    }

    return sorted;
  }, [batchResult, sortBy, artifactMap]);

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Batch Analysis</h3>
          <span className="text-xs text-muted-foreground">
            ({selectedIds.length} selected)
          </span>
        </div>

        {batchResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'rank' ? 'grade' : sortBy === 'grade' ? 'name' : 'rank')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="h-3 w-3" />
              Sort: {sortBy}
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Initial state - nothing analyzed yet */}
        {!batchResult && !isAnalyzing && selectedIds.length === 0 && (
          <div className="text-center py-6">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Select artifacts to analyze them together
            </p>
          </div>
        )}

        {/* Ready to analyze */}
        {!batchResult && !isAnalyzing && selectedIds.length > 0 && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Analyze {selectedIds.length} artifacts at once
            </p>
            <button
              onClick={handleAnalyze}
              disabled={selectedIds.length === 0 || selectedIds.length > 20}
              className="inline-flex items-center gap-2 rounded-md bg-accent/20 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              Analyze All ({selectedIds.length})
            </button>
            {selectedIds.length > 20 && (
              <p className="text-xs text-destructive mt-2">Maximum 20 artifacts per batch</p>
            )}
          </div>
        )}

        {/* Loading state */}
        {isAnalyzing && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto text-accent animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">
              Analyzing {selectedIds.length} artifacts...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-6">
            <XCircle className="h-8 w-8 mx-auto text-destructive mb-3" />
            <p className="text-sm text-destructive mb-2">Batch analysis failed</p>
            <p className="text-xs text-muted-foreground mb-4">{error.message}</p>
            <button onClick={handleAnalyze} className="text-sm text-accent hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {batchResult && !isAnalyzing && (
          <div className="space-y-4">
            {/* Overall Suggestion */}
            <div className="rounded-md bg-accent/10 p-3">
              <p className="text-sm text-foreground">{batchResult.overallSuggestion}</p>
            </div>

            {/* Set Analysis */}
            {batchResult.setAnalysis.completeSets.length > 0 && (
              <div className="rounded-md bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-genshin-gold" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Set Bonuses Available
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {batchResult.setAnalysis.completeSets.map((set, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-genshin-gold/20 text-genshin-gold"
                    >
                      {set}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{batchResult.setAnalysis.recommendation}</p>
              </div>
            )}

            {/* Artifact Rankings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Ranking</span>
                <span>{sortedArtifacts.length} artifacts</span>
              </div>

              <div className="space-y-1">
                {sortedArtifacts.map((summary) => (
                  <BatchArtifactRow
                    key={summary.artifactId}
                    summary={summary}
                    artifact={artifactMap.get(summary.artifactId)}
                    rank={batchResult.ranking.indexOf(summary.artifactId) + 1}
                    onClick={() => onArtifactClick?.(summary.artifactId)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual artifact row in batch results
interface BatchArtifactRowProps {
  summary: BatchArtifactSummary;
  artifact?: UserArtifact;
  rank: number;
  onClick?: () => void;
}

function BatchArtifactRow({ summary, artifact, rank, onClick }: BatchArtifactRowProps) {
  const gradeColor = GRADE_COLORS[summary.grade];
  const tierColor = TIER_COLORS[summary.tier];

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-card/50 p-2 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/30',
      )}
    >
      {/* Rank */}
      <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
        #{rank}
      </div>

      {/* Grade */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded text-sm font-bold',
          gradeColor.bg,
          gradeColor.text,
        )}
      >
        {summary.grade}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {artifact?.set.name || 'Unknown Set'}
          </span>
          <span className={cn('text-xs px-1.5 py-0.5 rounded capitalize', tierColor.bg, tierColor.text)}>
            {summary.tier}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{artifact?.slot}</span>
          <span>•</span>
          <span>+{artifact?.level}</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="text-lg font-bold text-foreground">{summary.score}</div>
        <div className="text-xs text-muted-foreground">score</div>
      </div>

      {/* Strength/Weakness */}
      <div className="hidden sm:block w-32 text-xs">
        <div className="flex items-center gap-1 text-green-400 truncate">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{summary.keyStrength}</span>
        </div>
        {summary.keyWeakness !== 'none' && (
          <div className="flex items-center gap-1 text-red-400 truncate">
            <XCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{summary.keyWeakness}</span>
          </div>
        )}
      </div>
    </div>
  );
}
