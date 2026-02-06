'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Achievement } from '@/types/achievement';
import { Star, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: Achievement & { completed?: boolean };
  onToggleComplete?: (id: string, completed: boolean) => void;
  isUserMode?: boolean;
}

export function AchievementCard({
  achievement,
  onToggleComplete,
  isUserMode = false,
}: AchievementCardProps) {
  const t = useTranslations('achievements');
  const isCompleted = achievement.completed ?? false;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(achievement.id, !isCompleted);
    }
  };

  return (
    <Link
      href={`/achievements/${achievement.id}`}
      className={cn(
        'group block rounded-lg border transition-all duration-200',
        isCompleted
          ? 'bg-[#F9F9F9] dark:bg-gray-900/50 border-border opacity-60'
          : 'bg-card border-border hover:border-[#E3B342] hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Left: Checkbox (only in user mode) */}
        {isUserMode && (
          <button
            onClick={handleCheckboxClick}
            className={cn(
              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
              isCompleted
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-[#E3B342] hover:bg-[#E3B342]/10'
            )}
            aria-label={isCompleted ? t('markIncomplete') : t('markComplete')}
          >
            {isCompleted && <Check className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Center: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-semibold text-sm sm:text-base truncate',
                isCompleted
                  ? 'text-muted-foreground'
                  : 'text-foreground group-hover:text-[#E3B342]'
              )}
            >
              {achievement.name}
            </h3>
            {achievement.isHidden && (
              <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <EyeOff className="h-3 w-3" />
              </span>
            )}
          </div>

          <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>

          {/* Bottom info: hidden description or version */}
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {achievement.isHidden && achievement.hiddenDescription ? (
              <span className="flex items-center gap-1 italic">
                <Eye className="h-3 w-3" />
                {achievement.hiddenDescription}
              </span>
            ) : achievement.version ? (
              <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                v{achievement.version}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right: Primogem reward */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full',
              isCompleted
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-[#E3B342]/10'
            )}
          >
            {isCompleted ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Star className="h-4 w-4 text-[#E3B342] fill-current" />
            )}
            <span
              className={cn(
                'font-bold text-sm',
                isCompleted
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-[#E3B342]'
              )}
            >
              {achievement.rewardPrimogems}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
