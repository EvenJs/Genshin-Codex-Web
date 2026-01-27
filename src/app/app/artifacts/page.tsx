'use client';

import { useState, useEffect } from 'react';
import { getToken } from '@/lib/authToken';
import { useAccounts } from '@/hooks/useAccounts';
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
import { ChevronLeft, ChevronRight, Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '@/types/account';
import type { ArtifactSlot, UserArtifact, CreateArtifactDto } from '@/types/artifact';
import { SLOT_NAMES_SHORT } from '@/types/artifact';

const SELECTED_ACCOUNT_KEY = 'selected_account_id';

export default function ArtifactsPage() {
  const mounted = useMounted();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [selectedSetId, setSelectedSetId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ArtifactSlot | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<number | ''>('');
  const [selectedEquipped, setSelectedEquipped] = useState<boolean | ''>('');

  const pageSize = 20;

  const { accounts, isLoading: accountsLoading } = useAccounts();
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

  // Auth check on mount
  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
    }
  }, [mounted]);

  // Initialize selected account from localStorage
  useEffect(() => {
    if (!mounted || accounts.length === 0 || selectedAccountId) return;

    const savedId = localStorage.getItem(SELECTED_ACCOUNT_KEY);
    const validId = accounts.find((a) => a.id === savedId)?.id ?? accounts[0].id;
    setSelectedAccountId(validId);
    localStorage.setItem(SELECTED_ACCOUNT_KEY, validId);
  }, [mounted, accounts, selectedAccountId]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
    setPage(1);
  };

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
  const isLoading = accountsLoading || artifactsLoading || setsLoading;

  const getAccountDisplay = (account: Account) => {
    return account.nickname || `${account.uid} (${account.server})`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Artifacts</h1>
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Account selector */}
        {accounts.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Account:</label>
            <select
              value={selectedAccountId ?? ''}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {getAccountDisplay(account)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stats */}
        {stats && !statsLoading && (
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

        {/* Filters */}
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

        {/* List */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {!isLoading && !error && (
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
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Artifact</SheetTitle>
            <SheetDescription>
              Manually enter your artifact details.
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <ArtifactForm
              artifactSets={artifactSets}
              onSubmit={handleCreateArtifact}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>
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
