'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authToken';
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
import { Search, Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountCharacter, Element, CreateAccountCharacterDto, UpdateAccountCharacterDto } from '@/types/character';
import { ELEMENT_NAMES } from '@/types/character';

const ELEMENTS: Element[] = ['PYRO', 'HYDRO', 'ANEMO', 'ELECTRO', 'DENDRO', 'CRYO', 'GEO'];

export default function CharactersPage() {
  const router = useRouter();
  const mounted = useMounted();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | ''>('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AccountCharacter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { selectedAccountId, accountsLoading } = useAuth();
  const { characters: allCharacters } = useCharacters();
  const {
    characters,
    isLoading: charactersLoading,
    error,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  } = useAccountCharacters(selectedAccountId);

  // Auth check on mount
  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
    }
  }, [mounted]);

  const handleCharacterClick = (character: AccountCharacter) => {
    router.push(`/app/characters/${character.id}`);
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
      // Auto-cancel after 3 seconds
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

  // Filter characters
  const filteredCharacters = characters.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.character.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || c.character.element === selectedElement;
    return matchesSearch && matchesElement;
  });

  // Group by rarity
  const fiveStars = filteredCharacters.filter((c) => c.character.rarity === 5);
  const fourStars = filteredCharacters.filter((c) => c.character.rarity === 4);

  // Existing character IDs for form filtering
  const existingCharacterIds = characters.map((c) => c.character.id);

  const isLoading = accountsLoading || charactersLoading;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Characters</h1>
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
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
              {ELEMENT_NAMES[element]}
            </Button>
          ))}
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
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {characters.length === 0
                    ? 'No characters yet. Add your first character!'
                    : 'No characters found'}
                </p>
                {characters.length === 0 && (
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Character
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* 5-Star Characters */}
                {fiveStars.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-amber-500">★★★★★</span> 5-Star ({fiveStars.length})
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {fiveStars.map((char) => (
                        <div key={char.id} className="group relative">
                          <CharacterCard
                            character={char}
                            onClick={handleCharacterClick}
                          />
                          {/* Action buttons */}
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
                {fourStars.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-purple-500">★★★★</span> 4-Star ({fourStars.length})
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {fourStars.map((char) => (
                        <div key={char.id} className="group relative">
                          <CharacterCard
                            character={char}
                            onClick={handleCharacterClick}
                          />
                          {/* Action buttons */}
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
            )}
          </>
        )}
      </main>

      {/* Add/Edit Character Sheet */}
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
