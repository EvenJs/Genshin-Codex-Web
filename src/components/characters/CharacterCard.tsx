'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import type { AccountCharacter, Element, Character } from '@/types/character';
import { ELEMENT_COLORS, ELEMENT_GRADIENTS, ELEMENT_GRADIENTS_DARK } from '@/types/character';

// Element icons
const ELEMENT_ICONS: Record<Element, string> = {
  PYRO: '🔥',
  HYDRO: '💧',
  ANEMO: '🌀',
  ELECTRO: '⚡',
  DENDRO: '🌿',
  CRYO: '❄️',
  GEO: '🪨',
};

// Role icons based on character role
const ROLE_DISPLAY: Record<string, { icon: string; label: string }> = {
  '主C': { icon: '⚔️', label: 'Main DPS' },
  '副C': { icon: '🗡️', label: 'Sub DPS' },
  '辅助': { icon: '🛡️', label: 'Support' },
  '治疗': { icon: '💚', label: 'Healer' },
  '护盾': { icon: '🔰', label: 'Shield' },
  输出: { icon: '⚔️', label: 'DPS' },
  站场: { icon: '⚔️', label: 'Main DPS' },
  后台: { icon: '🗡️', label: 'Sub DPS' },
  增伤: { icon: '📈', label: 'Buffer' },
  减抗: { icon: '📉', label: 'Debuffer' },
};

function parseRoles(role: string | null): { icon: string; label: string }[] {
  if (!role) return [];
  const roles: { icon: string; label: string }[] = [];
  for (const [key, value] of Object.entries(ROLE_DISPLAY)) {
    if (role.includes(key)) {
      roles.push(value);
    }
  }
  return roles.slice(0, 3); // Max 3 roles
}

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
  const { resolvedTheme } = useTheme();
  const { character: charInfo, level, constellation } = character;
  const elementColor = ELEMENT_COLORS[charInfo.element];
  const weaponLabel = charInfo.weaponType ? tWeapon(charInfo.weaponType) : tCommon('unknown');
  const avatarUrl = charInfo.imageUrl;
  const roles = parseRoles(charInfo.role);
  const gradient =
    resolvedTheme === 'dark'
      ? ELEMENT_GRADIENTS_DARK[charInfo.element]
      : ELEMENT_GRADIENTS[charInfo.element];

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(character)}
        className={cn(
          'relative flex items-center gap-3 rounded-xl border border-border bg-card p-2 transition-all duration-200',
          onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
        )}
      >
        {/* Avatar placeholder */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg overflow-hidden"
          style={{ backgroundColor: `${elementColor}20` }}
        >
          {avatarUrl ? (
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
            <span className="font-semibold text-sm text-foreground truncate">{charInfo.name}</span>
            {constellation > 0 && (
              <span className="text-xs text-primary font-medium">C{constellation}</span>
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
        'relative rounded-xl border border-border overflow-hidden transition-all duration-200 group',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
      )}
      style={{
        background: gradient,
      }}
    >
      {/* Header with element color */}
      <div
        className="h-1.5 transition-all duration-200 group-hover:h-2"
        style={{ backgroundColor: elementColor }}
      />

      {/* Content */}
      <div className="p-2.5">
        {/* Avatar and basic info */}
        <div className="flex items-start gap-2.5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl shrink-0 overflow-hidden shadow-sm"
            style={{ backgroundColor: `${elementColor}25` }}
          >
            {avatarUrl ? (
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
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-foreground truncate text-sm">{charInfo.name}</h3>
              {constellation > 0 && (
                <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  C{constellation}
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                {ELEMENT_ICONS[charInfo.element]} {tElement(charInfo.element)}
              </span>
              <span>•</span>
              <span className="truncate">{weaponLabel}</span>
            </div>

            {/* Rarity */}
            {charInfo.rarity && (
              <div className="mt-0.5 flex items-center gap-0.5">
                {Array.from({ length: charInfo.rarity }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-2.5 w-2.5 fill-current',
                      charInfo.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Level */}
        <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-1.5">
          <span className="text-xs text-muted-foreground">{tDetail('level')}</span>
          <span className="text-sm font-bold text-foreground">{level}</span>
        </div>

        {/* Role icons */}
        {roles.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {roles.map((role, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                title={role.label}
              >
                {role.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Public character card for non-logged-in users
interface PublicCharacterCardProps {
  character: Character;
  onClick?: (character: Character) => void;
}

export function PublicCharacterCard({ character, onClick }: PublicCharacterCardProps) {
  const tElement = useTranslations('element');
  const tWeapon = useTranslations('weapon');
  const tCommon = useTranslations('common');
  const { resolvedTheme } = useTheme();
  const elementColor = ELEMENT_COLORS[character.element];
  const avatarUrl = character.imageUrl;
  const roles = parseRoles(character.role);
  const gradient =
    resolvedTheme === 'dark'
      ? ELEMENT_GRADIENTS_DARK[character.element]
      : ELEMENT_GRADIENTS[character.element];

  return (
    <div
      onClick={() => onClick?.(character)}
      className={cn(
        'rounded-xl border border-border overflow-hidden transition-all duration-200 group',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
      )}
      style={{
        background: gradient,
      }}
    >
      {/* Header with element color */}
      <div
        className="h-1.5 transition-all duration-200 group-hover:h-2"
        style={{ backgroundColor: elementColor }}
      />

      <div className="p-2.5">
        {/* Avatar */}
        <div className="flex justify-center mb-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: `${elementColor}25` }}
          >
            {avatarUrl ? (
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

        {/* Name */}
        <h3 className="font-bold text-foreground text-center text-sm truncate">
          {character.name}
        </h3>

        {/* Element & Weapon */}
        <div className="mt-1 text-center text-[11px] text-muted-foreground">
          {tElement(character.element)} ·{' '}
          {character.weaponType ? tWeapon(character.weaponType) : tCommon('unknown')}
        </div>

        {/* Rarity */}
        {character.rarity && (
          <div className="mt-1 flex justify-center">
            <span
              className={cn(
                'text-[10px]',
                character.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
              )}
            >
              {'★'.repeat(character.rarity)}
            </span>
          </div>
        )}

        {/* Region */}
        {character.region && (
          <div className="mt-1 text-center text-[10px] text-muted-foreground">
            {character.region}
          </div>
        )}

        {/* Role icons */}
        {roles.length > 0 && (
          <div className="mt-1.5 flex items-center justify-center gap-1">
            {roles.map((role, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-muted/60 px-1 py-0.5 text-[10px]"
                title={role.label}
              >
                {role.icon}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
