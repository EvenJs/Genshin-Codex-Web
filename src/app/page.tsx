'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';
import type { Achievement, AchievementListResponse } from '@/types/achievement';

const CATEGORIES = ['全部', 'Wonders of the World', 'Memories of the Heart', 'Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan'];
const REGIONS = ['全部', 'Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan'];

export default function Home() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('全部');
  const [region, setRegion] = useState('全部');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category !== '全部') params.set('category', category);
    if (region !== '全部') params.set('region', region);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    try {
      const data = await apiFetch<AchievementListResponse>(
        'GET',
        `/achievements?${params.toString()}`
      );
      setAchievements(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [q, category, region, page]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Genshin Codex
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            成就库浏览器
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="搜索成就名称或描述..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">分类:</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">地区:</label>
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setPage(1);
                }}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 状态提示 */}
        {loading && (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
            加载中...
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-500">
            {error}
          </div>
        )}

        {/* 成就列表 */}
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              共 {total} 个成就
            </div>

            <div className="space-y-3">
              {achievements.map((achievement) => (
                <Link
                  key={achievement.id}
                  href={`/achievements/${achievement.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-600 dark:hover:bg-zinc-750"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
                          {achievement.name}
                        </h2>
                        {achievement.isHidden && (
                          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                            隐藏
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="text-sm font-medium">
                        {achievement.rewardPrimogems}
                      </span>
                      <span className="text-xs">原石</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {achievements.length === 0 && (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                没有找到匹配的成就
              </div>
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
