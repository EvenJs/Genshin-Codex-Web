'use client';

import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import { fetcher, cacheKeys } from '@/lib/swr';
import { apiFetch } from '@/lib/apiClient';
import { getToken } from '@/lib/authToken';
import type { Account } from '@/types/account';

export interface UseAccountsResult {
  accounts: Account[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: () => Promise<Account[] | undefined>;
  addAccount: (uid: string, server: string, nickname?: string) => Promise<Account>;
  deleteAccount: (accountId: string) => Promise<void>;
}

export function useAccounts(): UseAccountsResult {
  const hasToken = typeof window !== 'undefined' && !!getToken();

  const { data, error, isLoading, isValidating, mutate } = useSWR<Account[]>(
    hasToken ? cacheKeys.accounts() : null,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const accounts = useMemo(() => data ?? [], [data]);

  const addAccount = useCallback(
    async (uid: string, server: string, nickname?: string): Promise<Account> => {
      const newAccount = await apiFetch<Account>('/accounts', {
        method: 'POST',
        body: JSON.stringify({
          uid: uid.trim(),
          server,
          nickname: nickname?.trim() || null,
        }),
      });

      // Revalidate accounts list
      await mutate();

      return newAccount;
    },
    [mutate]
  );

  const deleteAccount = useCallback(
    async (accountId: string): Promise<void> => {
      await apiFetch(`/accounts/${accountId}`, { method: 'DELETE' });

      // Optimistically update the cache
      await mutate(
        (currentAccounts) =>
          currentAccounts?.filter((account) => account.id !== accountId),
        { revalidate: true }
      );
    },
    [mutate]
  );

  return {
    accounts,
    isLoading,
    isValidating,
    error: error ?? null,
    mutate: () => mutate(),
    addAccount,
    deleteAccount,
  };
}
