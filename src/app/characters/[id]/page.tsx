'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMounted } from '@/hooks/useMounted';
import { useArtifacts } from '@/hooks/useArtifacts';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { ArtifactEquip } from '@/components/artifacts/ArtifactEquip';
import { ArrowLeft, Star, LogIn, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountCharacter, Character, Element } from '@/types/character';
import { ELEMENT_COLORS } from '@/types/character';

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
  const tDetail = useTranslations('characterDetail');
  const tElement = useTranslations('element');
  const tWeapon = useTranslations('weapon');
  const tNav = useTranslations('nav');
  const characterId = params.id as string;

  const { isLoggedIn, isLoading: authLoading, selectedAccountId } = useAuth();

  const [accountCharacter, setAccountCharacter] = useState<AccountCharacter | null>(null);
  const [publicCharacter, setPublicCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all artifacts for the account to get equipped and available
  const { items: allArtifacts, mutate: mutateArtifacts } = useArtifacts(selectedAccountId, {
    pageSize: 100, // API max page size is 100
  });

  const equippedArtifacts = accountCharacter
    ? allArtifacts.filter((a) => a.equippedBy?.id === accountCharacter.id)
    : [];

  // Get available (unequipped) artifacts
  const availableArtifacts = allArtifacts.filter((a) => !a.equippedById);

  // Fetch character on mount (prefer account character if owned)
  useEffect(() => {
    if (!mounted || authLoading) return;

    const fetchCharacter = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isLoggedIn && selectedAccountId) {
          try {
            const data = await apiFetch<AccountCharacter>(
              `/accounts/${selectedAccountId}/characters/${characterId}`
            );
            setAccountCharacter(data);
            setPublicCharacter(data.character);
            return;
          } catch (err) {
            if (err instanceof ApiError && err.status !== 404) {
              throw err;
            }
          }
        }

        const data = await apiFetch<Character>(`/characters/${characterId}`);
        setAccountCharacter(null);
        setPublicCharacter(data);
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="py-12 text-center text-muted-foreground">{tDetail('loading')}</div>
      </div>
    );
  }

  if (error || !publicCharacter) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || tDetail('notFound')}</p>
            <Button onClick={() => router.push('/characters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tDetail('backToCharacters')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const charInfo = publicCharacter;
  const elementColor = charInfo.element ? ELEMENT_COLORS[charInfo.element] : '#94a3b8';
  const owned = !!accountCharacter;

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
              {tDetail('back')}
            </Button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl text-3xl sm:text-4xl shrink-0 overflow-hidden"
              style={{ backgroundColor: `${elementColor}30` }}
            >
              {charInfo.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={charInfo.imageUrl}
                  alt={charInfo.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : charInfo.element ? (
                ELEMENT_ICONS[charInfo.element]
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {charInfo.name}
                </h1>
                {owned && accountCharacter && accountCharacter.constellation > 0 && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-sm font-medium text-primary">
                    C{accountCharacter.constellation}
                  </span>
                )}
              </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                {charInfo.element ? ELEMENT_ICONS[charInfo.element] : '❔'}{' '}
                {charInfo.element ? tElement(charInfo.element) : tDetail('unknown')}
              </span>
              <span>•</span>
              <span>
                {charInfo.weaponType ? tWeapon(charInfo.weaponType) : tDetail('unknown')}
              </span>
              {charInfo.region && (
                <>
                  <span>•</span>
                  <span>{charInfo.region}</span>
                  </>
                )}
              </div>

              {/* Rarity and Level */}
              <div className="mt-2 flex items-center gap-4">
                {charInfo.rarity && (
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
                )}
                {owned && accountCharacter && (
                  <span className="text-lg font-semibold text-foreground">
                    {tDetail('level')} {accountCharacter.level}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
        {!isLoggedIn && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tDetail('loginToManage')}
            </p>
            <Link href="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4 mr-1" />
                {tNav('login')}
              </Button>
            </Link>
          </div>
        )}

        {/* Detail Section */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 text-base font-semibold text-foreground">{tDetail('baseInfo')}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>{tDetail('affiliation')}：{charInfo.affiliation ?? tDetail('unknown')}</div>
              <div>{tDetail('visionAffiliation')}：{charInfo.visionAffiliation ?? tDetail('unknown')}</div>
              <div>{tDetail('role')}：{charInfo.role ?? tDetail('unknown')}</div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-2 text-base font-semibold text-foreground">{tDetail('elementWeapon')}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>{tDetail('element')}：{charInfo.element ? tElement(charInfo.element) : tDetail('unknown')}</div>
              <div>
                {tDetail('weaponType')}：{charInfo.weaponType ? tWeapon(charInfo.weaponType) : tDetail('unknown')}
              </div>
              <div>{tDetail('region')}：{charInfo.region ?? tDetail('unknown')}</div>
            </div>
          </div>
        </section>

        {/* Talents */}
        {charInfo.talents && (
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">{tDetail('talents')}</h2>
            <div className="space-y-3">
              {Object.entries(charInfo.talents).map(([title, content]) => (
                <div key={title} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 text-sm font-semibold text-foreground">{title}</div>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {content}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Constellations */}
        {charInfo.constellations && (
          <section className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">{tDetail('constellations')}</h2>
            <div className="space-y-3">
              {Object.entries(charInfo.constellations).map(([title, content]) => (
                <div key={title} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 text-sm font-semibold text-foreground">{title}</div>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {content}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Artifacts Section */}
        {owned && accountCharacter && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{tDetail('artifacts')}</h2>

            <ArtifactEquip
              characterName={charInfo.name}
              equippedArtifacts={equippedArtifacts}
              availableArtifacts={availableArtifacts}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          </section>
        )}
      </main>
    </div>
  );
}
