'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMounted } from '@/hooks/useMounted';
import { useAchievementCategories } from '@/hooks/useAchievementCategories';
import { CategoryList } from '@/components/achievements/CategoryList';
import { Search, Star } from 'lucide-react';

export default function AchievementCategoriesPage() {
  const mounted = useMounted();
  const t = useTranslations('achievements');
  const tCommon = useTranslations('common');

  const [searchQuery, setSearchQuery] = useState('');

  const { items, isLoading, error } = useAchievementCategories({
    pageSize: 100, // Load all categories
  });

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Calculate total achievements
  const totalAchievements = useMemo(() => {
    return items.reduce((sum, cat) => sum + cat.achievementCount, 0);
  }, [items]);

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
        {/* Stats */}
        <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3">
          <StatCard value={items.length} label={t('totalCategories')} />
          <StatCard
            value={totalAchievements}
            label={t('totalAchievements')}
            variant="gold"
            icon={<Star className="h-4 w-4 fill-current" />}
          />
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
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
            <CategoryList items={filteredCategories} />
          </>
        )}
      </main>
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  variant?: 'default' | 'gold';
  icon?: React.ReactNode;
}

function StatCard({ value, label, variant = 'default', icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div
        className={`text-xl sm:text-2xl font-bold flex items-center gap-1 ${
          variant === 'gold' ? 'text-genshin-gold' : 'text-foreground'
        }`}
      >
        {value}
        {icon}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
