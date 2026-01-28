'use client';

import useSWR from 'swr';
import { cacheKeys, fetcher } from '@/lib/swr';
import type { RecommendationResult } from '@/types/build';

export interface RecommendationParams {
  buildId?: string;
  limit?: number;
}

export interface UseRecommendationsResult {
  result: RecommendationResult | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<RecommendationResult | undefined>;
}

/**
 * Hook for fetching artifact recommendations for a character (auth required)
 */
export function useRecommendations(
  accountId: string | null,
  characterId: string | null,
  params: RecommendationParams = {}
): UseRecommendationsResult {
  const { buildId, limit } = params;

  const searchParams = new URLSearchParams();
  if (buildId) searchParams.set('buildId', buildId);
  if (limit !== undefined) searchParams.set('limit', String(limit));

  const key =
    accountId && characterId
      ? cacheKeys.recommendations(
          accountId,
          characterId,
          searchParams.toString() ? searchParams : undefined
        )
      : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<RecommendationResult>(
    key,
    fetcher,
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  );

  return {
    result: data ?? null,
    isLoading,
    isValidating,
    error: error ?? null,
    mutate: () => mutate(),
  };
}
