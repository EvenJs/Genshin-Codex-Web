'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ArtifactCard } from './ArtifactCard';
import { cn } from '@/lib/utils';
import type { UserArtifact, ArtifactSlot } from '@/types/artifact';
import { SLOT_NAMES, SLOT_NAMES_SHORT } from '@/types/artifact';

// Slot icons
const SLOT_ICONS: Record<ArtifactSlot, string> = {
  FLOWER: '🌸',
  PLUME: '🪶',
  SANDS: '⏳',
  GOBLET: '🏆',
  CIRCLET: '👑',
};

const SLOTS: ArtifactSlot[] = ['FLOWER', 'PLUME', 'SANDS', 'GOBLET', 'CIRCLET'];

interface ArtifactEquipProps {
  characterName: string;
  equippedArtifacts: UserArtifact[];
  availableArtifacts: UserArtifact[];
  onEquip: (artifactId: string) => Promise<void>;
  onUnequip: (artifactId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ArtifactEquip({
  characterName,
  equippedArtifacts,
  availableArtifacts,
  onEquip,
  onUnequip,
  isLoading = false,
}: ArtifactEquipProps) {
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get equipped artifact for each slot
  const getEquippedBySlot = (slot: ArtifactSlot) =>
    equippedArtifacts.find((a) => a.slot === slot);

  // Get available artifacts for selected slot
  const availableForSlot = selectedSlot
    ? availableArtifacts.filter((a) => a.slot === selectedSlot)
    : [];

  const handleSlotClick = (slot: ArtifactSlot) => {
    setSelectedSlot(slot);
  };

  const handleEquip = async (artifactId: string) => {
    setIsSubmitting(true);
    try {
      await onEquip(artifactId);
      setSelectedSlot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnequip = async (artifactId: string) => {
    setIsSubmitting(true);
    try {
      await onUnequip(artifactId);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate set bonuses
  const setCount: Record<string, number> = {};
  equippedArtifacts.forEach((a) => {
    setCount[a.set.name] = (setCount[a.set.name] || 0) + 1;
  });

  const activeBonuses = Object.entries(setCount)
    .filter(([, count]) => count >= 2)
    .map(([name, count]) => ({
      name,
      count,
      twoActive: count >= 2,
      fourActive: count >= 4,
    }));

  return (
    <div className="space-y-4">
      {/* Set Bonuses */}
      {activeBonuses.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3">
          <h3 className="mb-2 text-sm font-medium text-foreground">Active Set Bonuses</h3>
          <div className="space-y-1">
            {activeBonuses.map((bonus) => (
              <div key={bonus.name} className="flex items-center gap-2 text-sm">
                <span className="text-foreground">{bonus.name}</span>
                <div className="flex gap-1">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-xs',
                      bonus.twoActive
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    2pc
                  </span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-xs',
                      bonus.fourActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    4pc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifact Slots */}
      <div className="grid grid-cols-5 gap-2">
        {SLOTS.map((slot) => {
          const equipped = getEquippedBySlot(slot);
          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={isLoading}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg border p-2 sm:p-3 transition-all',
                equipped
                  ? 'border-primary/50 bg-primary/5 hover:border-primary'
                  : 'border-border bg-card hover:border-primary/50',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-lg sm:text-2xl mb-1">{SLOT_ICONS[slot]}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {SLOT_NAMES_SHORT[slot]}
              </span>
              {equipped && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Equipped Artifacts Preview */}
      <div className="space-y-2">
        {SLOTS.map((slot) => {
          const equipped = getEquippedBySlot(slot);
          if (!equipped) return null;
          return (
            <div key={slot} className="flex items-center gap-2">
              <ArtifactCard artifact={equipped} compact />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnequip(equipped.id)}
                disabled={isSubmitting}
                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Slot Selection Sheet */}
      <Sheet open={selectedSlot !== null} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Select {selectedSlot && SLOT_NAMES[selectedSlot]}
            </SheetTitle>
            <SheetDescription>
              Choose an artifact to equip on {characterName}
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-3">
            {/* Currently equipped */}
            {selectedSlot && getEquippedBySlot(selectedSlot) && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">Currently Equipped</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ArtifactCard artifact={getEquippedBySlot(selectedSlot)!} compact />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnequip(getEquippedBySlot(selectedSlot)!.id)}
                    disabled={isSubmitting}
                  >
                    Unequip
                  </Button>
                </div>
              </div>
            )}

            {/* Available artifacts */}
            <h4 className="text-sm font-medium text-foreground">
              Available ({availableForSlot.length})
            </h4>

            {availableForSlot.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No unequipped {selectedSlot && SLOT_NAMES_SHORT[selectedSlot].toLowerCase()}s available
              </p>
            ) : (
              <div className="space-y-2">
                {availableForSlot.map((artifact) => (
                  <div key={artifact.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <ArtifactCard artifact={artifact} compact />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEquip(artifact.id)}
                      disabled={isSubmitting}
                    >
                      Equip
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
