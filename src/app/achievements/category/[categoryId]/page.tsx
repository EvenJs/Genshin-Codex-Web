'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { usePublicAchievements, useUserAchievements } from '@/hooks/useAchievements';
import { useMounted } from '@/hooks/useMounted';
import { VirtualizedAchievementList } from '@/components/achievements/VirtualizedAchievementList';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { Button } from '@/components/ui/button';
import {
  Star,
  Search,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';
import { publicFetcher, cacheKeys } from '@/lib/swr';
import type { AchievementCategory } from '@/types/achievementCategory';

type StatusFilter = 'all' | 'incomplete' | 'completed';

export default function CategoryAchievementsPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const mounted = useMounted();
  const tPage = useTranslations('achievementsPage');
  const tCommon = useTranslations('common');
  const tAchievements = useTranslations('achievements');
  const {
    isLoggedIn,
    isLoading: authLoading,
    selectedAccountId,
    accountsLoading,
  } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Fetch category info
  const { data: category } = useSWR<AchievementCategory>(
    cacheKeys.achievementCategory(categoryId),
    publicFetcher
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load ALL achievements for this category (for virtual scrolling)
  const {
    items: publicItems,
    total: publicTotal,
    isLoading: publicLoading,
    error: publicError,
  } = usePublicAchievements({
    page: 1,
    pageSize: 1000,
    q: debouncedQ || undefined,
    categoryId,
  });

  const {
    items: userItems,
    total: userTotal,
    stats,
    isLoading: userLoading,
    error: userError,
    toggleCompletion,
  } = useUserAchievements(selectedAccountId, {
    page: 1,
    pageSize: 1000,
    q: debouncedQ || undefined,
    categoryId,
  });

  const isUserMode = isLoggedIn && !!selectedAccountId;
  const total = isUserMode ? userTotal : publicTotal;
  const isLoading =
    authLoading || accountsLoading || (isUserMode ? userLoading : publicLoading);
  const error = isUserMode ? userError : publicError;

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    if (!stats) return 0;
    const totalCount = stats.completedCount + stats.incompleteCount;
    return totalCount > 0 ? (stats.completedCount / totalCount) * 100 : 0;
  }, [stats]);

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatus(newStatus);
  };

  const handleToggleCompleted = async (
    achievementId: string,
    completed: boolean
  ) => {
    await toggleCompletion(achievementId, completed);
  };

  // Filter achievements
  const filteredItems = useMemo(() => {
    let items = isUserMode ? userItems : publicItems;

    // Apply status filter for user mode
    if (isUserMode && status !== 'all') {
      items = items.filter((a) =>
        status === 'completed' ? a.completed : !a.completed
      );
    }

    // Apply hide completed toggle
    if (isUserMode && hideCompleted) {
      items = items.filter((a) => !a.completed);
    }

    return items;
  }, [isUserMode, userItems, publicItems, status, hideCompleted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-5xl px-4">
          {/* Back button row */}
          <div className="py-3 flex items-center justify-between">
            <Link
              href="/achievements"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{tAchievements('backToCategories')}</span>
              <span className="sm:hidden">{tCommon('back') || 'Back'}</span>
            </Link>

            {/* Category title (desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              {category?.icon && (
                <img
                  src={category.icon}
                  alt=""
                  className="h-6 w-6 object-contain"
                />
              )}
              <span className="font-semibold text-foreground">
                {category?.title}
              </span>
            </div>

            {/* Progress indicator */}
            {isUserMode && stats && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {stats.completedCount}/{stats.completedCount + stats.incompleteCount}
                </span>
                <span className="font-semibold text-[#E3B342]">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {isUserMode && stats && (
            <div className="h-1 bg-gray-200 dark:bg-gray-700 -mx-4">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                  backgroundColor: '#E3B342',
                }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Category Info (Mobile) */}
      <div className="sm:hidden border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          {category?.icon && (
            <img
              src={category.icon}
              alt=""
              className="h-10 w-10 object-contain"
            />
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {category?.title ?? tCommon('loading')}
            </h1>
            {category && (
              <p className="text-sm text-muted-foreground">
                {tAchievements('categorySubtitle', {
                  count: category.achievementCount,
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        {/* Login prompt for guests */}
        {!authLoading && !isLoggedIn && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{tPage('loginPrompt')}</p>
            <Link href="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4 mr-1" />
                {tPage('loginCta')}
              </Button>
            </Link>
          </div>
        )}

        {/* Stats (only for logged in users) */}
        {isUserMode && stats && (
          <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-4">
            <StatCard
              value={stats.completedCount}
              label={tAchievements('completed')}
              variant="success"
            />
            <StatCard
              value={stats.incompleteCount}
              label={tAchievements('incomplete')}
            />
            <StatCard
              value={stats.primogemsEarned}
              label={tAchievements('earned')}
              variant="gold"
              icon={<Star className="h-4 w-4 fill-current" />}
            />
            <StatCard
              value={stats.primogemsTotal}
              label={tAchievements('total')}
              variant="gold"
              icon={<Star className="h-4 w-4 fill-current opacity-50" />}
            />
          </div>
        )}

        {/* Status Tabs (only for logged in users) */}
        {isUserMode && (
          <div className="mb-4 flex gap-1 sm:gap-2">
            {(['all', 'incomplete', 'completed'] as StatusFilter[]).map((s) => (
              <Button
                key={s}
                variant={status === s ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleStatusChange(s)}
                className={cn(
                  'flex-1 sm:flex-none',
                  status === s && 'bg-primary text-primary-foreground'
                )}
              >
                {s === 'all'
                  ? tPage('statusAll')
                  : s === 'incomplete'
                    ? tPage('statusIncomplete')
                    : tPage('statusCompleted')}
              </Button>
            ))}
          </div>
        )}

        {/* Search Bar with Hide Toggle */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={tAchievements('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Hide completed toggle */}
          {isUserMode && (
            <ToggleSwitch
              checked={hideCompleted}
              onChange={setHideCompleted}
              label={tAchievements('hideCompleted')}
              size="sm"
            />
          )}
        </div>

        {/* Results */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">
            {tCommon('loading')}
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-destructive">{error.message}</div>
        )}

        {!isLoading && !error && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {tPage('countLabel', { count: filteredItems.length })}
              </span>
              {total > 100 && (
                <span className="text-xs text-muted-foreground">
                  {tAchievements('virtualScrollHint')}
                </span>
              )}
            </div>

            <VirtualizedAchievementList
              items={filteredItems}
              onToggleComplete={isUserMode ? handleToggleCompleted : undefined}
              isUserMode={isUserMode}
            />
          </>
        )}
      </main>
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  variant?: 'default' | 'success' | 'gold';
  icon?: React.ReactNode;
}

function StatCard({ value, label, variant = 'default', icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold flex items-center gap-1',
          variant === 'gold' && 'text-[#E3B342]',
          variant === 'success' && 'text-green-600 dark:text-green-400',
          variant === 'default' && 'text-foreground'
        )}
      >
        {value}
        {icon}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
