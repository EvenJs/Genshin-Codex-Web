'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  category: string;
  region: string;
  allCategories: string[];
  allRegions: string[];
  onCategoryChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterPanel({
  category,
  region,
  allCategories,
  allRegions,
  onCategoryChange,
  onRegionChange,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  const tPage = useTranslations('achievementsPage');
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [category, region].filter(Boolean).length;

  return (
    <div className="mb-4">
      {/* Mobile: Collapsible */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-between"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {tPage('filters')}
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearFilters}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CollapsibleContent className="mt-3 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tPage('categoryLabel')}</label>
              <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{tPage('allCategories')}</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tPage('regionLabel')}</label>
              <select
                value={region}
                onChange={(e) => onRegionChange(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">{tPage('allRegions')}</option>
                {allRegions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop: Always Visible */}
      <div className="hidden md:flex md:items-center md:gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">{tPage('categoryLabel')}:</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{tPage('all')}</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">{tPage('regionLabel')}:</label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{tPage('all')}</option>
            {allRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            {tPage('clear')}
          </Button>
        )}
      </div>
    </div>
  );
}
