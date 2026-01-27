'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  ArtifactSlot,
  ArtifactSet,
  SubStat,
  CreateArtifactDto,
  OcrUploadResponse,
} from '@/types/artifact';
import { SLOT_NAMES, MAIN_STATS_BY_SLOT, SUB_STATS } from '@/types/artifact';

interface OcrPreviewProps {
  ocrResult: OcrUploadResponse;
  artifactSets: ArtifactSet[];
  onConfirm: (data: CreateArtifactDto) => Promise<void>;
  onCancel: () => void;
  onRetry: () => void;
  isSubmitting?: boolean;
}

const SLOTS: ArtifactSlot[] = ['FLOWER', 'PLUME', 'SANDS', 'GOBLET', 'CIRCLET'];
const RARITIES = [5, 4, 3, 2, 1];

export function OcrPreview({
  ocrResult,
  artifactSets,
  onConfirm,
  onCancel,
  onRetry,
  isSubmitting = false,
}: OcrPreviewProps) {
  const { result, warnings } = ocrResult;

  // Editable form state (initialized from OCR result)
  const [setId, setSetId] = useState(result.setId ?? '');
  const [slot, setSlot] = useState<ArtifactSlot>(result.slot ?? 'FLOWER');
  const [mainStat, setMainStat] = useState(result.mainStat);
  const [mainStatValue, setMainStatValue] = useState(result.mainStatValue);
  const [level, setLevel] = useState(result.level);
  const [rarity, setRarity] = useState(result.rarity);
  const [locked, setLocked] = useState(false);
  const [subStats, setSubStats] = useState<SubStat[]>(
    result.subStats.map((s) => ({ stat: s.stat, value: s.value }))
  );
  const [error, setError] = useState<string | null>(null);

  // Get available main stats for current slot
  const availableMainStats = MAIN_STATS_BY_SLOT[slot];

  // Update main stat when slot changes
  useEffect(() => {
    if (!availableMainStats.includes(mainStat)) {
      setMainStat(availableMainStats[0]);
    }
  }, [slot, mainStat, availableMainStats]);

  // Get available sub stats (exclude main stat and already used stats)
  const usedSubStats = subStats.map((s) => s.stat);
  const availableSubStats = SUB_STATS.filter((s) => s !== mainStat && !usedSubStats.includes(s));

  const handleAddSubStat = () => {
    if (subStats.length >= 4 || availableSubStats.length === 0) return;
    setSubStats([...subStats, { stat: availableSubStats[0], value: 0 }]);
  };

  const handleRemoveSubStat = (index: number) => {
    setSubStats(subStats.filter((_, i) => i !== index));
  };

  const handleSubStatChange = (index: number, field: 'stat' | 'value', value: string | number) => {
    setSubStats(
      subStats.map((s, i) =>
        i === index ? { ...s, [field]: field === 'value' ? Number(value) : value } : s
      )
    );
  };

  const handleConfirm = async () => {
    setError(null);

    if (!setId) {
      setError('Please select an artifact set');
      return;
    }

    if (subStats.length === 0) {
      setError('Please add at least one sub stat');
      return;
    }

    try {
      await onConfirm({
        setId,
        slot,
        mainStat,
        mainStatValue,
        subStats,
        level,
        rarity,
        locked,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save artifact');
    }
  };

  const confidenceColor =
    result.overallConfidence >= 0.7
      ? 'text-green-500'
      : result.overallConfidence >= 0.5
        ? 'text-yellow-500'
        : 'text-red-500';

  return (
    <div className="space-y-4">
      {/* Confidence indicator */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">OCR Confidence:</span>
          <span className={cn('text-sm font-bold', confidenceColor)}>
            {Math.round(result.overallConfidence * 100)}%
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRetry} className="text-xs">
          Re-scan
        </Button>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="rounded-lg bg-yellow-500/10 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4" />
            Please verify the following:
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-6 text-yellow-700 dark:text-yellow-300">
            {warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Editable Form */}
      <div className="space-y-4">
        {/* Artifact Set */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Artifact Set
            {result.setName && (
              <span className="ml-2 text-xs text-muted-foreground">
                (Detected: {result.setName})
              </span>
            )}
          </label>
          <select
            value={setId}
            onChange={(e) => setSetId(e.target.value)}
            className={cn(
              'w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
              !result.setId && 'border-yellow-500'
            )}
            required
          >
            <option value="">Select a set...</option>
            {artifactSets.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </div>

        {/* Slot and Rarity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as ArtifactSlot)}
              className={cn(
                'w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                !result.slot && 'border-yellow-500'
              )}
            >
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {SLOT_NAMES[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Rarity</label>
            <select
              value={rarity}
              onChange={(e) => setRarity(Number(e.target.value))}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {RARITIES.map((r) => (
                <option key={r} value={r}>
                  {'★'.repeat(r)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Level (+{level})
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>+0</span>
            <span>+20</span>
          </div>
        </div>

        {/* Main Stat */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Main Stat</label>
            <select
              value={mainStat}
              onChange={(e) => setMainStat(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {availableMainStats.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Value</label>
            <input
              type="number"
              step="0.1"
              value={mainStatValue}
              onChange={(e) => setMainStatValue(Number(e.target.value))}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Sub Stats */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Sub Stats</label>
            {subStats.length < 4 && availableSubStats.length > 0 && (
              <button
                type="button"
                onClick={handleAddSubStat}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {subStats.map((sub, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={sub.stat}
                  onChange={(e) => handleSubStatChange(index, 'stat', e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={sub.stat}>{sub.stat}</option>
                  {availableSubStats.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={sub.value}
                  onChange={(e) => handleSubStatChange(index, 'value', e.target.value)}
                  className="w-24 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Value"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSubStat(index)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {subStats.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Click &quot;Add&quot; to add sub stats</p>
          )}
        </div>

        {/* Lock */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="locked"
            checked={locked}
            onChange={(e) => setLocked(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="locked" className="text-sm text-foreground">
            Lock this artifact
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Saving...' : 'Save Artifact'}
        </Button>
      </div>
    </div>
  );
}
