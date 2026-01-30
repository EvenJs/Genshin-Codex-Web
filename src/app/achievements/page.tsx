'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { usePublicAchievements, useUserAchievements } from '@/hooks/useAchievements';
import { useMounted } from '@/hooks/useMounted';
import { AchievementList } from '@/components/achievements/AchievementList';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Search, Check, LogIn } from 'lucide-react';
import { FilterPanel } from '@/components/achievements/FilterPanel';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type StatusFilter = 'all' | 'incomplete' | 'completed';

export default function AchievementsPage() {
  const mounted = useMounted();
  const tPage = useTranslations('achievementsPage');
  const tCommon = useTranslations('common');
  const tAchievements = useTranslations('achievements');
  const { isLoggedIn, isLoading: authLoading, selectedAccountId, accountsLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const pageSize = 20;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Public achievements (for filter options and when not logged in)
  const { items: allPublicItems } = usePublicAchievements({
    page: 1,
    pageSize: 100,
  });

  const {
    items: publicItems,
    total: publicTotal,
    isLoading: publicLoading,
    error: publicError,
  } = usePublicAchievements({
    page,
    q: debouncedQ || undefined,
    category: category || undefined,
    region: region || undefined,
  });

  // User achievements (when logged in)
  const {
    items: userItems,
    total: userTotal,
    stats,
    isLoading: userLoading,
    error: userError,
    toggleCompletion,
  } = useUserAchievements(selectedAccountId, {
    page,
    pageSize,
    q: debouncedQ || undefined,
  });

  // Determine which mode based on login state
  const isUserMode = isLoggedIn && !!selectedAccountId;
  const total = isUserMode ? userTotal : publicTotal;
  const isLoading = authLoading || accountsLoading || (isUserMode ? userLoading : publicLoading);
  const error = isUserMode ? userError : publicError;

  const totalPages = Math.ceil(total / pageSize);

  // Filter options from public data
  const { allCategories, allRegions } = useMemo(() => {
    const categorySet = new Set<string>();
    const regionSet = new Set<string>();

    allPublicItems.forEach((item) => {
      if (item.category) categorySet.add(item.category);
      if (item.region) regionSet.add(item.region);
    });

    return {
      allCategories: Array.from(categorySet).sort(),
      allRegions: Array.from(regionSet).sort(),
    };
  }, [allPublicItems]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setCategory('');
    setRegion('');
    setSearchInput('');
    setStatus('all');
    setPage(1);
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleToggleCompleted = async (achievementId: string, completed: boolean) => {
    await toggleCompletion(achievementId, completed);
  };

  const hasActiveFilters = category !== '' || region !== '' || searchInput !== '';

  // Filter user achievements by status
  const filteredUserItems = status !== 'all'
    ? userItems.filter((a) => (status === 'completed' ? a.completed : !a.completed))
    : userItems;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isUserMode ? tPage('titleMy') : tPage('titleAll')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isUserMode
              ? tPage('subtitleMy')
              : tPage('subtitleAll')}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        {/* Login prompt for guests */}
        {!authLoading && !isLoggedIn && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tPage('loginPrompt')}
            </p>
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
          <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-5">
            <StatCard value={stats.completedCount} label={tAchievements('completed')} variant="success" />
            <StatCard value={stats.incompleteCount} label={tAchievements('incomplete')} variant="default" />
            <StatCard
              value={stats.totalCount}
              label={tAchievements('total')}
              variant="default"
              className="hidden sm:block"
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
              className="hidden sm:block"
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

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={tAchievements('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filter Panel (for public mode) */}
        {!isUserMode && (
          <FilterPanel
            category={category}
            region={region}
            allCategories={allCategories}
            allRegions={allRegions}
            onCategoryChange={handleCategoryChange}
            onRegionChange={handleRegionChange}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {/* Results */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">{tCommon('loading')}</div>
        )}

        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {!isLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {tPage('countLabel', { count: total })}
            </div>

            {(isUserMode ? filteredUserItems.length : publicItems.length) === 0 ? (
              <div className="py-12 text-center text-muted-foreground">{tAchievements('noAchievements')}</div>
            ) : isUserMode ? (
              // User achievements list with completion toggle
              <ul className="space-y-2 sm:space-y-3">
                {filteredUserItems.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 sm:gap-4 rounded-lg border border-border bg-card p-3 sm:p-4 transition-colors',
                      item.completed && 'bg-accent/5'
                    )}
                  >
                    <button
                      onClick={() => handleToggleCompleted(item.id, !item.completed)}
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                        item.completed
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 hover:border-primary'
                      )}
                    >
                      {item.completed && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            'font-medium text-sm sm:text-base',
                            item.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          )}
                        >
                          {item.name}
                        </h3>
                        {item.completed && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary font-medium">
                            {tAchievements('done')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-genshin-gold font-semibold shrink-0">
                      <span className="text-sm">{item.rewardPrimogems}</span>
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              // Public achievements list
              <AchievementList items={publicItems} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{tCommon('previous')}</span>
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <span className="hidden sm:inline">{tCommon('next')}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
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
  className?: string;
}

function StatCard({ value, label, variant = 'default', icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-3 sm:p-4',
        className
      )}
    >
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold flex items-center gap-1',
          variant === 'gold' && 'text-genshin-gold',
          variant === 'success' && 'text-accent',
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
