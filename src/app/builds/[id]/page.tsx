'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUserId } from '@/lib/authToken';
import { useBuild, useSavedBuilds, useMyBuilds } from '@/hooks/useBuilds';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountCharacters } from '@/hooks/useCharacters';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useArtifactSets } from '@/hooks/useArtifacts';
import { useCharacters } from '@/hooks/useCharacters';
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
import { RecommendationResult } from '@/components/builds/RecommendationResult';
import {
  ArrowLeft,
  Heart,
  HeartOff,
  Share2,
  Edit,
  Trash2,
  Globe,
  Lock,
  Sparkles,
  Check,
  LogIn,
} from 'lucide-react';
import { ELEMENT_COLORS } from '@/types/character';
import type { UpdateBuildDto } from '@/types/build';

export default function BuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mounted = useMounted();
  const buildId = params.id as string;

  const { isLoggedIn, isLoading: authLoading, selectedAccountId } = useAuth();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localSelectedAccountId, setLocalSelectedAccountId] = useState<string | null>(selectedAccountId);

  const { build, isLoading: buildLoading, error: buildError, mutate: mutateBuild } = useBuild(buildId);
  const { accounts } = useAccounts();
  const { characters: accountCharacters } = useAccountCharacters(localSelectedAccountId);
  const { characters } = useCharacters();
  const { sets: artifactSets } = useArtifactSets();
  const { items: savedBuilds, saveBuild, unsaveBuild } = useSavedBuilds();
  const { updateBuild, deleteBuild } = useMyBuilds();

  // Find if this build is saved by current user
  const savedBuildEntry = savedBuilds.find((sb) => sb.buildId === buildId);
  const isSaved = !!savedBuildEntry;

  // Check if current user owns this build
  const currentUserId = mounted ? getCurrentUserId() : null;
  const isOwner = build?.creator.id === currentUserId;

  // Find the character in account (for recommendations)
  const accountCharacter = accountCharacters.find((ac) => ac.characterId === build?.character.id);

  // Recommendations
  const {
    result: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError,
  } = useRecommendations(
    showRecommendations ? localSelectedAccountId : null,
    showRecommendations && accountCharacter ? accountCharacter.id : null,
    { buildId }
  );

  // Initialize local selected account from context
  useEffect(() => {
    if (selectedAccountId && !localSelectedAccountId) {
      setLocalSelectedAccountId(selectedAccountId);
    }
  }, [selectedAccountId, localSelectedAccountId]);

  const handleAccountChange = (accountId: string) => {
    setLocalSelectedAccountId(accountId);
    setShowRecommendations(false);
  };

  const handleSaveToggle = async () => {
    if (isSaved && savedBuildEntry) {
      await unsaveBuild(savedBuildEntry.id);
    } else {
      await saveBuild({ buildId });
    }
  };

  const handleEdit = async (data: UpdateBuildDto) => {
    setIsSubmitting(true);
    try {
      await updateBuild(buildId, data);
      await mutateBuild();
      setIsEditOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this build?')) return;
    await deleteBuild(buildId);
    router.push('/builds');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetRecommendations = () => {
    if (!accountCharacter) {
      alert(`You don't have ${build?.character.name} in this account. Add the character first to get recommendations.`);
      return;
    }
    setShowRecommendations(true);
  };

  if (!mounted) {
    return null;
  }

  if (buildLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (buildError || !build) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-destructive">Build not found or access denied</div>
        <Button variant="outline" onClick={() => router.push('/builds')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Builds
        </Button>
      </div>
    );
  }

  const elementColor = ELEMENT_COLORS[build.character.element];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${elementColor}15 0%, transparent 100%)`,
        }}
      >
        <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/builds')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>

          <div className="flex items-start gap-4">
            {/* Character avatar */}
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
              style={{ backgroundColor: elementColor }}
            >
              {build.character.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{build.name}</h1>
                {build.isPublic ? (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-muted-foreground">
                {build.character.name}
                <span className="mx-2">•</span>
                <span style={{ color: elementColor }}>{build.character.element}</span>
                <span className="mx-2">•</span>
                {build.character.weaponType}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                by {build.creator.email.split('@')[0]}
                <span className="mx-2">•</span>
                <Heart className="h-3 w-3 inline text-pink-500" /> {build.saveCount} saves
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {isLoggedIn && !isOwner && (
                <Button
                  variant={isSaved ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleSaveToggle}
                >
                  {isSaved ? (
                    <>
                      <HeartOff className="h-4 w-4 mr-1" />
                      Unsave
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </>
                )}
              </Button>
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6 space-y-6">
        {/* Login prompt for guests */}
        {!isLoggedIn && (
          <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Login to save builds and get personalized recommendations
            </p>
            <Link href="/login">
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            </Link>
          </div>
        )}

        {/* Description */}
        {build.description && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-foreground">{build.description}</p>
          </div>
        )}

        {/* Artifact Set Configuration */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Artifact Set</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm font-medium">
                {build.useFullSet ? '4pc' : '2pc'}
              </span>
              <span className="text-foreground font-medium">{build.primarySet.name}</span>
            </div>
            {build.primarySet.fourPieceBonus && build.useFullSet && (
              <p className="text-sm text-muted-foreground pl-12">
                {build.primarySet.fourPieceBonus}
              </p>
            )}
            {!build.useFullSet && build.primarySet.twoPieceBonus && (
              <p className="text-sm text-muted-foreground pl-12">
                {build.primarySet.twoPieceBonus}
              </p>
            )}

            {!build.useFullSet && build.secondarySet && (
              <>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-1 rounded bg-accent/10 text-accent text-sm font-medium">
                    2pc
                  </span>
                  <span className="text-foreground font-medium">{build.secondarySet.name}</span>
                </div>
                <p className="text-sm text-muted-foreground pl-12">
                  {build.secondarySet.twoPieceBonus}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Recommended Main Stats */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Recommended Main Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Sands</div>
              <div className="px-3 py-2 rounded bg-muted text-foreground text-center">
                {build.recommendedMainStats.SANDS || 'Any'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Goblet</div>
              <div className="px-3 py-2 rounded bg-muted text-foreground text-center">
                {build.recommendedMainStats.GOBLET || 'Any'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Circlet</div>
              <div className="px-3 py-2 rounded bg-muted text-foreground text-center">
                {build.recommendedMainStats.CIRCLET || 'Any'}
              </div>
            </div>
          </div>
        </div>

        {/* Sub Stat Priority */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Sub Stat Priority</h2>
          <div className="flex flex-wrap gap-2">
            {build.subStatPriority.map((stat, index) => (
              <div key={stat} className="flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="px-2 py-1 rounded bg-muted text-foreground text-sm">{stat}</span>
                {index < build.subStatPriority.length - 1 && (
                  <span className="text-muted-foreground">{'>'}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {build.notes && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold text-foreground mb-3">Notes</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{build.notes}</p>
          </div>
        )}

        {/* Recommendations Section - only for logged in users */}
        {isLoggedIn && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold text-foreground mb-3">Get Recommendations</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select an account to get personalized artifact recommendations based on this build.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <select
                value={localSelectedAccountId ?? ''}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.nickname || `${account.uid} (${account.server})`}
                  </option>
                ))}
              </select>
              <Button onClick={handleGetRecommendations} disabled={!localSelectedAccountId}>
                <Sparkles className="h-4 w-4 mr-2" />
                Get Recommendations
              </Button>
            </div>

            {showRecommendations && (
              <RecommendationResult
                result={recommendations}
                isLoading={recommendationsLoading}
                error={recommendationsError}
              />
            )}
          </div>
        )}
      </main>

      {/* Edit Build Sheet - only for owner */}
      {isOwner && (
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Edit Build</SheetTitle>
              <SheetDescription>Update your artifact build configuration.</SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <BuildForm
                characters={characters}
                artifactSets={artifactSets}
                initialData={build}
                onSubmit={handleEdit}
                onCancel={() => setIsEditOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
