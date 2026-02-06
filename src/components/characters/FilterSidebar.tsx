'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Element, WeaponType } from '@/types/character';
import { ELEMENT_COLORS } from '@/types/character';

const ELEMENTS: Element[] = ['PYRO', 'HYDRO', 'ANEMO', 'ELECTRO', 'DENDRO', 'CRYO', 'GEO'];
const WEAPON_TYPES: WeaponType[] = ['SWORD', 'CLAYMORE', 'POLEARM', 'BOW', 'CATALYST'];

const ELEMENT_ICONS: Record<Element, string> = {
  PYRO: '🔥',
  HYDRO: '💧',
  ANEMO: '🌀',
  ELECTRO: '⚡',
  DENDRO: '🌿',
  CRYO: '❄️',
  GEO: '🪨',
};

const WEAPON_ICONS: Record<WeaponType, string> = {
  SWORD: '🗡️',
  CLAYMORE: '⚔️',
  POLEARM: '🔱',
  BOW: '🏹',
  CATALYST: '📖',
};

interface FilterSidebarProps {
  selectedElement: Element | '';
  setSelectedElement: (element: Element | '') => void;
  selectedWeapon: WeaponType | '';
  setSelectedWeapon: (weapon: WeaponType | '') => void;
  selectedRarity: number | '';
  setSelectedRarity: (rarity: number | '') => void;
  showWeaponFilter?: boolean;
  showRarityFilter?: boolean;
}

export function FilterSidebar({
  selectedElement,
  setSelectedElement,
  selectedWeapon,
  setSelectedWeapon,
  selectedRarity,
  setSelectedRarity,
  showWeaponFilter = true,
  showRarityFilter = true,
}: FilterSidebarProps) {
  const tCommon = useTranslations('common');
  const tElement = useTranslations('element');
  const tWeapon = useTranslations('weapon');
  const tPage = useTranslations('charactersPage');

  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    element: true,
    weapon: true,
    rarity: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters = selectedElement || selectedWeapon || selectedRarity;

  const clearAllFilters = () => {
    setSelectedElement('');
    setSelectedWeapon('');
    setSelectedRarity('');
  };

  // Mobile toggle button
  const MobileToggle = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg bg-card border-border hover:bg-primary hover:text-primary-foreground"
    >
      {isOpen ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
    </Button>
  );

  const SidebarContent = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {tPage('filters') || 'Filters'}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-2"
          >
            {tCommon('clearAll') || 'Clear All'}
          </Button>
        )}
      </div>

      {/* Element Filter */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('element')}
          className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <span>{tPage('elementFilter') || 'Element'}</span>
          {expandedSections.element ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.element && (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setSelectedElement('')}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition-all',
                selectedElement === ''
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tCommon('all')}
            </button>
            {ELEMENTS.map((element) => (
              <button
                key={element}
                onClick={() => setSelectedElement(element)}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium transition-all flex items-center gap-1.5 justify-center',
                  selectedElement === element
                    ? 'text-white shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                style={{
                  backgroundColor:
                    selectedElement === element ? ELEMENT_COLORS[element] : undefined,
                }}
              >
                <span>{ELEMENT_ICONS[element]}</span>
                <span className="hidden xl:inline">{tElement(element)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weapon Filter */}
      {showWeaponFilter && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('weapon')}
            className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <span>{tPage('weaponFilter') || 'Weapon'}</span>
            {expandedSections.weapon ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.weapon && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSelectedWeapon('')}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium transition-all',
                  selectedWeapon === ''
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tCommon('all')}
              </button>
              {WEAPON_TYPES.map((weapon) => (
                <button
                  key={weapon}
                  onClick={() => setSelectedWeapon(weapon)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs font-medium transition-all flex items-center gap-1.5 justify-center',
                    selectedWeapon === weapon
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span>{WEAPON_ICONS[weapon]}</span>
                  <span className="hidden xl:inline">{tWeapon(weapon)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rarity Filter */}
      {showRarityFilter && (
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('rarity')}
            className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <span>{tPage('rarityFilter') || 'Rarity'}</span>
            {expandedSections.rarity ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.rarity && (
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedRarity('')}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-xs font-medium transition-all',
                  selectedRarity === ''
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tCommon('all')}
              </button>
              <button
                onClick={() => setSelectedRarity(5)}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-xs font-medium transition-all flex items-center justify-center gap-1',
                  selectedRarity === 5
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-muted/50 text-amber-500 hover:bg-amber-500/10'
                )}
              >
                ★★★★★
              </button>
              <button
                onClick={() => setSelectedRarity(4)}
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-xs font-medium transition-all flex items-center justify-center gap-1',
                  selectedRarity === 4
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'bg-muted/50 text-purple-500 hover:bg-purple-500/10'
                )}
              >
                ★★★★
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <MobileToggle />

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 p-4 transition-transform duration-300 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{tPage('filters') || 'Filters'}</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block sticky top-24 h-fit w-56 xl:w-64 shrink-0">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
