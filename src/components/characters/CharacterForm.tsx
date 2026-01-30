'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  Character,
  AccountCharacter,
  CreateAccountCharacterDto,
  UpdateAccountCharacterDto,
  Element,
} from '@/types/character';
import { ELEMENT_COLORS } from '@/types/character';

const ELEMENT_ICONS: Record<Element, string> = {
  PYRO: '🔥',
  HYDRO: '💧',
  ANEMO: '🌀',
  ELECTRO: '⚡',
  DENDRO: '🌿',
  CRYO: '❄️',
  GEO: '🪨',
};

interface CharacterFormProps {
  allCharacters: Character[];
  existingCharacterIds: string[];
  initialData?: AccountCharacter;
  onSubmit: (data: CreateAccountCharacterDto | UpdateAccountCharacterDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CharacterForm({
  allCharacters,
  existingCharacterIds,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CharacterFormProps) {
  const tForm = useTranslations('characterForm');
  const tCommon = useTranslations('common');
  const tElement = useTranslations('element');
  const tWeapon = useTranslations('weapon');
  const isEditing = !!initialData;

  const [characterId, setCharacterId] = useState(initialData?.character.id ?? '');
  const [level, setLevel] = useState(initialData?.level ?? 1);
  const [constellation, setConstellation] = useState(initialData?.constellation ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter available characters (not already owned)
  const availableCharacters = allCharacters.filter(
    (c) => !existingCharacterIds.includes(c.id) || c.id === initialData?.character.id
  );

  // Filter by search
  const filteredCharacters = searchQuery
    ? availableCharacters.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableCharacters;

  // Sort by rarity desc, then name asc
  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    const rarityA = a.rarity ?? 0;
    const rarityB = b.rarity ?? 0;
    if (rarityA !== rarityB) return rarityB - rarityA;
    return a.name.localeCompare(b.name);
  });

  const selectedCharacter = allCharacters.find((c) => c.id === characterId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEditing && !characterId) {
      setError('Please select a character');
      return;
    }

    try {
      if (isEditing) {
        await onSubmit({ level, constellation } as UpdateAccountCharacterDto);
      } else {
        await onSubmit({ characterId, level, constellation } as CreateAccountCharacterDto);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save character');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Character Selection (only for new) */}
      {!isEditing && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {tForm('labelCharacter')}
          </label>

          {/* Search */}
          <input
            type="text"
            placeholder={tForm('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {/* Character Grid */}
          <div className="max-h-60 overflow-y-auto rounded-lg border border-input bg-card p-2">
            {sortedCharacters.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {searchQuery ? tForm('noCharactersFound') : tForm('allCharactersAdded')}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {sortedCharacters.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setCharacterId(char.id)}
                    className={cn(
                      'flex flex-col items-center rounded-lg p-2 text-center transition-colors',
                      characterId === char.id
                        ? 'bg-primary/20 ring-1 ring-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg overflow-hidden"
                      style={{ backgroundColor: `${ELEMENT_COLORS[char.element]}20` }}
                    >
                      {char.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={char.imageUrl}
                          alt={char.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        ELEMENT_ICONS[char.element]
                      )}
                    </div>
                    <span className="mt-1 text-xs font-medium text-foreground line-clamp-1">
                      {char.name}
                    </span>
                    {char.rarity && (
                      <span
                        className={cn(
                          'text-xs',
                          char.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
                        )}
                      >
                        {'★'.repeat(char.rarity)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Character Preview (for editing) */}
      {isEditing && selectedCharacter && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-xl overflow-hidden"
              style={{ backgroundColor: `${ELEMENT_COLORS[selectedCharacter.element]}20` }}
            >
              {selectedCharacter.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedCharacter.imageUrl}
                  alt={selectedCharacter.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                ELEMENT_ICONS[selectedCharacter.element]
              )}
            </div>
            <div>
              <div className="font-medium text-foreground">{selectedCharacter.name}</div>
              <div className="text-xs text-muted-foreground">
                {tElement(selectedCharacter.element)} ·{' '}
                {selectedCharacter.weaponType
                  ? tWeapon(selectedCharacter.weaponType)
                  : tCommon('unknown')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {tForm('levelLabel')}: {level}
        </label>
        <input
          type="range"
          min={1}
          max={90}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>90</span>
        </div>
      </div>

      {/* Constellation */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {tForm('constellationLabel')}: C{constellation}
        </label>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConstellation(c)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                constellation === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              C{c}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {tForm('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (!isEditing && !characterId)}
          className="flex-1"
        >
          {isSubmitting ? tForm('saving') : isEditing ? tForm('update') : tForm('addCharacter')}
        </Button>
      </div>
    </form>
  );
}
