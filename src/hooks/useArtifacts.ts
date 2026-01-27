'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { fetcher, publicFetcher, cacheKeys } from '@/lib/swr';
import { apiFetch } from '@/lib/apiClient';
import type {
  UserArtifact,
  UserArtifactsResponse,
  ArtifactStats,
  ArtifactSet,
  CreateArtifactDto,
  UpdateArtifactDto,
  ArtifactSlot,
} from '@/types/artifact';

const DEFAULT_PAGE_SIZE = 20;

export interface ArtifactsParams {
  page?: number;
  pageSize?: number;
  setId?: string;
  slot?: ArtifactSlot;
  rarity?: number;
  locked?: boolean;
  equipped?: boolean;
}

export interface UseArtifactsResult {
  items: UserArtifact[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<UserArtifactsResponse | undefined>;
  createArtifact: (dto: CreateArtifactDto) => Promise<UserArtifact>;
  updateArtifact: (artifactId: string, dto: UpdateArtifactDto) => Promise<UserArtifact>;
  deleteArtifact: (artifactId: string) => Promise<void>;
  toggleLock: (artifactId: string, locked: boolean) => Promise<void>;
}

/**
 * Hook for fetching user artifacts (auth required)
 */
export function useArtifacts(
  accountId: string | null,
  params: ArtifactsParams = {}
): UseArtifactsResult {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, setId, slot, rarity, locked, equipped } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  if (setId) searchParams.set('setId', setId);
  if (slot) searchParams.set('slot', slot);
  if (rarity !== undefined) searchParams.set('rarity', String(rarity));
  if (locked !== undefined) searchParams.set('locked', String(locked));
  if (equipped !== undefined) searchParams.set('equipped', String(equipped));

  const key = accountId ? cacheKeys.accountArtifacts(accountId, searchParams) : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<UserArtifactsResponse>(
    key,
    fetcher,
    {
      keepPreviousData: true,
      dedupingInterval: 5000,
    }
  );

  const createArtifact = useCallback(
    async (dto: CreateArtifactDto): Promise<UserArtifact> => {
      if (!accountId) throw new Error('No account selected');

      const artifact = await apiFetch<UserArtifact>(`/accounts/${accountId}/artifacts`, {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      await mutate();
      return artifact;
    },
    [accountId, mutate]
  );

  const updateArtifact = useCallback(
    async (artifactId: string, dto: UpdateArtifactDto): Promise<UserArtifact> => {
      if (!accountId) throw new Error('No account selected');

      const artifact = await apiFetch<UserArtifact>(
        `/accounts/${accountId}/artifacts/${artifactId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(dto),
        }
      );

      await mutate();
      return artifact;
    },
    [accountId, mutate]
  );

  const deleteArtifact = useCallback(
    async (artifactId: string): Promise<void> => {
      if (!accountId) throw new Error('No account selected');

      await apiFetch(`/accounts/${accountId}/artifacts/${artifactId}`, {
        method: 'DELETE',
      });

      await mutate();
    },
    [accountId, mutate]
  );

  const toggleLock = useCallback(
    async (artifactId: string, locked: boolean): Promise<void> => {
      if (!accountId) return;

      await apiFetch(`/accounts/${accountId}/artifacts/${artifactId}`, {
        method: 'PATCH',
        body: JSON.stringify({ locked }),
      });

      // Optimistically update the cache
      await mutate(
        (currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            items: currentData.items.map((item) =>
              item.id === artifactId ? { ...item, locked } : item
            ),
          };
        },
        { revalidate: true }
      );
    },
    [accountId, mutate]
  );

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isValidating,
    error: error ?? null,
    mutate: () => mutate(),
    createArtifact,
    updateArtifact,
    deleteArtifact,
    toggleLock,
  };
}

export interface UseArtifactStatsResult {
  stats: ArtifactStats | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<ArtifactStats | undefined>;
}

/**
 * Hook for fetching artifact statistics (auth required)
 */
export function useArtifactStats(accountId: string | null): UseArtifactStatsResult {
  const key = accountId ? cacheKeys.accountArtifactStats(accountId) : null;

  const { data, error, isLoading, mutate } = useSWR<ArtifactStats>(key, fetcher, {
    dedupingInterval: 10000,
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error ?? null,
    mutate: () => mutate(),
  };
}

export interface UseArtifactSetsResult {
  sets: ArtifactSet[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching all artifact sets (public, no auth required)
 */
export function useArtifactSets(): UseArtifactSetsResult {
  const { data, error, isLoading } = useSWR<ArtifactSet[]>(
    cacheKeys.artifactSets(),
    publicFetcher,
    {
      dedupingInterval: 60000, // Cache for 1 minute since sets rarely change
      revalidateOnFocus: false,
    }
  );

  return {
    sets: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
