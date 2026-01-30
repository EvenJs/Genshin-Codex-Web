'use client';

import { Heart, Users, Lock, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Build } from '@/types/build';
import { ELEMENT_COLORS } from '@/types/character';
import { getArtifactSlotShortLabel, getArtifactStatLabel } from '@/lib/artifactI18n';

interface BuildCardProps {
  build: Build;
  variant?: 'default' | 'compact';
  showCreator?: boolean;
  onClick?: () => void;
}

export function BuildCard({
  build,
  variant = 'default',
  showCreator = true,
  onClick,
}: BuildCardProps) {
  const tBuildCard = useTranslations('buildCard');
  const tSlotShort = useTranslations('artifactSlotShort');
  const tStat = useTranslations('artifactStat');
  const tElement = useTranslations('element');
  const elementColor = ELEMENT_COLORS[build.character.element];

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors',
          onClick && 'cursor-pointer hover:border-primary/50 hover:bg-card/80'
        )}
      >
        {/* Character avatar placeholder */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: elementColor }}
        >
          {build.character.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{build.name}</span>
            {build.isPublic ? (
              <Globe className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {build.character.name} •{' '}
            {build.useFullSet ? tBuildCard('fullSetShort') : tBuildCard('mixSetShort')}{' '}
            {build.primarySet.name}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span>{build.saveCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border bg-card overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md'
      )}
    >
      {/* Header with element gradient */}
      <div
        className="h-2"
        style={{
          background: `linear-gradient(90deg, ${elementColor}, ${elementColor}80)`,
        }}
      />

      <div className="p-4">
        {/* Character & Build name */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundColor: elementColor }}
          >
            {build.character.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{build.name}</h3>
              {build.isPublic ? (
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {build.character.name}
              <span className="mx-1">•</span>
              <span style={{ color: elementColor }}>{tElement(build.character.element)}</span>
            </p>
          </div>
        </div>

        {/* Set info */}
        <div className="mb-3 p-2 rounded bg-muted/30">
          <div className="text-sm font-medium text-foreground">
            {build.useFullSet ? tBuildCard('fullSetShort') : tBuildCard('twoPieceShort')}{' '}
            {build.primarySet.name}
          </div>
          {!build.useFullSet && build.secondarySet && (
            <div className="text-sm text-muted-foreground">
              {tBuildCard('secondaryTwoPiece', { name: build.secondarySet.name })}
            </div>
          )}
        </div>

        {/* Main stats recommendation */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">
            {tBuildCard('recommendedMainStats')}
          </div>
          <div className="flex flex-wrap gap-1">
            {build.recommendedMainStats.SANDS && (
              <span className="px-2 py-0.5 rounded bg-muted text-xs text-foreground">
                {getArtifactSlotShortLabel(tSlotShort, 'SANDS')}:{' '}
                {getArtifactStatLabel(tStat, build.recommendedMainStats.SANDS)}
              </span>
            )}
            {build.recommendedMainStats.GOBLET && (
              <span className="px-2 py-0.5 rounded bg-muted text-xs text-foreground">
                {getArtifactSlotShortLabel(tSlotShort, 'GOBLET')}:{' '}
                {getArtifactStatLabel(tStat, build.recommendedMainStats.GOBLET)}
              </span>
            )}
            {build.recommendedMainStats.CIRCLET && (
              <span className="px-2 py-0.5 rounded bg-muted text-xs text-foreground">
                {getArtifactSlotShortLabel(tSlotShort, 'CIRCLET')}:{' '}
                {getArtifactStatLabel(tStat, build.recommendedMainStats.CIRCLET)}
              </span>
            )}
          </div>
        </div>

        {/* Sub stat priority */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">{tBuildCard('subStatPriority')}</div>
          <div className="text-sm text-foreground truncate">
            {build.subStatPriority
              .slice(0, 4)
              .map((stat) => getArtifactStatLabel(tStat, stat))
              .join(tBuildCard('prioritySeparator'))}
            {build.subStatPriority.length > 4 && tBuildCard('priorityOverflow')}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {showCreator && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{build.creator.email.split('@')[0]}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-muted-foreground">{build.saveCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
