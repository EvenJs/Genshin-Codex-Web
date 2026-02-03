'use client';

import { useTranslations } from 'next-intl';
import type { AchievementCategory } from '@/types/achievementCategory';
import { CategoryCard } from './CategoryCard';

interface CategoryListProps {
  items: AchievementCategory[];
}

export function CategoryList({ items }: CategoryListProps) {
  const t = useTranslations('achievements');

  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        {t('noCategories')}
      </p>
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
