'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCharacters, useAccountCharacters } from '@/hooks/useCharacters';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { CharacterCard, PublicCharacterCard } from '@/components/characters/CharacterCard';
import { CharacterForm } from '@/components/characters/CharacterForm';
import { FilterSidebar } from '@/components/characters/FilterSidebar';
import { Search, Users, Plus, Pencil, Trash2, LogIn, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  AccountCharacter,
  Element,
  WeaponType,
  CreateAccountCharacterDto,
  UpdateAccountCharacterDto,
} from '@/types/character';

export default function CharactersPage() {
  const router = useRouter();
  const mounted = useMounted();
  const tPage = useTranslations('charactersPage');
  const tCommon = useTranslations('common');
  const { isLoggedIn, isLoading: authLoading, selectedAccountId, accountsLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | ''>('');
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<number | ''>('');

  // Form states (for user mode)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AccountCharacter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // All characters (public data)
  const { characters: allCharacters, isLoading: allLoading, error: allError } = useCharacters();

  // User's account characters
  const {
    characters: userCharacters,
    isLoading: userLoading,
    error: userError,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  } = useAccountCharacters(selectedAccountId);

  // Determine mode
  const isUserMode = isLoggedIn && !!selectedAccountId;
  const isLoading = authLoading || accountsLoading || (isUserMode ? userLoading : allLoading);
  const error = isUserMode ? userError : allError;

  // Filter all characters (public data)
  const filteredAllCharacters = allCharacters.filter((c) => {
    const matchesSearch =
      !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || c.element === selectedElement;
    const matchesWeapon = !selectedWeapon || c.weaponType === selectedWeapon;
    const matchesRarity = !selectedRarity || c.rarity === selectedRarity;
    return matchesSearch && matchesElement && matchesWeapon && matchesRarity;
  });

  const filteredPublicCharacters = filteredAllCharacters;

  // Filter user characters
  const filteredAllCharacterIds = new Set(filteredAllCharacters.map((c) => c.id));
  const ownedCharacterIds = new Set(userCharacters.map((c) => c.character.id));
  const filteredOwnedCharacters = userCharacters.filter((c) =>
    filteredAllCharacterIds.has(c.character.id)
  );
  const filteredUnownedCharacters = filteredAllCharacters.filter(
    (c) => !ownedCharacterIds.has(c.id)
  );

  // Group by rarity
  const publicFiveStars = filteredPublicCharacters.filter((c) => c.rarity === 5);
  const publicFourStars = filteredPublicCharacters.filter((c) => c.rarity === 4);
  const allFiveStars = filteredAllCharacters.filter((c) => c.rarity === 5);
  const allFourStars = filteredAllCharacters.filter((c) => c.rarity === 4);

  // Existing character IDs for form filtering
  const existingCharacterIds = userCharacters.map((c) => c.character.id);

  const handleCharacterClick = (character: AccountCharacter) => {
    router.push(`/characters/${character.id}`);
  };

  const handleEdit = (character: AccountCharacter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCharacter(character);
    setIsFormOpen(true);
  };

  const handleDelete = async (characterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === characterId) {
      try {
        await deleteCharacter(characterId);
        setDeleteConfirm(null);
      } catch (err) {
        console.error('Failed to delete character:', err);
      }
    } else {
      setDeleteConfirm(characterId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleFormSubmit = async (
    data: CreateAccountCharacterDto | UpdateAccountCharacterDto
  ) => {
    setIsSubmitting(true);
    try {
      if (editingCharacter) {
        await updateCharacter(editingCharacter.id, data as UpdateAccountCharacterDto);
      } else {
        await createCharacter(data as CreateAccountCharacterDto);
      }
      setIsFormOpen(false);
      setEditingCharacter(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCharacter(null);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">
              {isUserMode ? tPage('titleMy') : tPage('titleAll')}
            </h1>
            {isUserMode && (
              <Button onClick={() => setIsFormOpen(true)} size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-1" />
                {tPage('addButton')}
              </Button>
            )}
          </div>

          {/* Search & Stats Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={tPage('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Stats */}
            <div className="flex gap-2 shrink-0">
              <StatBadge
                value={isUserMode ? filteredAllCharacters.length : allCharacters.length}
                label={tPage('statsTotalAll')}
                icon={<Users className="h-3.5 w-3.5" />}
              />
              <StatBadge
                value={isUserMode ? allFiveStars.length : publicFiveStars.length}
                label={tPage('fiveStar')}
                variant="gold"
              />
              <StatBadge
                value={isUserMode ? allFourStars.length : publicFourStars.length}
                label={tPage('fourStar')}
                variant="purple"
                className="hidden sm:flex"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-4">
        {/* Login prompt for guests */}
        {!authLoading && !isLoggedIn && (
          <div className="mb-4 rounded-xl border border-border bg-card p-3 flex items-center justify-between shadow-sm">
            <p className="text-sm text-muted-foreground">{tPage('loginPrompt')}</p>
            <Link href="/login">
              <Button size="sm" variant="outline" className="rounded-xl">
                <LogIn className="h-4 w-4 mr-1" />
                {tPage('loginCta')}
              </Button>
            </Link>
          </div>
        )}

        {/* Content with Sidebar */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            selectedWeapon={selectedWeapon}
            setSelectedWeapon={setSelectedWeapon}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
            showWeaponFilter={!isUserMode}
            showRarityFilter={!isUserMode}
          />

          {/* Character Grid */}
          <div className="flex-1 min-w-0">
            {/* Loading */}
            {isLoading && (
              <div className="py-12 text-center text-muted-foreground">{tCommon('loading')}</div>
            )}

            {/* Error */}
            {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

            {/* Character list */}
            {!isLoading && !error && (
              <>
                <div className="mb-3 text-sm text-muted-foreground">
                  {tPage('charactersCount', {
                    count: isUserMode
                      ? filteredAllCharacters.length
                      : filteredPublicCharacters.length,
                  })}
                </div>

                {isUserMode ? (
                  // User characters view (owned + unowned)
                  filteredAllCharacters.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      {tPage('noCharactersFound')}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Owned Characters Section */}
                      <section>
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          {tPage('sectionOwned', { count: filteredOwnedCharacters.length })}
                        </h2>
                        {filteredOwnedCharacters.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                            <div>{tPage('emptyUser')}</div>
                            {userCharacters.length === 0 && (
                              <div className="mt-4">
                                <Button
                                  onClick={() => setIsFormOpen(true)}
                                  size="sm"
                                  className="rounded-xl"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  {tPage('addCharacter')}
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                            {filteredOwnedCharacters.map((char) => (
                              <div key={char.id} className="group relative">
                                <CharacterCard character={char} onClick={handleCharacterClick} />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleEdit(char, e)}
                                    className="rounded-lg bg-card/90 p-1.5 text-muted-foreground hover:text-foreground hover:bg-card shadow-sm backdrop-blur-sm"
                                    title={tCommon('edit')}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDelete(char.id, e)}
                                    className={cn(
                                      'rounded-lg p-1.5 shadow-sm transition-colors backdrop-blur-sm',
                                      deleteConfirm === char.id
                                        ? 'bg-destructive text-destructive-foreground'
                                        : 'bg-card/90 text-muted-foreground hover:text-destructive hover:bg-card'
                                    )}
                                    title={
                                      deleteConfirm === char.id
                                        ? tCommon('clickAgainToConfirm')
                                        : tCommon('delete')
                                    }
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      {/* Unowned Characters Section */}
                      <section>
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                          {tPage('sectionUnowned', { count: filteredUnownedCharacters.length })}
                        </h2>
                        {filteredUnownedCharacters.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                            {tPage('noCharactersFound')}
                          </div>
                        ) : (
                          <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                            {filteredUnownedCharacters.map((char) => (
                              <PublicCharacterCard key={char.id} character={char} />
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  )
                ) : (
                  // Public characters view
                  filteredPublicCharacters.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      {tPage('noCharactersFound')}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 5-Star Characters */}
                      {publicFiveStars.length > 0 && (
                        <section>
                          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="text-amber-500">★★★★★</span>{' '}
                            {tPage('sectionFiveStar', { count: publicFiveStars.length })}
                          </h2>
                          <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                            {publicFiveStars.map((char) => (
                              <PublicCharacterCard key={char.id} character={char} />
                            ))}
                          </div>
                        </section>
                      )}

                      {/* 4-Star Characters */}
                      {publicFourStars.length > 0 && (
                        <section>
                          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="text-purple-500">★★★★</span>{' '}
                            {tPage('sectionFourStar', { count: publicFourStars.length })}
                          </h2>
                          <div className="grid gap-2.5 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                            {publicFourStars.map((char) => (
                              <PublicCharacterCard key={char.id} character={char} />
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Character Sheet (user mode only) */}
      {isUserMode && (
        <Sheet open={isFormOpen} onOpenChange={handleFormClose}>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingCharacter ? tPage('editTitle') : tPage('addTitle')}</SheetTitle>
              <SheetDescription>
                {editingCharacter ? tPage('editDescription') : tPage('addDescription')}
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <CharacterForm
                allCharacters={allCharacters}
                existingCharacterIds={existingCharacterIds}
                initialData={editingCharacter ?? undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
                isSubmitting={isSubmitting}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

// Compact stat badge for header
interface StatBadgeProps {
  value: number;
  label: string;
  variant?: 'default' | 'gold' | 'purple';
  icon?: React.ReactNode;
  className?: string;
}

function StatBadge({ value, label, variant = 'default', icon, className }: StatBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5',
        className
      )}
    >
      <span
        className={cn(
          'text-base font-bold flex items-center gap-1',
          variant === 'gold' && 'text-amber-500',
          variant === 'purple' && 'text-purple-500',
          variant === 'default' && 'text-foreground'
        )}
      >
        {variant === 'gold' && <Star className="h-3.5 w-3.5 fill-current" />}
        {variant === 'purple' && <Star className="h-3.5 w-3.5 fill-current" />}
        {icon}
        {value}
      </span>
      <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
    </div>
  );
}
