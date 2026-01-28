'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCharacters } from '@/hooks/useCharacters';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import { Search, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Character, Element, WeaponType } from '@/types/character';
import { ELEMENT_NAMES, ELEMENT_COLORS, WEAPON_TYPE_NAMES } from '@/types/character';

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

export default function PublicCharactersPage() {
  const mounted = useMounted();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | ''>('');
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<number | ''>('');

  const { characters, isLoading, error } = useCharacters();

  // Filter characters
  const filteredCharacters = characters.filter((c) => {
    const matchesSearch =
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || c.element === selectedElement;
    const matchesWeapon = !selectedWeapon || c.weaponType === selectedWeapon;
    const matchesRarity = !selectedRarity || c.rarity === selectedRarity;
    return matchesSearch && matchesElement && matchesWeapon && matchesRarity;
  });

  // Group by rarity
  const fiveStars = filteredCharacters.filter((c) => c.rarity === 5);
  const fourStars = filteredCharacters.filter((c) => c.rarity === 4);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Home
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Characters</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3">
          <StatCard
            value={characters.length}
            label="Total Characters"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard value={fiveStars.length} label="5-Star" variant="gold" />
          <StatCard
            value={fourStars.length}
            label="4-Star"
            variant="purple"
            className="hidden sm:block"
          />
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 space-y-2">
          {/* Element filter */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Button
              variant={selectedElement === '' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedElement('')}
            >
              All Elements
            </Button>
            {ELEMENTS.map((element) => (
              <Button
                key={element}
                variant={selectedElement === element ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedElement(element)}
              >
                {ELEMENT_ICONS[element]} {ELEMENT_NAMES[element]}
              </Button>
            ))}
          </div>

          {/* Weapon filter */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Button
              variant={selectedWeapon === '' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedWeapon('')}
            >
              All Weapons
            </Button>
            {WEAPON_TYPES.map((weapon) => (
              <Button
                key={weapon}
                variant={selectedWeapon === weapon ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedWeapon(weapon)}
              >
                {WEAPON_TYPE_NAMES[weapon]}
              </Button>
            ))}
          </div>

          {/* Rarity filter */}
          <div className="flex gap-1">
            <Button
              variant={selectedRarity === '' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedRarity('')}
            >
              All Rarities
            </Button>
            <Button
              variant={selectedRarity === 5 ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedRarity(5)}
              className={selectedRarity === 5 ? '' : 'text-amber-500'}
            >
              ★★★★★
            </Button>
            <Button
              variant={selectedRarity === 4 ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedRarity(4)}
              className={selectedRarity === 4 ? '' : 'text-purple-500'}
            >
              ★★★★
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {/* Error */}
        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {/* Character list */}
        {!isLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredCharacters.length} characters
            </div>

            {filteredCharacters.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No characters found
              </div>
            ) : (
              <div className="space-y-6">
                {/* 5-Star Characters */}
                {fiveStars.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-amber-500">★★★★★</span> 5-Star ({fiveStars.length})
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {fiveStars.map((char) => (
                        <PublicCharacterCard key={char.id} character={char} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4-Star Characters */}
                {fourStars.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-purple-500">★★★★</span> 4-Star ({fourStars.length})
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {fourStars.map((char) => (
                        <PublicCharacterCard key={char.id} character={char} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

interface PublicCharacterCardProps {
  character: Character;
}

function PublicCharacterCard({ character }: PublicCharacterCardProps) {
  const elementColor = ELEMENT_COLORS[character.element];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      {/* Header with element color */}
      <div className="h-1.5" style={{ backgroundColor: elementColor }} />

      {/* Content */}
      <div className="p-3">
        {/* Avatar */}
        <div className="flex justify-center mb-2">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-lg text-2xl"
            style={{ backgroundColor: `${elementColor}20` }}
          >
            {ELEMENT_ICONS[character.element]}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-foreground text-center text-sm truncate">
          {character.name}
        </h3>

        {/* Info */}
        <div className="mt-1 text-center text-xs text-muted-foreground">
          {ELEMENT_NAMES[character.element]} · {WEAPON_TYPE_NAMES[character.weaponType]}
        </div>

        {/* Rarity */}
        <div className="mt-1 flex justify-center">
          <span
            className={cn(
              'text-xs',
              character.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
            )}
          >
            {'★'.repeat(character.rarity)}
          </span>
        </div>

        {/* Region */}
        {character.region && (
          <div className="mt-1 text-center text-xs text-muted-foreground">
            {character.region}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  variant?: 'default' | 'gold' | 'purple';
  icon?: React.ReactNode;
  className?: string;
}

function StatCard({ value, label, variant = 'default', icon, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-3 sm:p-4', className)}>
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold flex items-center gap-1',
          variant === 'gold' && 'text-amber-500',
          variant === 'purple' && 'text-purple-500',
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
