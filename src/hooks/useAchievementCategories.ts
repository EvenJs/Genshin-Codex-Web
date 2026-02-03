'use client';

import useSWR from 'swr';
import { publicFetcher, cacheKeys } from '@/lib/swr';
import type {
  AchievementCategory,
  AchievementCategoryListResponse,
} from '@/types/achievementCategory';

export interface UseCategoriesParams {
  page?: number;
  pageSize?: number;
  includeCount?: boolean;
}

export interface UseCategoriesResult {
  items: AchievementCategory[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<AchievementCategoryListResponse | undefined>;
}

export function useAchievementCategories(
  params: UseCategoriesParams = {}
): UseCategoriesResult {
  const { page = 1, pageSize = 50, includeCount = true } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  searchParams.set('includeCount', String(includeCount));

  const key = cacheKeys.achievementCategories(searchParams);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AchievementCategoryListResponse>(key, publicFetcher, {
      dedupingInterval: 60000, // 1 minute cache
      revalidateOnFocus: false,
    });

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isValidating,
    error: error ?? null,
    mutate: () => mutate(),
  };
}
