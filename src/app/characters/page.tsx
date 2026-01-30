'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { CharacterCard } from '@/components/characters/CharacterCard';
import { CharacterForm } from '@/components/characters/CharacterForm';
import { Search, Users, Plus, Pencil, Trash2, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Character, AccountCharacter, Element, WeaponType, CreateAccountCharacterDto, UpdateAccountCharacterDto } from '@/types/character';
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

export default function CharactersPage() {
  const router = useRouter();
  const mounted = useMounted();
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

  // Filter public characters
  const filteredPublicCharacters = allCharacters.filter((c) => {
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || c.element === selectedElement;
    const matchesWeapon = !selectedWeapon || c.weaponType === selectedWeapon;
    const matchesRarity = !selectedRarity || c.rarity === selectedRarity;
    return matchesSearch && matchesElement && matchesWeapon && matchesRarity;
  });

  // Filter user characters
  const filteredUserCharacters = userCharacters.filter((c) => {
    const matchesSearch = !searchQuery || c.character.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || c.character.element === selectedElement;
    return matchesSearch && matchesElement;
  });

  // Group by rarity
  const publicFiveStars = filteredPublicCharacters.filter((c) => c.rarity === 5);
  const publicFourStars = filteredPublicCharacters.filter((c) => c.rarity === 4);
  const userFiveStars = filteredUserCharacters.filter((c) => c.character.rarity === 5);
  const userFourStars = filteredUserCharacters.filter((c) => c.character.rarity === 4);

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

  const handleFormSubmit = async (data: CreateAccountCharacterDto | UpdateAccountCharacterDto) => {
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
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isUserMode ? 'My Characters' : 'Characters'}
            </h1>
            {isUserMode && (
              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Login prompt for guests */}
        {!authLoading && !isLoggedIn && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Login to manage your character collection
            </p>
            <Link href="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3">
          <StatCard
            value={isUserMode ? userCharacters.length : allCharacters.length}
            label={isUserMode ? 'Total Characters' : 'All Characters'}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            value={isUserMode ? userFiveStars.length : publicFiveStars.length}
            label="5-Star"
            variant="gold"
          />
          <StatCard
            value={isUserMode ? userFourStars.length : publicFourStars.length}
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

        {/* Element filter */}
        <div className="mb-4 sm:mb-6 flex gap-1 overflow-x-auto pb-1">
          <Button
            variant={selectedElement === '' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setSelectedElement('')}
          >
            All
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

        {/* Additional filters for public mode */}
        {!isUserMode && (
          <div className="mb-4 sm:mb-6 space-y-2">
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
        )}

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
              {isUserMode ? filteredUserCharacters.length : filteredPublicCharacters.length} characters
            </div>

            {isUserMode ? (
              // User characters view
              filteredUserCharacters.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {userCharacters.length === 0
                      ? 'No characters yet. Add your first character!'
                      : 'No characters found'}
                  </p>
                  {userCharacters.length === 0 && (
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Character
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 5-Star Characters */}
                  {userFiveStars.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="text-amber-500">★★★★★</span> 5-Star ({userFiveStars.length})
                      </h2>
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {userFiveStars.map((char) => (
                          <div key={char.id} className="group relative">
                            <CharacterCard character={char} onClick={handleCharacterClick} />
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleEdit(char, e)}
                                className="rounded-lg bg-card/90 p-1.5 text-muted-foreground hover:text-foreground hover:bg-card shadow-sm"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(char.id, e)}
                                className={cn(
                                  'rounded-lg p-1.5 shadow-sm transition-colors',
                                  deleteConfirm === char.id
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-card/90 text-muted-foreground hover:text-destructive hover:bg-card'
                                )}
                                title={deleteConfirm === char.id ? 'Click again to confirm' : 'Delete'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 4-Star Characters */}
                  {userFourStars.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="text-purple-500">★★★★</span> 4-Star ({userFourStars.length})
                      </h2>
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {userFourStars.map((char) => (
                          <div key={char.id} className="group relative">
                            <CharacterCard character={char} onClick={handleCharacterClick} />
                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleEdit(char, e)}
                                className="rounded-lg bg-card/90 p-1.5 text-muted-foreground hover:text-foreground hover:bg-card shadow-sm"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(char.id, e)}
                                className={cn(
                                  'rounded-lg p-1.5 shadow-sm transition-colors',
                                  deleteConfirm === char.id
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-card/90 text-muted-foreground hover:text-destructive hover:bg-card'
                                )}
                                title={deleteConfirm === char.id ? 'Click again to confirm' : 'Delete'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )
            ) : (
              // Public characters view
              filteredPublicCharacters.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No characters found
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 5-Star Characters */}
                  {publicFiveStars.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="text-amber-500">★★★★★</span> 5-Star ({publicFiveStars.length})
                      </h2>
                      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {publicFiveStars.map((char) => (
                          <PublicCharacterCard key={char.id} character={char} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 4-Star Characters */}
                  {publicFourStars.length > 0 && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="text-purple-500">★★★★</span> 4-Star ({publicFourStars.length})
                      </h2>
                      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
      </main>

      {/* Add/Edit Character Sheet (user mode only) */}
      {isUserMode && (
        <Sheet open={isFormOpen} onOpenChange={handleFormClose}>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingCharacter ? 'Edit Character' : 'Add Character'}</SheetTitle>
              <SheetDescription>
                {editingCharacter
                  ? 'Update character level and constellation.'
                  : 'Select a character and set their level and constellation.'}
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

interface PublicCharacterCardProps {
  character: Character;
}

function PublicCharacterCard({ character }: PublicCharacterCardProps) {
  const elementColor = ELEMENT_COLORS[character.element];
  const avatarUrl = character.imageUrl;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
      <div className="h-1.5" style={{ backgroundColor: elementColor }} />
      <div className="p-3">
        <div className="flex justify-center mb-2">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-lg text-2xl overflow-hidden"
            style={{ backgroundColor: `${elementColor}20` }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={character.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              ELEMENT_ICONS[character.element]
            )}
          </div>
        </div>
        <h3 className="font-semibold text-foreground text-center text-sm truncate">
          {character.name}
        </h3>
        <div className="mt-1 text-center text-xs text-muted-foreground">
          {ELEMENT_NAMES[character.element]} · {WEAPON_TYPE_NAMES[character.weaponType]}
        </div>
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
