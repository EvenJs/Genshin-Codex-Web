'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';
import type { Achievement } from '@/types/achievement';

export default function AchievementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAchievement() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<Achievement>(`/achievements/${id}`);
        setAchievement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAchievement();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            ← 返回成就列表
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">成就详情</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading && (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">加载中...</div>
        )}

        {error && <div className="py-12 text-center text-red-500">{error}</div>}

        {!loading && !error && achievement && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
            {/* 标题区域 */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {achievement.name}
                  </h2>
                  {achievement.isHidden && (
                    <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                      隐藏成就
                    </span>
                  )}
                </div>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{achievement.description}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <span className="text-lg font-semibold">{achievement.rewardPrimogems}</span>
                <span className="text-sm">原石</span>
              </div>
            </div>

            {/* 元信息 */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
              <div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">分类: </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {achievement.category}
                </span>
              </div>
              {achievement.region && (
                <div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">地区: </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {achievement.region}
                  </span>
                </div>
              )}
            </div>

            {/* 攻略指南 */}
            {achievement.guide && (
              <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-100">攻略指南</h3>
                <div className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {achievement.guide}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
