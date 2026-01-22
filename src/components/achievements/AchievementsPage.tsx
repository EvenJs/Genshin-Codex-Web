'use client';

import { useState, useEffect } from 'react';
import { usePublicAchievements } from '@/hooks/usePublicAchievements';
import { AchievementList } from '@/components/achievements/AchievementList';

export function AchievementsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { items, total, pageSize, loading, error } = usePublicAchievements({
    page,
    q: debouncedQ || undefined,
    category: category || undefined,
    region: region || undefined,
  });

  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    if (!debouncedQ && !category && !region && items.length > 0) {
      const categorySet = new Set<string>();
      const regionSet = new Set<string>();

      items.forEach((item) => {
        if (item.category) categorySet.add(item.category);
        if (item.region) regionSet.add(item.region);
      });

      setAllCategories(Array.from(categorySet).sort());
      setAllRegions(Array.from(regionSet).sort());
    }
  }, [items, debouncedQ, category, region]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setPage(1);
  };

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
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="搜索成就名称或描述..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">分类:</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">All</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">地区:</label>
              <select
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">All</option>
                {allRegions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

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

        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              共 {total} 个成就
            </div>

            <AchievementList items={items} />

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
