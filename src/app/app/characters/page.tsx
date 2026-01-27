'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authToken';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountCharacters } from '@/hooks/useCharacters';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import { CharacterCard } from '@/components/characters/CharacterCard';
import { Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '@/types/account';
import type { AccountCharacter, Element } from '@/types/character';
import { ELEMENT_NAMES } from '@/types/character';

const SELECTED_ACCOUNT_KEY = 'selected_account_id';

const ELEMENTS: Element[] = ['PYRO', 'HYDRO', 'ANEMO', 'ELECTRO', 'DENDRO', 'CRYO', 'GEO'];

export default function CharactersPage() {
  const router = useRouter();
  const mounted = useMounted();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | ''>('');

  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { characters, isLoading: charactersLoading, error } = useAccountCharacters(selectedAccountId);

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
  };

  const handleCharacterClick = (character: AccountCharacter) => {
    router.push(`/app/characters/${character.id}`);
  };

  // Filter characters
  const filteredCharacters = characters.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.character.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesElement = !selectedElement || c.character.element === selectedElement;
    return matchesSearch && matchesElement;
  });

  // Group by rarity
  const fiveStars = filteredCharacters.filter((c) => c.character.rarity === 5);
  const fourStars = filteredCharacters.filter((c) => c.character.rarity === 4);

  const isLoading = accountsLoading || charactersLoading;

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Characters</h1>
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
        <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3">
          <StatCard
            value={characters.length}
            label="Total Characters"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard value={fiveStars.length} label="5-Star" variant="gold" />
          <StatCard
            value={fourStars.length}
            label="4-Star"
            variant="purple"
            className="hidden sm:block"
          />
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Element filter */}
        <div className="mb-4 sm:mb-6 flex gap-1 overflow-x-auto pb-1">
          <Button
            variant={selectedElement === '' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setSelectedElement('')}
          >
            All
          </Button>
          {ELEMENTS.map((element) => (
            <Button
              key={element}
              variant={selectedElement === element ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedElement(element)}
            >
              {ELEMENT_NAMES[element]}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {/* Error */}
        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {/* Character list */}
        {!isLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredCharacters.length} characters
            </div>

            {filteredCharacters.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No characters found
              </div>
            ) : (
              <div className="space-y-6">
                {/* 5-Star Characters */}
                {fiveStars.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-amber-500">★★★★★</span> 5-Star ({fiveStars.length})
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {fiveStars.map((char) => (
                        <CharacterCard
                          key={char.id}
                          character={char}
                          onClick={handleCharacterClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4-Star Characters */}
                {fourStars.length > 0 && (
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span className="text-purple-500">★★★★</span> 4-Star ({fourStars.length})
                    </h2>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {fourStars.map((char) => (
                        <CharacterCard
                          key={char.id}
                          character={char}
                          onClick={handleCharacterClick}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  variant?: 'default' | 'gold' | 'purple';
  icon?: React.ReactNode;
  className?: string;
}

function StatCard({ value, label, variant = 'default', icon, className }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-3 sm:p-4', className)}>
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold flex items-center gap-1',
          variant === 'gold' && 'text-amber-500',
          variant === 'purple' && 'text-purple-500',
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
