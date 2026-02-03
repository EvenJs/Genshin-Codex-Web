'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePublicAchievements } from '@/hooks/useAchievements';
import { AchievementList } from '@/components/achievements/AchievementList';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterPanel } from '@/components/achievements/FilterPanel';

export function AchievementsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');

  // Fetch unfiltered data for filter options
  const { items: allItems } = usePublicAchievements({
    page: 1,
    pageSize: 1000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { items, total, pageSize, isLoading, error } = usePublicAchievements({
    page,
    q: debouncedQ || undefined,
    category: category || undefined,
    region: region || undefined,
  });

  const totalPages = Math.ceil(total / pageSize);

  const { allCategories, allRegions } = useMemo(() => {
    const categorySet = new Set<string>();
    const regionSet = new Set<string>();

    allItems.forEach((item) => {
      if (item.category?.title) categorySet.add(item.category.title);
      if (item.region) regionSet.add(item.region);
    });

    return {
      allCategories: Array.from(categorySet).sort(),
      allRegions: Array.from(regionSet).sort(),
    };
  }, [allItems]);

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
    setPage(1);
  };

  const hasActiveFilters = category !== '' || region !== '' || searchInput !== '';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Achievements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse all achievements</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filter Panel - Collapsible on Mobile */}
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

        {/* Results */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {!isLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {total} achievements found
            </div>

            <AchievementList items={items} />

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
                  <span className="hidden sm:inline">Previous</span>
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
                  <span className="hidden sm:inline">Next</span>
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
