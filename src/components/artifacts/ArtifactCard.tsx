'use client';

import { Lock, Unlock, User, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserArtifact, ArtifactSlot } from '@/types/artifact';
import { SLOT_NAMES_SHORT } from '@/types/artifact';

// Slot icons (using Unicode symbols for simplicity)
const SLOT_ICONS: Record<ArtifactSlot, string> = {
  FLOWER: '🌸',
  PLUME: '🪶',
  SANDS: '⏳',
  GOBLET: '🏆',
  CIRCLET: '👑',
};

// Rarity colors
const RARITY_COLORS: Record<number, string> = {
  5: 'from-amber-500/20 to-amber-600/10 border-amber-500/50',
  4: 'from-purple-500/20 to-purple-600/10 border-purple-500/50',
  3: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
  2: 'from-green-500/20 to-green-600/10 border-green-500/50',
  1: 'from-gray-500/20 to-gray-600/10 border-gray-500/50',
};

const RARITY_TEXT_COLORS: Record<number, string> = {
  5: 'text-amber-500',
  4: 'text-purple-500',
  3: 'text-blue-500',
  2: 'text-green-500',
  1: 'text-gray-500',
};

interface ArtifactCardProps {
  artifact: UserArtifact;
  onToggleLock?: (artifactId: string, locked: boolean) => void;
  onDelete?: (artifactId: string) => void;
  onClick?: (artifact: UserArtifact) => void;
  compact?: boolean;
}

export function ArtifactCard({
  artifact,
  onToggleLock,
  onDelete,
  onClick,
  compact = false,
}: ArtifactCardProps) {
  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLock?.(artifact.id, !artifact.locked);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this artifact?')) {
      onDelete?.(artifact.id);
    }
  };

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(artifact)}
        className={cn(
          'relative flex items-center gap-2 rounded-lg border bg-gradient-to-br p-2 transition-all',
          RARITY_COLORS[artifact.rarity] || RARITY_COLORS[1],
          onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-md'
        )}
      >
        {/* Slot icon */}
        <div className="flex h-8 w-8 items-center justify-center text-lg">
          {SLOT_ICONS[artifact.slot]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-foreground truncate">
              {artifact.set.name}
            </span>
            <span className="text-xs text-muted-foreground">+{artifact.level}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate">{artifact.mainStat}</div>
        </div>

        {/* Lock indicator */}
        {artifact.locked && <Lock className="h-3 w-3 text-genshin-gold shrink-0" />}

        {/* Equipped indicator */}
        {artifact.equippedBy && (
          <div className="flex items-center text-xs text-accent shrink-0">
            <User className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick?.(artifact)}
      className={cn(
        'relative rounded-lg border bg-gradient-to-br transition-all',
        RARITY_COLORS[artifact.rarity] || RARITY_COLORS[1],
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-md'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{SLOT_ICONS[artifact.slot]}</span>
          <span className="text-xs font-medium text-muted-foreground">
            {SLOT_NAMES_SHORT[artifact.slot]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Rarity stars */}
          {Array.from({ length: artifact.rarity }).map((_, i) => (
            <Star
              key={i}
              className={cn('h-3 w-3 fill-current', RARITY_TEXT_COLORS[artifact.rarity])}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Set name and level */}
        <div className="mb-2">
          <h3 className="font-medium text-sm text-foreground truncate">{artifact.set.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>+{artifact.level}</span>
            {artifact.equippedBy && (
              <span className="flex items-center gap-1 text-accent">
                <User className="h-3 w-3" />
                {artifact.equippedBy.character.name}
              </span>
            )}
          </div>
        </div>

        {/* Main stat */}
        <div className="mb-2 rounded bg-card/50 px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{artifact.mainStat}</span>
            <span className="text-sm font-semibold text-foreground">
              {formatStatValue(artifact.mainStat, artifact.mainStatValue)}
            </span>
          </div>
        </div>

        {/* Sub stats */}
        <div className="space-y-1">
          {artifact.subStats.map((sub, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{sub.stat}</span>
              <span className="text-foreground">{formatStatValue(sub.stat, sub.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border/50 px-3 py-2">
        <button
          onClick={handleLockClick}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors',
            artifact.locked
              ? 'bg-genshin-gold/20 text-genshin-gold hover:bg-genshin-gold/30'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          {artifact.locked ? (
            <>
              <Lock className="h-3 w-3" /> Locked
            </>
          ) : (
            <>
              <Unlock className="h-3 w-3" /> Unlocked
            </>
          )}
        </button>

        {onDelete && !artifact.locked && (
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatStatValue(stat: string, value: number): string {
  if (stat.includes('%')) {
    return `${value.toFixed(1)}%`;
  }
  return Math.round(value).toLocaleString();
}
