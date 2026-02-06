'use client';

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTranslations } from 'next-intl';
import type { Achievement } from '@/types/achievement';
import { AchievementCard } from './AchievementCard';
import { SearchX } from 'lucide-react';

interface VirtualizedAchievementListProps {
  items: (Achievement & { completed?: boolean })[];
  onToggleComplete?: (id: string, completed: boolean) => void;
  isUserMode?: boolean;
  estimatedItemHeight?: number;
}

export function VirtualizedAchievementList({
  items,
  onToggleComplete,
  isUserMode = false,
  estimatedItemHeight = 100,
}: VirtualizedAchievementListProps) {
  const t = useTranslations('achievements');
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => estimatedItemHeight, [estimatedItemHeight]),
    overscan: 5,
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('noAchievements')}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {t('noAchievementsHint')}
        </p>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-280px)] min-h-[400px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="pb-2 sm:pb-3">
                <AchievementCard
                  achievement={item}
                  onToggleComplete={onToggleComplete}
                  isUserMode={isUserMode}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
