'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useArtifacts, useArtifactStats, useArtifactSets } from '@/hooks/useArtifacts';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ArtifactList } from '@/components/artifacts/ArtifactList';
import { ArtifactForm } from '@/components/artifacts/ArtifactForm';
import { ArtifactFilterPanel } from '@/components/artifacts/ArtifactFilterPanel';
import { ArtifactOcrUpload } from '@/components/artifacts/ArtifactOcrUpload';
import { OcrPreview } from '@/components/artifacts/OcrPreview';
import { ChevronLeft, ChevronRight, Plus, Package, Camera, PenLine, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtifactSlot, CreateArtifactDto, OcrUploadResponse } from '@/types/artifact';
import { SLOT_NAMES_SHORT } from '@/types/artifact';

type InputMode = 'manual' | 'ocr' | 'ocr-preview';

export default function ArtifactsPage() {
  const mounted = useMounted();
  const { isLoggedIn, isLoading: authLoading, selectedAccountId, accountsLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [ocrResult, setOcrResult] = useState<OcrUploadResponse | null>(null);

  // Filters
  const [selectedSetId, setSelectedSetId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlot | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<number | ''>('');
  const [selectedEquipped, setSelectedEquipped] = useState<boolean | ''>('');

  const pageSize = 20;

  const { sets: artifactSets, isLoading: setsLoading } = useArtifactSets();
  const { stats, isLoading: statsLoading } = useArtifactStats(selectedAccountId);
  const {
    items: artifacts,
    total,
    isLoading: artifactsLoading,
    error,
    toggleLock,
    deleteArtifact,
    createArtifact,
  } = useArtifacts(selectedAccountId, {
    page,
    pageSize,
    setId: selectedSetId || undefined,
    slot: selectedSlot || undefined,
    rarity: selectedRarity || undefined,
    equipped: selectedEquipped === '' ? undefined : selectedEquipped,
  });

  const isUserMode = isLoggedIn && !!selectedAccountId;

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleCreateArtifact = async (data: CreateArtifactDto) => {
    setIsSubmitting(true);
    try {
      await createArtifact(data);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const isLoading = authLoading || accountsLoading || artifactsLoading || setsLoading;

  if (!mounted) {
    return null;
  }

  // Show login prompt if not logged in
  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Artifacts</h1>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Manage Your Artifacts
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Login to add, organize, and track your artifact collection. You can also use OCR to scan artifacts from screenshots.
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                Login to Get Started
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Artifacts</h1>
            {isUserMode && (
              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Stats */}
        {isUserMode && stats && !statsLoading && (
          <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-4">
            <StatCard
              value={stats.totalCount}
              label="Total Artifacts"
              icon={<Package className="h-4 w-4" />}
            />
            <StatCard value={stats.equippedCount} label="Equipped" variant="accent" />
            <StatCard
              value={stats.unequippedCount}
              label="Unequipped"
              className="hidden sm:block"
            />
            <StatCard
              value={stats.byRarity[5] ?? 0}
              label="5-Star"
              variant="gold"
              className="hidden sm:block"
            />
          </div>
        )}

        {/* Slot quick filter */}
        {isUserMode && (
          <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
            <Button
              variant={selectedSlot === '' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => {
                setSelectedSlot('');
                handleFilterChange();
              }}
            >
              All
            </Button>
            {(['FLOWER', 'PLUME', 'SANDS', 'GOBLET', 'CIRCLET'] as ArtifactSlot[]).map((slot) => (
              <Button
                key={slot}
                variant={selectedSlot === slot ? 'default' : 'secondary'}
                size="sm"
                onClick={() => {
                  setSelectedSlot(slot);
                  handleFilterChange();
                }}
              >
                {SLOT_NAMES_SHORT[slot]}
              </Button>
            ))}
          </div>
        )}

        {/* Filters */}
        {isUserMode && (
          <div className="mb-4 sm:mb-6">
            <ArtifactFilterPanel
              artifactSets={artifactSets}
              selectedSetId={selectedSetId}
              selectedSlot={selectedSlot}
              selectedRarity={selectedRarity}
              selectedEquipped={selectedEquipped}
              onSetChange={(v) => {
                setSelectedSetId(v);
                handleFilterChange();
              }}
              onSlotChange={(v) => {
                setSelectedSlot(v);
                handleFilterChange();
              }}
              onRarityChange={(v) => {
                setSelectedRarity(v);
                handleFilterChange();
              }}
              onEquippedChange={(v) => {
                setSelectedEquipped(v);
                handleFilterChange();
              }}
            />
          </div>
        )}

        {/* List */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {!isLoading && !error && isUserMode && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">{total} artifacts</div>

            <ArtifactList
              artifacts={artifacts}
              onToggleLock={toggleLock}
              onDelete={deleteArtifact}
              emptyMessage="No artifacts found. Add your first artifact!"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Artifact Sheet */}
      {isUserMode && (
        <Sheet
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setInputMode('manual');
              setOcrResult(null);
            }
          }}
        >
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add Artifact</SheetTitle>
              <SheetDescription>
                {inputMode === 'manual'
                  ? 'Manually enter your artifact details.'
                  : inputMode === 'ocr'
                    ? 'Upload a screenshot to scan artifact stats.'
                    : 'Review and confirm the scanned artifact data.'}
              </SheetDescription>
            </SheetHeader>

            {/* Mode selector tabs */}
            {inputMode !== 'ocr-preview' && (
              <div className="flex gap-1 border-b border-border px-4 pt-2">
                <button
                  onClick={() => setInputMode('manual')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
                    inputMode === 'manual'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <PenLine className="h-4 w-4" />
                  Manual
                </button>
                <button
                  onClick={() => setInputMode('ocr')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
                    inputMode === 'ocr'
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Camera className="h-4 w-4" />
                  Scan
                </button>
              </div>
            )}

            <div className="p-4">
              {inputMode === 'manual' && (
                <ArtifactForm
                  artifactSets={artifactSets}
                  onSubmit={handleCreateArtifact}
                  onCancel={() => setIsFormOpen(false)}
                  isSubmitting={isSubmitting}
                />
              )}

              {inputMode === 'ocr' && selectedAccountId && (
                <ArtifactOcrUpload
                  accountId={selectedAccountId}
                  onOcrResult={(result) => {
                    setOcrResult(result);
                    setInputMode('ocr-preview');
                  }}
                  onCancel={() => setIsFormOpen(false)}
                />
              )}

              {inputMode === 'ocr-preview' && ocrResult && (
                <OcrPreview
                  ocrResult={ocrResult}
                  artifactSets={artifactSets}
                  onConfirm={async (data) => {
                    await handleCreateArtifact(data);
                    setOcrResult(null);
                    setInputMode('manual');
                  }}
                  onCancel={() => setIsFormOpen(false)}
                  onRetry={() => {
                    setOcrResult(null);
                    setInputMode('ocr');
                  }}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  variant?: 'default' | 'accent' | 'gold';
  icon?: React.ReactNode;
  className?: string;
}

function StatCard({ value, label, variant = 'default', icon, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-3 sm:p-4', className)}>
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold flex items-center gap-1',
          variant === 'gold' && 'text-genshin-gold',
          variant === 'accent' && 'text-accent',
          variant === 'default' && 'text-foreground'
        )}
      >
        {value}
        {icon}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
