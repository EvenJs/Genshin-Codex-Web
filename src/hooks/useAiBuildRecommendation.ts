'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import type {
  AiBuildRecommendationResult,
  BuildComparisonResult,
  BuildReasoningResult,
  ApplyBuildResult,
  BuildPreferences,
} from '@/types/aiBuildRecommendation';

export interface AiRecommendParams {
  preferences?: BuildPreferences;
  skipCache?: boolean;
}

export interface CompareBuildsParams {
  buildConfigs: {
    name: string;
    artifactIds: string[];
  }[];
}

export interface UseAiBuildRecommendationResult {
  result: AiBuildRecommendationResult | null;
  isLoading: boolean;
  error: Error | null;
  getRecommendations: (params?: AiRecommendParams) => Promise<AiBuildRecommendationResult | null>;
  refresh: () => Promise<AiBuildRecommendationResult | null>;
}

export interface UseBuildComparisonResult {
  result: BuildComparisonResult | null;
  isLoading: boolean;
  error: Error | null;
  compareBuilds: (params: CompareBuildsParams) => Promise<BuildComparisonResult | null>;
}

export interface UseBuildReasoningResult {
  result: BuildReasoningResult | null;
  isLoading: boolean;
  error: Error | null;
  generateReasoning: (artifactIds: string[]) => Promise<BuildReasoningResult | null>;
}

export interface UseApplyBuildResult {
  isApplying: boolean;
  error: Error | null;
  applyBuild: (artifactSelections: Record<string, string | null>) => Promise<ApplyBuildResult | null>;
}

/**
 * Hook for fetching AI-powered build recommendations
 */
export function useAiBuildRecommendation(
  accountId: string | null,
  characterId: string | null
): UseAiBuildRecommendationResult {
  const [result, setResult] = useState<AiBuildRecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<AiRecommendParams | undefined>();

  const getRecommendations = useCallback(
    async (params?: AiRecommendParams): Promise<AiBuildRecommendationResult | null> => {
      if (!accountId || !characterId) {
        setError(new Error('Account ID and Character ID are required'));
        return null;
      }

      setIsLoading(true);
      setError(null);
      setLastParams(params);

      try {
        const response = await apiClient.post<AiBuildRecommendationResult>(
          `/accounts/${accountId}/characters/${characterId}/ai-recommend`,
          params || {}
        );
        setResult(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get recommendations');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [accountId, characterId]
  );

  const refresh = useCallback(async (): Promise<AiBuildRecommendationResult | null> => {
    return getRecommendations({ ...lastParams, skipCache: true });
  }, [getRecommendations, lastParams]);

  return {
    result,
    isLoading,
    error,
    getRecommendations,
    refresh,
  };
}

/**
 * Hook for comparing multiple build configurations
 */
export function useBuildComparison(
  accountId: string | null,
  characterId: string | null
): UseBuildComparisonResult {
  const [result, setResult] = useState<BuildComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compareBuilds = useCallback(
    async (params: CompareBuildsParams): Promise<BuildComparisonResult | null> => {
      if (!accountId || !characterId) {
        setError(new Error('Account ID and Character ID are required'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<BuildComparisonResult>(
          `/accounts/${accountId}/characters/${characterId}/ai-compare`,
          params
        );
        setResult(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to compare builds');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [accountId, characterId]
  );

  return {
    result,
    isLoading,
    error,
    compareBuilds,
  };
}

/**
 * Hook for generating detailed build reasoning
 */
export function useBuildReasoning(
  accountId: string | null,
  characterId: string | null
): UseBuildReasoningResult {
  const [result, setResult] = useState<BuildReasoningResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateReasoning = useCallback(
    async (artifactIds: string[]): Promise<BuildReasoningResult | null> => {
      if (!accountId || !characterId) {
        setError(new Error('Account ID and Character ID are required'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<BuildReasoningResult>(
          `/accounts/${accountId}/characters/${characterId}/ai-reasoning`,
          { artifactIds }
        );
        setResult(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate reasoning');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [accountId, characterId]
  );

  return {
    result,
    isLoading,
    error,
    generateReasoning,
  };
}

/**
 * Hook for applying a recommended build
 */
export function useApplyBuild(
  accountId: string | null,
  characterId: string | null
): UseApplyBuildResult {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const applyBuild = useCallback(
    async (artifactSelections: Record<string, string | null>): Promise<ApplyBuildResult | null> => {
      if (!accountId || !characterId) {
        setError(new Error('Account ID and Character ID are required'));
        return null;
      }

      setIsApplying(true);
      setError(null);

      try {
        const response = await apiClient.post<ApplyBuildResult>(
          `/accounts/${accountId}/characters/${characterId}/apply-build`,
          artifactSelections
        );
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to apply build');
        setError(error);
        return null;
      } finally {
        setIsApplying(false);
      }
    },
    [accountId, characterId]
  );

  return {
    isApplying,
    error,
    applyBuild,
  };
}
