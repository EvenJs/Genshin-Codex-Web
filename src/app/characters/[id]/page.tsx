'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMounted } from '@/hooks/useMounted';
import { useArtifacts } from '@/hooks/useArtifacts';
import { apiFetch } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ArtifactEquip } from '@/components/artifacts/ArtifactEquip';
import { ArrowLeft, Star, LogIn, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountCharacter, Element } from '@/types/character';
import { ELEMENT_COLORS, ELEMENT_NAMES, WEAPON_TYPE_NAMES } from '@/types/character';

const ELEMENT_ICONS: Record<Element, string> = {
  PYRO: '🔥',
  HYDRO: '💧',
  ANEMO: '🌀',
  ELECTRO: '⚡',
  DENDRO: '🌿',
  CRYO: '❄️',
  GEO: '🪨',
};

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const characterId = params.id as string;

  const { isLoggedIn, isLoading: authLoading, selectedAccountId } = useAuth();

  const [character, setCharacter] = useState<AccountCharacter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all artifacts for the account to get equipped and available
  const { items: allArtifacts, mutate: mutateArtifacts } = useArtifacts(selectedAccountId, {
    pageSize: 1000, // Get all artifacts
  });

  // Get equipped artifacts for this character
  const equippedArtifacts = allArtifacts.filter(
    (a) => a.equippedBy?.id === characterId
  );

  // Get available (unequipped) artifacts
  const availableArtifacts = allArtifacts.filter((a) => !a.equippedById);

  // Fetch character on mount
  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!isLoggedIn || !selectedAccountId) {
      setIsLoading(false);
      return;
    }

    // Fetch character details
    const fetchCharacter = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch<AccountCharacter>(
          `/accounts/${selectedAccountId}/characters/${characterId}`
        );
        setCharacter(data);
      } catch (err) {
        console.error('Failed to fetch character:', err);
        setError(err instanceof Error ? err.message : 'Failed to load character');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [mounted, authLoading, isLoggedIn, selectedAccountId, characterId]);

  const handleEquip = useCallback(
    async (artifactId: string) => {
      if (!selectedAccountId) return;

      await apiFetch(`/accounts/${selectedAccountId}/artifacts/${artifactId}`, {
        method: 'PATCH',
        body: JSON.stringify({ equippedById: characterId }),
      });

      await mutateArtifacts();
    },
    [selectedAccountId, characterId, mutateArtifacts]
  );

  const handleUnequip = useCallback(
    async (artifactId: string) => {
      if (!selectedAccountId) return;

      await apiFetch(`/accounts/${selectedAccountId}/artifacts/${artifactId}`, {
        method: 'PATCH',
        body: JSON.stringify({ equippedById: null }),
      });

      await mutateArtifacts();
    },
    [selectedAccountId, mutateArtifacts]
  );

  if (!mounted) {
    return null;
  }

  // Show login prompt if not logged in
  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/characters')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Character Details</h1>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
          <div className="py-12 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              View Your Character
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Login to view your character details and manage equipped artifacts.
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Character not found'}</p>
            <Button onClick={() => router.push('/characters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Characters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { character: charInfo, level, constellation } = character;
  const elementColor = ELEMENT_COLORS[charInfo.element];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="border-b border-border"
        style={{ backgroundColor: `${elementColor}10` }}
      >
        <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/characters')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl text-3xl sm:text-4xl shrink-0"
              style={{ backgroundColor: `${elementColor}30` }}
            >
              {ELEMENT_ICONS[charInfo.element]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {charInfo.name}
                </h1>
                {constellation > 0 && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-sm font-medium text-primary">
                    C{constellation}
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  {ELEMENT_ICONS[charInfo.element]} {ELEMENT_NAMES[charInfo.element]}
                </span>
                <span>•</span>
                <span>{WEAPON_TYPE_NAMES[charInfo.weaponType]}</span>
                {charInfo.region && (
                  <>
                    <span>•</span>
                    <span>{charInfo.region}</span>
                  </>
                )}
              </div>

              {/* Rarity and Level */}
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: charInfo.rarity }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4 fill-current',
                        charInfo.rarity === 5 ? 'text-amber-500' : 'text-purple-500'
                      )}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-foreground">Lv. {level}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
        {/* Artifacts Section */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Artifacts</h2>

          <ArtifactEquip
            characterName={charInfo.name}
            equippedArtifacts={equippedArtifacts}
            availableArtifacts={availableArtifacts}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        </section>
      </main>
    </div>
  );
}
