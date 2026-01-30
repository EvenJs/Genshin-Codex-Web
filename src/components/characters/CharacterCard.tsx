'use client';

import { Star, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { AccountCharacter, Element } from '@/types/character';
import { ELEMENT_COLORS } from '@/types/character';

// Element icons (using text for simplicity, could be replaced with actual icons)
const ELEMENT_ICONS: Record<Element, string> = {
  PYRO: '🔥',
  HYDRO: '💧',
  ANEMO: '🌀',
  ELECTRO: '⚡',
  DENDRO: '🌿',
  CRYO: '❄️',
  GEO: '🪨',
};

interface CharacterCardProps {
  character: AccountCharacter;
  onClick?: (character: AccountCharacter) => void;
  compact?: boolean;
}

export function CharacterCard({ character, onClick, compact = false }: CharacterCardProps) {
  const tCommon = useTranslations('common');
  const tElement = useTranslations('element');
  const tWeapon = useTranslations('weapon');
  const tDetail = useTranslations('characterDetail');
  const { character: charInfo, level, constellation } = character;
  const elementColor = ELEMENT_COLORS[charInfo.element];
  const weaponLabel = charInfo.weaponType ? tWeapon(charInfo.weaponType) : tCommon('unknown');
  const avatarUrl = charInfo.imageUrl;

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(character)}
        className={cn(
          'relative flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition-all',
          onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-sm'
        )}
      >
        {/* Avatar placeholder */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg overflow-hidden"
          style={{ backgroundColor: `${elementColor}20` }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={charInfo.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            ELEMENT_ICONS[charInfo.element]
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm text-foreground truncate">{charInfo.name}</span>
            {constellation > 0 && (
              <span className="text-xs text-primary">C{constellation}</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">Lv. {level}</div>
        </div>

        {/* Rarity stars */}
        {charInfo.rarity && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: charInfo.rarity }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3 fill-current',
                  charInfo.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
                )}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(character)}
      className={cn(
        'relative rounded-lg border border-border bg-card overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md'
      )}
    >
      {/* Header with element color */}
      <div
        className="h-2"
        style={{ backgroundColor: elementColor }}
      />

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Avatar and basic info */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-lg text-2xl shrink-0 overflow-hidden"
            style={{ backgroundColor: `${elementColor}20` }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={charInfo.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              ELEMENT_ICONS[charInfo.element]
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{charInfo.name}</h3>
              {constellation > 0 && (
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">
                  C{constellation}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {ELEMENT_ICONS[charInfo.element]} {tElement(charInfo.element)}
              </span>
              <span>•</span>
              <span>{weaponLabel}</span>
            </div>

            {/* Rarity */}
            {charInfo.rarity && (
              <div className="mt-1 flex items-center gap-0.5">
                {Array.from({ length: charInfo.rarity }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3 fill-current',
                      charInfo.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Level */}
        <div className="mt-3 flex items-center justify-between rounded bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">{tDetail('level')}</span>
          <span className="text-lg font-bold text-foreground">{level}</span>
        </div>

        {/* Region if available */}
        {charInfo.region && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {charInfo.region}
          </div>
        )}
      </div>
    </div>
  );
}
