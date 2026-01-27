'use client';

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  getToken,
  getRefreshToken,
  setTokens,
  clearAllTokens,
} from '@/lib/authToken';
import { apiFetch } from '@/lib/apiClient';
import type { Account } from '@/types/account';

const SELECTED_ACCOUNT_KEY = 'selected_account_id';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export interface AuthContextType {
  // Auth state
  isLoggedIn: boolean;
  isLoading: boolean;

  // Account state
  accounts: Account[];
  selectedAccountId: string | null;
  selectedAccount: Account | null;
  accountsLoading: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Account actions
  fetchAccounts: () => Promise<Account[]>;
  addAccount: (uid: string, server: string, nickname?: string) => Promise<Account>;
  deleteAccount: (accountId: string) => Promise<void>;
  selectAccount: (accountId: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    setMounted(true);
    const token = getToken();
    setIsLoggedIn(!!token);
    setIsLoading(false);

    if (token) {
      const savedId = localStorage.getItem(SELECTED_ACCOUNT_KEY);
      setSelectedAccountId(savedId);
    }
  }, []);

  // Fetch accounts when logged in
  const fetchAccounts = useCallback(async (): Promise<Account[]> => {
    if (!getToken()) return [];

    setAccountsLoading(true);
    try {
      const data = await apiFetch<Account[]>('/accounts');
      setAccounts(data);
      return data;
    } catch {
      return [];
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  // Load accounts on login
  useEffect(() => {
    if (mounted && isLoggedIn) {
      fetchAccounts();
    }
  }, [mounted, isLoggedIn, fetchAccounts]);

  // Login action
  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || '登录失败');
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    setIsLoggedIn(true);
  }, []);

  // Register action
  const register = useCallback(async (email: string, password: string) => {
    const registerRes = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!registerRes.ok) {
      const text = await registerRes.text();
      throw new Error(text || '注册失败');
    }

    const registerData = await registerRes.json();

    // If response includes tokens, use them
    if (registerData.accessToken && registerData.refreshToken) {
      setTokens(registerData.accessToken, registerData.refreshToken);
      setIsLoggedIn(true);
      return;
    }

    // Otherwise auto-login
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      const text = await loginRes.text();
      throw new Error(text || '自动登录失败，请手动登录');
    }

    const loginData = await loginRes.json();

    if (loginData.accessToken && loginData.refreshToken) {
      setTokens(loginData.accessToken, loginData.refreshToken);
      setIsLoggedIn(true);
    } else {
      throw new Error('登录响应异常，请手动登录');
    }
  }, []);

  // Logout action
  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore logout API errors
    }

    clearAllTokens();
    localStorage.removeItem(SELECTED_ACCOUNT_KEY);
    setIsLoggedIn(false);
    setAccounts([]);
    setSelectedAccountId(null);
  }, []);

  // Add account action
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

      // Select the new account
      setSelectedAccountId(newAccount.id);
      localStorage.setItem(SELECTED_ACCOUNT_KEY, newAccount.id);

      // Refresh accounts list
      await fetchAccounts();

      return newAccount;
    },
    [fetchAccounts]
  );

  // Delete account action
  const deleteAccount = useCallback(
    async (accountId: string) => {
      await apiFetch(`/accounts/${accountId}`, { method: 'DELETE' });

      // Refresh accounts list
      const updated = await fetchAccounts();

      // Handle selected account
      if (selectedAccountId === accountId) {
        if (updated.length > 0) {
          setSelectedAccountId(updated[0].id);
          localStorage.setItem(SELECTED_ACCOUNT_KEY, updated[0].id);
        } else {
          setSelectedAccountId(null);
          localStorage.removeItem(SELECTED_ACCOUNT_KEY);
        }
      }
    },
    [fetchAccounts, selectedAccountId]
  );

  // Select account action
  const selectAccount = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
  }, []);

  // Compute selected account
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      isLoggedIn,
      isLoading,
      accounts,
      selectedAccountId,
      selectedAccount,
      accountsLoading,
      login,
      register,
      logout,
      fetchAccounts,
      addAccount,
      deleteAccount,
      selectAccount,
    }),
    [
      isLoggedIn,
      isLoading,
      accounts,
      selectedAccountId,
      selectedAccount,
      accountsLoading,
      login,
      register,
      logout,
      fetchAccounts,
      addAccount,
      deleteAccount,
      selectAccount,
    ]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
