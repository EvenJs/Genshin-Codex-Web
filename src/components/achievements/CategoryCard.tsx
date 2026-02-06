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

  const completedCount = category.completedCount ?? 0;
  const totalCount = category.achievementCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = progress === 100;

  return (
    <Link
      href={`/achievements/category/${category.id}`}
      className={`group relative block overflow-hidden rounded-lg border bg-card transition-all duration-200
        ${isComplete
          ? 'border-[#E3B342] shadow-[0_0_8px_rgba(227,179,66,0.3)]'
          : 'border-border hover:border-primary/50'
        }
        hover:bg-[#F5F5F5] dark:hover:bg-white/5 hover:shadow-lg
      `}
    >
      {/* Background image if available */}
      {category.background && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 transition-opacity group-hover:opacity-20"
          style={{ backgroundImage: `url(${category.background})` }}
        />
      )}

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Icon - 20% larger (12->14.4≈14, 12->14.4≈14 for mobile, 12->14.4≈14 for desktop) */}
          {category.icon ? (
            <img
              src={category.icon}
              alt=""
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain shrink-0"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl">🏆</span>
            </div>
          )}

          {/* Title and count */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {category.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedCount} / {totalCount} {t('achievementCount', { count: totalCount }).replace(String(totalCount), '').trim() || 'achievements'}
            </p>
          </div>

          {/* Arrow indicator with slide animation */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: '#E3B342',
          }}
        />
      </div>
    </Link>
  );
}
