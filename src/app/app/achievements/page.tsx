'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken } from '@/lib/authToken';
import { apiFetch } from '@/lib/apiFetch';
import type { Account, UserAchievement, UserAchievementsResponse } from '@/types/account';

const SELECTED_ACCOUNT_KEY = 'selected_account_id';

type StatusFilter = 'all' | 'incomplete' | 'completed';

export default function MyAchievementsPage() {
  const [mounted, setMounted] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState<UserAchievementsResponse['stats'] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 20;

  // 挂载后检查 token
  useEffect(() => {
    setMounted(true);
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  // 拉取账号列表
  useEffect(() => {
    if (!mounted) return;

    async function fetchAccounts() {
      try {
        const data = await apiFetch<Account[]>('/accounts');
        setAccounts(data);

        if (data.length > 0) {
          const savedId = localStorage.getItem(SELECTED_ACCOUNT_KEY);
          const validId = data.find((a) => a.id === savedId)?.id ?? data[0].id;
          setSelectedAccountId(validId);
          localStorage.setItem(SELECTED_ACCOUNT_KEY, validId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载账号失败');
      }
    }

    if (getToken()) {
      fetchAccounts();
    }
  }, [mounted]);

  // 拉取成就列表
  const fetchAchievements = useCallback(async () => {
    if (!selectedAccountId) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set('status', status);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (q) params.set('q', q);

    try {
      const data = await apiFetch<UserAchievementsResponse>(
        `/accounts/${selectedAccountId}/achievements?${params.toString()}`
      );
      setAchievements(data.items);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载成就失败');
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, status, page, q]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
    setPage(1);
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchAchievements();
  };

  const handleToggleCompleted = async (achievementId: string, completed: boolean) => {
    if (!selectedAccountId) return;

    try {
      await apiFetch(`/accounts/${selectedAccountId}/progress/${achievementId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      });
      fetchAchievements();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getAccountDisplay = (account: Account) => {
    return account.nickname || `${account.uid} (${account.server})`;
  };

  // 挂载前不渲染，避免 hydration 错误
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            我的成就
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* 账号选择 */}
        {accounts.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-400">账号:</label>
            <select
              value={selectedAccountId ?? ''}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {getAccountDisplay(account)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 统计信息 */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.completed}</div>
              <div className="text-sm text-zinc-500">已完成</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.incomplete}</div>
              <div className="text-sm text-zinc-500">未完成</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</div>
              <div className="text-sm text-zinc-500">总数</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-amber-500">{stats.primogemsEarned}</div>
              <div className="text-sm text-zinc-500">已获原石</div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.primogemsTotal}</div>
              <div className="text-sm text-zinc-500">总原石</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {(['all', 'incomplete', 'completed'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300'
              }`}
            >
              {s === 'all' ? '全部' : s === 'incomplete' ? '未完成' : '已完成'}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="搜索成就..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
          >
            搜索
          </button>
        </div>

        {/* 列表 */}
        {loading && (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
            加载中...
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              共 {total} 个成就
            </div>

            {achievements.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                没有找到成就
              </div>
            ) : (
              <ul className="space-y-3">
                {achievements.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => handleToggleCompleted(item.id, e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${item.completed ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {item.name}
                        </h3>
                        {item.completed && (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
                            已完成
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-medium shrink-0">
                      <span>{item.rewardPrimogems}</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                      </svg>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  上一页
                </button>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
