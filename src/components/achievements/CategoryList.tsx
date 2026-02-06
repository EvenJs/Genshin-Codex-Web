'use client';

import { useTranslations } from 'next-intl';
import type { AchievementCategory } from '@/types/achievementCategory';
import { CategoryCard } from './CategoryCard';
import { SearchX } from 'lucide-react';

interface CategoryListProps {
  items: AchievementCategory[];
  isSearchResult?: boolean;
}

export function CategoryList({ items, isSearchResult = false }: CategoryListProps) {
  const t = useTranslations('achievements');

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isSearchResult ? t('noSearchResults') : t('noCategories')}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {isSearchResult
            ? t('noSearchResultsHint')
            : t('noCategoriesHint')
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
