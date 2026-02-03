'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { publicFetcher, fetcher, cacheKeys } from '@/lib/swr';
import { apiFetch } from '@/lib/apiClient';
import type { Achievement, AchievementListResponse } from '@/types/achievement';
import type { UserAchievement, UserAchievementsResponse } from '@/types/account';

const DEFAULT_PAGE_SIZE = 20;

export interface AchievementsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  categoryId?: string;
  region?: string;
}

export interface UsePublicAchievementsResult {
  items: Achievement[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<AchievementListResponse | undefined>;
}

/**
 * Hook for fetching public achievements (no auth required)
 */
export function usePublicAchievements(
  params: AchievementsParams = {}
): UsePublicAchievementsResult {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, q, category, categoryId, region } = params;
  const safePageSize = Math.min(pageSize, 100);

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(safePageSize));
  if (q) searchParams.set('q', q);
  if (category) searchParams.set('category', category);
  if (categoryId) searchParams.set('categoryId', categoryId);
  if (region) searchParams.set('region', region);

  const key = cacheKeys.achievements(searchParams);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AchievementListResponse>(key, publicFetcher, {
      keepPreviousData: true,
      dedupingInterval: 10000,
    });

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? safePageSize,
    isLoading,
    isValidating,
    error: error ?? null,
    mutate: () => mutate(),
  };
}

export interface UseUserAchievementsResult {
  items: UserAchievement[];
  total: number;
  page: number;
  pageSize: number;
  stats: UserAchievementsResponse['stats'] | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<UserAchievementsResponse | undefined>;
  toggleCompletion: (achievementId: string, completed: boolean) => Promise<void>;
}

/**
 * Hook for fetching user achievements (auth required)
 */
export function useUserAchievements(
  accountId: string | null,
  params: AchievementsParams = {}
): UseUserAchievementsResult {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, q, category, categoryId, region } = params;
  const safePageSize = Math.min(pageSize, 100);

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(safePageSize));
  if (q) searchParams.set('q', q);
  if (category) searchParams.set('category', category);
  if (categoryId) searchParams.set('categoryId', categoryId);
  if (region) searchParams.set('region', region);

  const key = accountId ? cacheKeys.accountAchievements(accountId, searchParams) : null;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<UserAchievementsResponse>(key, fetcher, {
      keepPreviousData: true,
      dedupingInterval: 5000,
    });

  const toggleCompletion = useCallback(
    async (achievementId: string, completed: boolean): Promise<void> => {
      if (!accountId) return;

      await apiFetch(`/accounts/${accountId}/progress/${achievementId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      });

      // Optimistically update the cache
      await mutate(
        (currentData) => {
          if (!currentData) return currentData;

          const updatedItems = currentData.items.map((item) =>
            item.id === achievementId ? { ...item, completed } : item
          );

          const completedDelta = completed ? 1 : -1;
          const achievement = currentData.items.find((i) => i.id === achievementId);
          const primoDelta = achievement ? achievement.rewardPrimogems * completedDelta : 0;

          return {
            ...currentData,
            items: updatedItems,
            stats: {
              ...currentData.stats,
              completedCount: currentData.stats.completedCount + completedDelta,
              incompleteCount: currentData.stats.incompleteCount - completedDelta,
              primogemsEarned: currentData.stats.primogemsEarned + primoDelta,
            },
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
    pageSize: data?.pageSize ?? safePageSize,
    stats: data?.stats ?? null,
    isLoading,
    isValidating,
    error: error ?? null,
    mutate: () => mutate(),
    toggleCompletion,
  };
}
