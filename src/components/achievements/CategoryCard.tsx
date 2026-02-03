'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { AchievementCategory } from '@/types/achievementCategory';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: AchievementCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const t = useTranslations('achievements');

  return (
    <Link
      href={`/achievements/category/${category.id}`}
      className="group relative block overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Background image if available */}
      {category.background && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity group-hover:opacity-20"
          style={{ backgroundImage: `url(${category.background})` }}
        />
      )}

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-3">
          {/* Icon */}
          {category.icon ? (
            <img
              src={category.icon}
              alt=""
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0"
            />
          ) : (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl">🏆</span>
            </div>
          )}

          {/* Title and count */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {category.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('achievementCount', { count: category.achievementCount })}
            </p>
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}
