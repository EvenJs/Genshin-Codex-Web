'use client';

import { Filter } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ArtifactSlot, ArtifactSet } from '@/types/artifact';
import { SLOT_NAMES_SHORT } from '@/types/artifact';

interface ArtifactFilterPanelProps {
  artifactSets: ArtifactSet[];
  selectedSetId: string;
  selectedSlot: ArtifactSlot | '';
  selectedRarity: number | '';
  selectedEquipped: boolean | '';
  onSetChange: (setId: string) => void;
  onSlotChange: (slot: ArtifactSlot | '') => void;
  onRarityChange: (rarity: number | '') => void;
  onEquippedChange: (equipped: boolean | '') => void;
}

const SLOTS: ArtifactSlot[] = ['FLOWER', 'PLUME', 'SANDS', 'GOBLET', 'CIRCLET'];
const RARITIES = [5, 4, 3];

export function ArtifactFilterPanel({
  artifactSets,
  selectedSetId,
  selectedSlot,
  selectedRarity,
  selectedEquipped,
  onSetChange,
  onSlotChange,
  onRarityChange,
  onEquippedChange,
}: ArtifactFilterPanelProps) {
  const selectClassName =
    'flex-1 sm:flex-none sm:w-40 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  const filterContent = (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
      {/* Set filter */}
      <select
        value={selectedSetId}
        onChange={(e) => onSetChange(e.target.value)}
        className={selectClassName}
      >
        <option value="">All Sets</option>
        {artifactSets.map((set) => (
          <option key={set.id} value={set.id}>
            {set.name}
          </option>
        ))}
      </select>

      {/* Slot filter */}
      <select
        value={selectedSlot}
        onChange={(e) => onSlotChange(e.target.value as ArtifactSlot | '')}
        className={selectClassName}
      >
        <option value="">All Slots</option>
        {SLOTS.map((slot) => (
          <option key={slot} value={slot}>
            {SLOT_NAMES_SHORT[slot]}
          </option>
        ))}
      </select>

      {/* Rarity filter */}
      <select
        value={selectedRarity}
        onChange={(e) =>
          onRarityChange(e.target.value ? Number(e.target.value) : '')
        }
        className={selectClassName}
      >
        <option value="">All Rarities</option>
        {RARITIES.map((r) => (
          <option key={r} value={r}>
            {'★'.repeat(r)}
          </option>
        ))}
      </select>

      {/* Equipped filter */}
      <select
        value={selectedEquipped === '' ? '' : selectedEquipped ? 'true' : 'false'}
        onChange={(e) => {
          const val = e.target.value;
          onEquippedChange(val === '' ? '' : val === 'true');
        }}
        className={selectClassName}
      >
        <option value="">All</option>
        <option value="true">Equipped</option>
        <option value="false">Unequipped</option>
      </select>
    </div>
  );

  return (
    <>
      {/* Mobile: Collapsible */}
      <div className="md:hidden">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              <span className="text-xs text-muted-foreground">Tap to expand</span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">{filterContent}</CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop: Always visible */}
      <div className="hidden md:block">{filterContent}</div>
    </>
  );
}
