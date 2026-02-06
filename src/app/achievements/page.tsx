'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMounted } from '@/hooks/useMounted';
import { useAchievementCategories } from '@/hooks/useAchievementCategories';
import { CategoryList } from '@/components/achievements/CategoryList';
import { CircularProgress } from '@/components/achievements/CircularProgress';
import { Search, Star, FolderOpen } from 'lucide-react';

export default function AchievementCategoriesPage() {
  const mounted = useMounted();
  const t = useTranslations('achievements');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState('');

  const { items, isLoading, error } = useAchievementCategories({
    pageSize: 100,
  });

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const totalAchievements = useMemo(() => {
    return items.reduce((sum, cat) => sum + cat.achievementCount, 0);
  }, [items]);

  const totalCompleted = useMemo(() => {
    return items.reduce((sum, cat) => sum + (cat.completedCount ?? 0), 0);
  }, [items]);

  const completionPercentage = useMemo(() => {
    return totalAchievements > 0 ? (totalCompleted / totalAchievements) * 100 : 0;
  }, [totalCompleted, totalAchievements]);

  const isSearchActive = searchQuery.length > 0;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('categoriesTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('categoriesSubtitle', { count: totalAchievements })}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        {/* Stats - 3 columns */}
        <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Categories count */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {items.length}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {t('totalCategories')}
              </div>
            </div>
          </div>

          {/* Total achievements */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E3B342]/10 flex items-center justify-center shrink-0">
              <Star className="h-6 w-6 text-[#E3B342] fill-current" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-[#E3B342]">
                {totalAchievements}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {t('totalAchievements')}
              </div>
            </div>
          </div>

          {/* Completion percentage with circular progress */}
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 flex items-center gap-4">
            <CircularProgress percentage={completionPercentage} size={48} strokeWidth={5} />
            <div className="min-w-0">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {totalCompleted}/{totalAchievements}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {t('completedPercentage') || 'Completed'}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchCategoriesPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            {tCommon('loading')}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="py-12 text-center text-destructive">
            {error.message}
          </div>
        )}

        {/* Category List */}
        {!isLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {t('categoriesCount', { count: filteredCategories.length })}
            </div>
            <CategoryList items={filteredCategories} isSearchResult={isSearchActive} />
          </>
        )}
      </main>
    </div>
  );
}
