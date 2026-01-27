'use client';

import useSWR from 'swr';
import { fetcher, publicFetcher, cacheKeys } from '@/lib/swr';
import type { Character, AccountCharacter } from '@/types/character';

export interface UseCharactersResult {
  characters: Character[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching all characters (public, no auth required)
 */
export function useCharacters(): UseCharactersResult {
  const { data, error, isLoading } = useSWR<Character[]>(cacheKeys.characters(), publicFetcher, {
    dedupingInterval: 60000, // Cache for 1 minute since characters rarely change
    revalidateOnFocus: false,
  });

  return {
    characters: data ?? [],
    isLoading,
    error: error ?? null,
  };
}

export interface UseAccountCharactersResult {
  characters: AccountCharacter[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<AccountCharacter[] | undefined>;
}

/**
 * Hook for fetching account's characters (auth required)
 */
export function useAccountCharacters(accountId: string | null): UseAccountCharactersResult {
  const key = accountId ? cacheKeys.accountCharacters(accountId) : null;

  const { data, error, isLoading, mutate } = useSWR<AccountCharacter[]>(key, fetcher, {
    dedupingInterval: 5000,
  });

  return {
    characters: data ?? [],
    isLoading,
    error: error ?? null,
    mutate: () => mutate(),
  };
}
