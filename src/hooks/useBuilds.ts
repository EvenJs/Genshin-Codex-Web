'use client';

import useSWR from 'swr';
import { useCallback } from 'react';
import { fetcher, publicFetcher, cacheKeys } from '@/lib/swr';
import { apiFetch } from '@/lib/apiClient';
import type {
  Build,
  BuildsResponse,
  SavedBuild,
  SavedBuildsResponse,
  CreateBuildDto,
  UpdateBuildDto,
  SaveBuildDto,
} from '@/types/build';

const DEFAULT_PAGE_SIZE = 20;

export interface BuildsParams {
  page?: number;
  pageSize?: number;
  characterId?: string;
}

export interface UsePublicBuildsResult {
  items: Build[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<BuildsResponse | undefined>;
}

/**
 * Hook for fetching public builds (no auth required)
 */
export function usePublicBuilds(params: BuildsParams = {}): UsePublicBuildsResult {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, characterId } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  if (characterId) searchParams.set('characterId', characterId);

  const key = cacheKeys.builds(searchParams);

  const { data, error, isLoading, isValidating, mutate } = useSWR<BuildsResponse>(
    key,
    publicFetcher,
    {
      keepPreviousData: true,
      dedupingInterval: 5000,
    }
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
  };
}

export interface UseMyBuildsResult {
  items: Build[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<BuildsResponse | undefined>;
  createBuild: (dto: CreateBuildDto) => Promise<Build>;
  updateBuild: (buildId: string, dto: UpdateBuildDto) => Promise<Build>;
  deleteBuild: (buildId: string) => Promise<void>;
}

/**
 * Hook for fetching user's own builds (auth required)
 */
export function useMyBuilds(params: BuildsParams = {}): UseMyBuildsResult {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, characterId } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  if (characterId) searchParams.set('characterId', characterId);

  const key = cacheKeys.myBuilds(searchParams);

  const { data, error, isLoading, isValidating, mutate } = useSWR<BuildsResponse>(key, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 5000,
  });

  const createBuild = useCallback(
    async (dto: CreateBuildDto): Promise<Build> => {
      const build = await apiFetch<Build>('/users/me/builds', {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      await mutate();
      return build;
    },
    [mutate]
  );

  const updateBuild = useCallback(
    async (buildId: string, dto: UpdateBuildDto): Promise<Build> => {
      const build = await apiFetch<Build>(`/users/me/builds/${buildId}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });

      await mutate();
      return build;
    },
    [mutate]
  );

  const deleteBuild = useCallback(
    async (buildId: string): Promise<void> => {
      await apiFetch(`/users/me/builds/${buildId}`, {
        method: 'DELETE',
      });

      await mutate();
    },
    [mutate]
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
    createBuild,
    updateBuild,
    deleteBuild,
  };
}

export interface UseBuildResult {
  build: Build | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<Build | undefined>;
}

/**
 * Hook for fetching a single build by ID
 */
export function useBuild(buildId: string | null): UseBuildResult {
  const key = buildId ? cacheKeys.build(buildId) : null;

  const { data, error, isLoading, mutate } = useSWR<Build>(key, publicFetcher, {
    dedupingInterval: 5000,
  });

  return {
    build: data ?? null,
    isLoading,
    error: error ?? null,
    mutate: () => mutate(),
  };
}

export interface UseSavedBuildsResult {
  items: SavedBuild[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<SavedBuildsResponse | undefined>;
  saveBuild: (dto: SaveBuildDto) => Promise<SavedBuild>;
  unsaveBuild: (savedBuildId: string) => Promise<void>;
}

/**
 * Hook for fetching user's saved builds (auth required)
 */
export function useSavedBuilds(params: BuildsParams = {}): UseSavedBuildsResult {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, characterId } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('page', String(page));
  searchParams.set('pageSize', String(pageSize));
  if (characterId) searchParams.set('characterId', characterId);

  const key = cacheKeys.savedBuilds(searchParams);

  const { data, error, isLoading, isValidating, mutate } = useSWR<SavedBuildsResponse>(
    key,
    fetcher,
    {
      keepPreviousData: true,
      dedupingInterval: 5000,
    }
  );

  const saveBuild = useCallback(
    async (dto: SaveBuildDto): Promise<SavedBuild> => {
      const savedBuild = await apiFetch<SavedBuild>('/users/me/saved-builds', {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      await mutate();
      return savedBuild;
    },
    [mutate]
  );

  const unsaveBuild = useCallback(
    async (savedBuildId: string): Promise<void> => {
      await apiFetch(`/users/me/saved-builds/${savedBuildId}`, {
        method: 'DELETE',
      });

      await mutate();
    },
    [mutate]
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
    saveBuild,
    unsaveBuild,
  };
}
