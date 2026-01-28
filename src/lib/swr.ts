'use client';

import type { SWRConfiguration } from 'swr';
import { apiFetch, ApiError } from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/**
 * Default fetcher for authenticated API requests
 * Uses apiFetch which handles token management and refresh
 */
export const fetcher = <T>(path: string): Promise<T> => {
  return apiFetch<T>(path);
};

/**
 * Public fetcher for unauthenticated API requests
 * Does not include auth headers
 */
export const publicFetcher = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

/**
 * Global SWR configuration
 */
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  shouldRetryOnError: (error) => {
    // Don't retry on 401/403 errors
    if (error instanceof ApiError) {
      return error.status !== 401 && error.status !== 403;
    }
    return true;
  },
};

/**
 * Cache key generators for consistent key naming
 */
export const cacheKeys = {
  accounts: () => '/accounts',
  account: (id: string) => `/accounts/${id}`,
  accountAchievements: (accountId: string, params?: URLSearchParams) => {
    const base = `/accounts/${accountId}/achievements`;
    return params ? `${base}?${params.toString()}` : base;
  },
  achievements: (params?: URLSearchParams) => {
    const base = '/achievements';
    return params ? `${base}?${params.toString()}` : base;
  },
  // Artifacts
  artifactSets: () => '/artifact-sets',
  artifactSet: (id: string) => `/artifact-sets/${id}`,
  accountArtifacts: (accountId: string, params?: URLSearchParams) => {
    const base = `/accounts/${accountId}/artifacts`;
    return params ? `${base}?${params.toString()}` : base;
  },
  accountArtifactStats: (accountId: string) =>
    `/accounts/${accountId}/artifacts/stats`,
  accountArtifact: (accountId: string, artifactId: string) =>
    `/accounts/${accountId}/artifacts/${artifactId}`,
  // Characters
  characters: () => '/characters',
  character: (id: string) => `/characters/${id}`,
  accountCharacters: (accountId: string) => `/accounts/${accountId}/characters`,
  accountCharacter: (accountId: string, characterId: string) =>
    `/accounts/${accountId}/characters/${characterId}`,
  // Builds
  builds: (params?: URLSearchParams) => {
    const base = '/builds';
    return params ? `${base}?${params.toString()}` : base;
  },
  build: (id: string) => `/builds/${id}`,
  myBuilds: (params?: URLSearchParams) => {
    const base = '/users/me/builds';
    return params ? `${base}?${params.toString()}` : base;
  },
  savedBuilds: (params?: URLSearchParams) => {
    const base = '/users/me/saved-builds';
    return params ? `${base}?${params.toString()}` : base;
  },
  // Recommendations
  recommendations: (accountId: string, characterId: string, params?: URLSearchParams) => {
    const base = `/accounts/${accountId}/characters/${characterId}/recommend`;
    return params ? `${base}?${params.toString()}` : base;
  },
};
