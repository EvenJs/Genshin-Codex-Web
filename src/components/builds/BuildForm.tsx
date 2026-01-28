'use client';

import { useState, useEffect } from 'react';
import { X, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Character } from '@/types/character';
import type { ArtifactSet } from '@/types/artifact';
import type { Build, CreateBuildDto, RecommendedMainStats, StatWeights } from '@/types/build';
import { MAIN_STATS_BY_SLOT, SUB_STATS } from '@/types/artifact';
import { STAT_PRIORITY_OPTIONS, DEFAULT_STAT_WEIGHTS, STAT_WEIGHT_KEYS } from '@/types/build';
import { ELEMENT_COLORS } from '@/types/character';

interface BuildFormProps {
  characters: Character[];
  artifactSets: ArtifactSet[];
  initialData?: Build;
  onSubmit: (data: CreateBuildDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BuildForm({
  characters,
  artifactSets,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BuildFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [characterId, setCharacterId] = useState(initialData?.character.id ?? '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [primarySetId, setPrimarySetId] = useState(initialData?.primarySet.id ?? '');
  const [secondarySetId, setSecondarySetId] = useState(initialData?.secondarySet?.id ?? '');
  const [useFullSet, setUseFullSet] = useState(initialData?.useFullSet ?? true);
  const [recommendedMainStats, setRecommendedMainStats] = useState<RecommendedMainStats>(
    initialData?.recommendedMainStats ?? {}
  );
  const [subStatPriority, setSubStatPriority] = useState<string[]>(
    initialData?.subStatPriority ?? ['Crit Rate%', 'Crit DMG%']
  );
  const [useCustomWeights, setUseCustomWeights] = useState(!!initialData?.statWeights);
  const [statWeights, setStatWeights] = useState<StatWeights>(
    initialData?.statWeights ?? DEFAULT_STAT_WEIGHTS
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  // Get selected character for element-based main stat suggestions
  const selectedCharacter = characters.find((c) => c.id === characterId);

  // Filter artifact sets that have 4-piece bonus for primary
  const primarySets = artifactSets.filter((s) => s.fourPieceBonus);

  // Available sub stats for priority (excluding already selected ones)
  const availablePriorityStats = STAT_PRIORITY_OPTIONS.filter((s) => !subStatPriority.includes(s));

  const handleAddPriorityStat = () => {
    if (subStatPriority.length >= 6 || availablePriorityStats.length === 0) return;
    setSubStatPriority([...subStatPriority, availablePriorityStats[0]]);
  };

  const handleRemovePriorityStat = (index: number) => {
    if (subStatPriority.length <= 1) return;
    setSubStatPriority(subStatPriority.filter((_, i) => i !== index));
  };

  const handlePriorityStatChange = (index: number, value: string) => {
    setSubStatPriority(subStatPriority.map((s, i) => (i === index ? value : s)));
  };

  const handleMovePriorityStat = (index: number, direction: 'up' | 'down') => {
    const newPriority = [...subStatPriority];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPriority.length) return;
    [newPriority[index], newPriority[targetIndex]] = [newPriority[targetIndex], newPriority[index]];
    setSubStatPriority(newPriority);
  };

  const handleStatWeightChange = (key: keyof StatWeights, value: number) => {
    setStatWeights((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a build name');
      return;
    }

    if (!characterId) {
      setError('Please select a character');
      return;
    }

    if (!primarySetId) {
      setError('Please select a primary artifact set');
      return;
    }

    if (!useFullSet && !secondarySetId) {
      setError('Please select a secondary artifact set for 2+2 builds');
      return;
    }

    if (subStatPriority.length === 0) {
      setError('Please add at least one sub stat priority');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        characterId,
        isPublic,
        primarySetId,
        secondarySetId: useFullSet ? undefined : secondarySetId,
        useFullSet,
        recommendedMainStats,
        subStatPriority,
        statWeights: useCustomWeights ? statWeights : undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save build');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Build Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Build Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Freeze Ganyu"
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      {/* Character */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Character</label>
        <select
          value={characterId}
          onChange={(e) => setCharacterId(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        >
          <option value="">Select a character...</option>
          {characters.map((char) => (
            <option key={char.id} value={char.id}>
              {char.name} ({char.element})
            </option>
          ))}
        </select>
        {selectedCharacter && (
          <div
            className="mt-1 text-xs"
            style={{ color: ELEMENT_COLORS[selectedCharacter.element] }}
          >
            {selectedCharacter.rarity}★ {selectedCharacter.element} {selectedCharacter.weaponType}
          </div>
        )}
      </div>

      {/* Set Configuration */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Set Configuration</label>
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={useFullSet ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUseFullSet(true)}
          >
            4-Piece
          </Button>
          <Button
            type="button"
            variant={!useFullSet ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUseFullSet(false)}
          >
            2+2 Piece
          </Button>
        </div>
      </div>

      {/* Primary Set */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {useFullSet ? 'Artifact Set (4pc)' : 'Primary Set (2pc)'}
        </label>
        <select
          value={primarySetId}
          onChange={(e) => setPrimarySetId(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          required
        >
          <option value="">Select a set...</option>
          {primarySets.map((set) => (
            <option key={set.id} value={set.id}>
              {set.name}
            </option>
          ))}
        </select>
      </div>

      {/* Secondary Set (only for 2+2) */}
      {!useFullSet && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Secondary Set (2pc)
          </label>
          <select
            value={secondarySetId}
            onChange={(e) => setSecondarySetId(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          >
            <option value="">Select a set...</option>
            {artifactSets
              .filter((s) => s.id !== primarySetId)
              .map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Recommended Main Stats */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Recommended Main Stats
        </label>
        <div className="space-y-2">
          {(['SANDS', 'GOBLET', 'CIRCLET'] as const).map((slot) => (
            <div key={slot} className="flex items-center gap-2">
              <span className="w-16 text-sm text-muted-foreground">{slot}</span>
              <select
                value={recommendedMainStats[slot] ?? ''}
                onChange={(e) =>
                  setRecommendedMainStats((prev) => ({
                    ...prev,
                    [slot]: e.target.value || undefined,
                  }))
                }
                className="flex-1 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Any</option>
                {MAIN_STATS_BY_SLOT[slot].map((stat) => (
                  <option key={stat} value={stat}>
                    {stat}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Sub Stat Priority */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Sub Stat Priority</label>
          {subStatPriority.length < 6 && availablePriorityStats.length > 0 && (
            <button
              type="button"
              onClick={handleAddPriorityStat}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Order from highest to lowest priority (drag to reorder)
        </p>
        <div className="space-y-2">
          {subStatPriority.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6 text-center text-xs text-muted-foreground">{index + 1}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMovePriorityStat(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMovePriorityStat(index, 'down')}
                  disabled={index === subStatPriority.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <select
                value={stat}
                onChange={(e) => handlePriorityStatChange(index, e.target.value)}
                className="flex-1 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={stat}>{stat}</option>
                {availablePriorityStats.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {subStatPriority.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePriorityStat(index)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Stat Weights (Advanced) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="customWeights"
            checked={useCustomWeights}
            onChange={(e) => setUseCustomWeights(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="customWeights" className="text-sm font-medium text-foreground">
            Use custom stat weights (Advanced)
          </label>
        </div>
        {useCustomWeights && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">
              Higher weight = more valuable. Default: Crit Rate=2, Crit DMG=1
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STAT_WEIGHT_KEYS).map(([statName, key]) => (
                <div key={key} className="flex items-center gap-2">
                  <label className="flex-1 text-xs text-muted-foreground truncate">
                    {statName}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={statWeights[key] ?? 0}
                    onChange={(e) => handleStatWeightChange(key, Number(e.target.value))}
                    className="w-16 rounded border border-input bg-card px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this build..."
          rows={2}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes, tips, or playstyle advice..."
          rows={2}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {/* Public */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <label htmlFor="isPublic" className="text-sm text-foreground">
          Share this build publicly
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Build' : 'Create Build'}
        </Button>
      </div>
    </form>
  );
}
