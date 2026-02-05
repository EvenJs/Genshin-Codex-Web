'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/apiClient';
import type {
  ArtifactAnalysisResult,
  BatchAnalysisResult,
  PotentialEvaluationResult,
} from '@/types/artifactAnalysis';

export interface UseArtifactAnalysisResult {
  analysis: ArtifactAnalysisResult | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: Error | null;
  analyze: (options?: { characterId?: string; skipCache?: boolean; language?: string }) => Promise<ArtifactAnalysisResult>;
}

/**
 * Hook for analyzing a single artifact
 */
export function useArtifactAnalysis(
  accountId: string | null,
  artifactId: string | null,
): UseArtifactAnalysisResult {
  const [analysis, setAnalysis] = useState<ArtifactAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(
    async (options?: { characterId?: string; skipCache?: boolean; language?: string }): Promise<ArtifactAnalysisResult> => {
      if (!accountId || !artifactId) {
        throw new Error('Account and artifact IDs are required');
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options?.characterId) {
          params.set('characterId', options.characterId);
        }
        if (options?.skipCache) {
          params.set('skipCache', 'true');
        }
        if (options?.language) {
          params.set('language', options.language);
        }

        const queryString = params.toString();
        const url = `/accounts/${accountId}/artifacts/${artifactId}/analyze${queryString ? `?${queryString}` : ''}`;

        const result = await apiFetch<ArtifactAnalysisResult>(url, {
          method: 'POST',
        });

        setAnalysis(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Analysis failed');
        setError(error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [accountId, artifactId],
  );

  return {
    analysis,
    isLoading: false,
    isAnalyzing,
    error,
    analyze,
  };
}

export interface UsePotentialEvaluationResult {
  potential: PotentialEvaluationResult | null;
  isLoading: boolean;
  isEvaluating: boolean;
  error: Error | null;
  evaluate: (language?: string) => Promise<PotentialEvaluationResult>;
}

/**
 * Hook for evaluating artifact upgrade potential
 */
export function usePotentialEvaluation(
  accountId: string | null,
  artifactId: string | null,
): UsePotentialEvaluationResult {
  const [potential, setPotential] = useState<PotentialEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const evaluate = useCallback(async (language?: string): Promise<PotentialEvaluationResult> => {
    if (!accountId || !artifactId) {
      throw new Error('Account and artifact IDs are required');
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (language) {
        params.set('language', language);
      }
      const url = `/accounts/${accountId}/artifacts/${artifactId}/potential${params.toString() ? `?${params.toString()}` : ''}`;
      const result = await apiFetch<PotentialEvaluationResult>(url);

      setPotential(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Evaluation failed');
      setError(error);
      throw error;
    } finally {
      setIsEvaluating(false);
    }
  }, [accountId, artifactId]);

  return {
    potential,
    isLoading: false,
    isEvaluating,
    error,
    evaluate,
  };
}

export interface UseBatchAnalysisResult {
  batchResult: BatchAnalysisResult | null;
  isAnalyzing: boolean;
  error: Error | null;
  analyzeBatch: (artifactIds: string[], characterId?: string, language?: string) => Promise<BatchAnalysisResult>;
}

/**
 * Hook for batch analyzing multiple artifacts
 */
export function useBatchAnalysis(accountId: string | null): UseBatchAnalysisResult {
  const [batchResult, setBatchResult] = useState<BatchAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeBatch = useCallback(
    async (artifactIds: string[], characterId?: string, language?: string): Promise<BatchAnalysisResult> => {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      if (artifactIds.length === 0) {
        throw new Error('At least one artifact ID is required');
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await apiFetch<BatchAnalysisResult>(
          `/accounts/${accountId}/artifacts/batch-analyze`,
          {
            method: 'POST',
            body: JSON.stringify({ artifactIds, characterId, language }),
          },
        );

        setBatchResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Batch analysis failed');
        setError(error);
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [accountId],
  );

  return {
    batchResult,
    isAnalyzing,
    error,
    analyzeBatch,
  };
}
