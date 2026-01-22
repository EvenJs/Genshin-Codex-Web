'use client';

import { useState, useEffect } from 'react';
import type { Achievement } from '@/types/achievement';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const PAGE_SIZE = 20;

export interface UsePublicAchievementsParams {
  page?: number;
  q?: string;
  category?: string;
  region?: string;
}

export interface UsePublicAchievementsResult {
  items: Achievement[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export function usePublicAchievements(
  params: UsePublicAchievementsParams = {}
): UsePublicAchievementsResult {
  const { page = 1, q, category, region } = params;

  const [items, setItems] = useState<Achievement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAchievements() {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      searchParams.set('page', String(page));
      searchParams.set('pageSize', String(PAGE_SIZE));
      if (q) searchParams.set('q', q);
      if (category) searchParams.set('category', category);
      if (region) searchParams.set('region', region);

      try {
        const response = await fetch(
          `${API_BASE_URL}/achievements?${searchParams.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAchievements();

    return () => {
      controller.abort();
    };
  }, [page, q, category, region]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    loading,
    error,
  };
}
