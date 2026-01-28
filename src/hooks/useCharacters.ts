'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { apiFetch } from '@/lib/apiClient';
import { fetcher, publicFetcher, cacheKeys } from '@/lib/swr';
import type { Character, AccountCharacter, CreateAccountCharacterDto, UpdateAccountCharacterDto } from '@/types/character';

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
  createCharacter: (data: CreateAccountCharacterDto) => Promise<AccountCharacter>;
  updateCharacter: (characterId: string, data: UpdateAccountCharacterDto) => Promise<AccountCharacter>;
  deleteCharacter: (characterId: string) => Promise<void>;
}

/**
 * Hook for fetching account's characters (auth required)
 */
export function useAccountCharacters(accountId: string | null): UseAccountCharactersResult {
  const key = accountId ? cacheKeys.accountCharacters(accountId) : null;

  const { data, error, isLoading, mutate } = useSWR<AccountCharacter[]>(key, fetcher, {
    dedupingInterval: 5000,
  });

  const createCharacter = useCallback(
    async (dto: CreateAccountCharacterDto): Promise<AccountCharacter> => {
      if (!accountId) throw new Error('No account selected');
      const result = await apiFetch<AccountCharacter>(
        `/accounts/${accountId}/characters`,
        {
          method: 'POST',
          body: JSON.stringify(dto),
        }
      );
      await mutate();
      return result;
    },
    [accountId, mutate]
  );

  const updateCharacter = useCallback(
    async (characterId: string, dto: UpdateAccountCharacterDto): Promise<AccountCharacter> => {
      if (!accountId) throw new Error('No account selected');
      const result = await apiFetch<AccountCharacter>(
        `/accounts/${accountId}/characters/${characterId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(dto),
        }
      );
      await mutate();
      return result;
    },
    [accountId, mutate]
  );

  const deleteCharacter = useCallback(
    async (characterId: string): Promise<void> => {
      if (!accountId) throw new Error('No account selected');
      await apiFetch(`/accounts/${accountId}/characters/${characterId}`, {
        method: 'DELETE',
      });
      await mutate();
    },
    [accountId, mutate]
  );

  return {
    characters: data ?? [],
    isLoading,
    error: error ?? null,
    mutate: () => mutate(),
    createCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
