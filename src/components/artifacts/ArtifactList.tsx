'use client';

import { useTranslations } from 'next-intl';
import { ArtifactCard } from './ArtifactCard';
import type { UserArtifact } from '@/types/artifact';

interface ArtifactListProps {
  artifacts: UserArtifact[];
  onToggleLock?: (artifactId: string, locked: boolean) => void;
  onDelete?: (artifactId: string) => void;
  onClick?: (artifact: UserArtifact) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export function ArtifactList({
  artifacts,
  onToggleLock,
  onDelete,
  onClick,
  compact = false,
  emptyMessage,
}: ArtifactListProps) {
  const tArtifactsPage = useTranslations('artifactsPage');
  const resolvedEmptyMessage = emptyMessage ?? tArtifactsPage('emptyMessage');
  if (artifacts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {resolvedEmptyMessage}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            onToggleLock={onToggleLock}
            onDelete={onDelete}
            onClick={onClick}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {artifacts.map((artifact) => (
        <ArtifactCard
          key={artifact.id}
          artifact={artifact}
          onToggleLock={onToggleLock}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
