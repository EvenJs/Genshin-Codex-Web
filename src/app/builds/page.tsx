'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMyBuilds, useSavedBuilds, usePublicBuilds } from '@/hooks/useBuilds';
import { useCharacters } from '@/hooks/useCharacters';
import { useArtifactSets } from '@/hooks/useArtifacts';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { BuildForm } from '@/components/builds/BuildForm';
import { BuildCard } from '@/components/builds/BuildCard';
import { ChevronLeft, ChevronRight, Plus, Layers, Heart, Globe, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreateBuildDto } from '@/types/build';

type TabType = 'my' | 'saved' | 'public';

export default function BuildsPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('public');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');

  const pageSize = 12;
  const isUserMode = isLoggedIn;

  const { characters, isLoading: charactersLoading } = useCharacters();
  const { sets: artifactSets, isLoading: setsLoading } = useArtifactSets();

  const {
    items: myBuilds,
    total: myTotal,
    isLoading: myLoading,
    error: myError,
    createBuild,
  } = useMyBuilds({
    page: activeTab === 'my' ? page : 1,
    pageSize,
    characterId: selectedCharacterId || undefined,
  });

  const {
    items: savedBuilds,
    total: savedTotal,
    isLoading: savedLoading,
    error: savedError,
  } = useSavedBuilds({
    page: activeTab === 'saved' ? page : 1,
    pageSize,
    characterId: selectedCharacterId || undefined,
  });

  const {
    items: publicBuilds,
    total: publicTotal,
    isLoading: publicLoading,
    error: publicError,
  } = usePublicBuilds({
    page: activeTab === 'public' ? page : 1,
    pageSize,
    characterId: selectedCharacterId || undefined,
  });

  const handleTabChange = (tab: TabType) => {
    // Only allow public tab for non-logged in users
    if (!isUserMode && tab !== 'public') {
      return;
    }
    setActiveTab(tab);
    setPage(1);
  };

  const handleCharacterFilter = (charId: string) => {
    setSelectedCharacterId(charId);
    setPage(1);
  };

  const handleCreateBuild = async (data: CreateBuildDto) => {
    setIsSubmitting(true);
    try {
      await createBuild(data);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuildClick = (buildId: string) => {
    router.push(`/builds/${buildId}`);
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'my':
        return { items: myBuilds, total: myTotal, isLoading: myLoading, error: myError };
      case 'saved':
        return {
          items: savedBuilds.map((sb) => sb.build),
          total: savedTotal,
          isLoading: savedLoading,
          error: savedError,
        };
      case 'public':
        return { items: publicBuilds, total: publicTotal, isLoading: publicLoading, error: publicError };
    }
  };

  const { items, total, isLoading, error } = getCurrentData();
  const totalPages = Math.ceil(total / pageSize);
  const isDataLoading = authLoading || isLoading || charactersLoading || setsLoading;

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isUserMode ? 'Artifact Builds' : 'Community Builds'}
            </h1>
            {isUserMode && (
              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Build
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">
        {/* Login prompt for guests */}
        {!authLoading && !isLoggedIn && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Login to create and save your own builds
            </p>
            <Link href="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            </Link>
          </div>
        )}

        {/* Stats cards - only show all tabs for logged in users */}
        {isUserMode ? (
          <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-4">
            <StatCard
              value={myTotal}
              label="My Builds"
              icon={<Layers className="h-4 w-4" />}
              active={activeTab === 'my'}
              onClick={() => handleTabChange('my')}
            />
            <StatCard
              value={savedTotal}
              label="Saved"
              icon={<Heart className="h-4 w-4" />}
              variant="accent"
              active={activeTab === 'saved'}
              onClick={() => handleTabChange('saved')}
            />
            <StatCard
              value={publicTotal}
              label="Community"
              icon={<Globe className="h-4 w-4" />}
              active={activeTab === 'public'}
              onClick={() => handleTabChange('public')}
            />
          </div>
        ) : (
          <div className="mb-4 sm:mb-6">
            <StatCard
              value={publicTotal}
              label="Community Builds"
              icon={<Globe className="h-4 w-4" />}
              active={true}
            />
          </div>
        )}

        {/* Tab buttons (mobile) - only for logged in users */}
        {isUserMode && (
          <div className="mb-4 flex gap-1 overflow-x-auto pb-1 sm:hidden">
            <Button
              variant={activeTab === 'my' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange('my')}
            >
              My Builds
            </Button>
            <Button
              variant={activeTab === 'saved' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange('saved')}
            >
              Saved
            </Button>
            <Button
              variant={activeTab === 'public' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange('public')}
            >
              Community
            </Button>
          </div>
        )}

        {/* Character filter */}
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Character:</label>
          <select
            value={selectedCharacterId}
            onChange={(e) => handleCharacterFilter(e.target.value)}
            className="flex-1 sm:flex-none rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Characters</option>
            {characters.map((char) => (
              <option key={char.id} value={char.id}>
                {char.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {isDataLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {!isDataLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">{total} builds</div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                {activeTab === 'my' && 'No builds yet. Create your first build!'}
                {activeTab === 'saved' && 'No saved builds. Browse community builds and save your favorites!'}
                {activeTab === 'public' && 'No public builds available.'}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((build) => (
                  <BuildCard
                    key={build.id}
                    build={build}
                    showCreator={activeTab !== 'my'}
                    onClick={() => handleBuildClick(build.id)}
                  />
                ))}
              </div>
            )}

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

      {/* Create Build Sheet - only for logged in users */}
      {isUserMode && (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Create New Build</SheetTitle>
              <SheetDescription>
                Create an artifact build configuration for a character.
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <BuildForm
                characters={characters}
                artifactSets={artifactSets}
                onSubmit={handleCreateBuild}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
              />
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
  active?: boolean;
  onClick?: () => void;
}

function StatCard({ value, label, variant = 'default', icon, active, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-card p-3 sm:p-4 transition-all',
        onClick && 'cursor-pointer hover:border-primary/50',
        active ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
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
