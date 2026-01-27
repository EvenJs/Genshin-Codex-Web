'use client';

import { useState, useEffect } from 'react';
import { getToken } from '@/lib/authToken';
import { useAccounts } from '@/hooks/useAccounts';
import { useUserAchievements } from '@/hooks/useAchievements';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '@/types/account';

const SELECTED_ACCOUNT_KEY = 'selected_account_id';

type StatusFilter = 'all' | 'incomplete' | 'completed';

export default function MyAchievementsPage() {
  const mounted = useMounted();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const pageSize = 20;

  const { accounts, isLoading: accountsLoading } = useAccounts();
  const {
    items: achievements,
    total,
    stats,
    isLoading: achievementsLoading,
    error,
    toggleCompletion,
  } = useUserAchievements(selectedAccountId, {
    page,
    pageSize,
    q: debouncedQ || undefined,
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
    localStorage.setItem(SELECTED_ACCOUNT_KEY, accountId);
    setPage(1);
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleToggleCompleted = async (achievementId: string, completed: boolean) => {
    await toggleCompletion(achievementId, completed);
  };

  const filteredAchievements =
    status === 'all'
      ? achievements
      : achievements.filter((a) => (status === 'completed' ? a.completed : !a.completed));

  const totalPages = Math.ceil(total / pageSize);
  const isLoading = accountsLoading || achievementsLoading;

  const getAccountDisplay = (account: Account) => {
    return account.nickname || `${account.uid} (${account.server})`;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Achievements</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
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
        {stats && (
          <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-5">
            <StatCard
              value={stats.completedCount}
              label="Completed"
              variant="success"
            />
            <StatCard
              value={stats.incompleteCount}
              label="Incomplete"
              variant="default"
            />
            <StatCard
              value={stats.totalCount}
              label="Total"
              variant="default"
              className="hidden sm:block"
            />
            <StatCard
              value={stats.primogemsEarned}
              label="Earned"
              variant="gold"
              icon={<Star className="h-4 w-4 fill-current" />}
            />
            <StatCard
              value={stats.primogemsTotal}
              label="Total"
              variant="gold"
              icon={<Star className="h-4 w-4 fill-current opacity-50" />}
              className="hidden sm:block"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-1 sm:gap-2">
          {(['all', 'incomplete', 'completed'] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              variant={status === s ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleStatusChange(s)}
              className={cn(
                'flex-1 sm:flex-none',
                status === s && 'bg-primary text-primary-foreground'
              )}
            >
              {s === 'all' ? 'All' : s === 'incomplete' ? 'Incomplete' : 'Completed'}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* List */}
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        )}

        {error && <div className="py-12 text-center text-destructive">{error.message}</div>}

        {!isLoading && !error && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">{total} achievements</div>

            {filteredAchievements.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No achievements found</div>
            ) : (
              <ul className="space-y-2 sm:space-y-3">
                {filteredAchievements.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 sm:gap-4 rounded-lg border border-border bg-card p-3 sm:p-4 transition-colors',
                      item.completed && 'bg-accent/5'
                    )}
                  >
                    <button
                      onClick={() => handleToggleCompleted(item.id, !item.completed)}
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                        item.completed
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 hover:border-primary'
                      )}
                    >
                      {item.completed && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            'font-medium text-sm sm:text-base',
                            item.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          )}
                        >
                          {item.name}
                        </h3>
                        {item.completed && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary font-medium">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-genshin-gold font-semibold shrink-0">
                      <span className="text-sm">{item.rewardPrimogems}</span>
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </li>
                ))}
              </ul>
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
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  variant?: 'default' | 'success' | 'gold';
  icon?: React.ReactNode;
  className?: string;
}

function StatCard({ value, label, variant = 'default', icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-3 sm:p-4',
        className
      )}
    >
      <div
        className={cn(
          'text-xl sm:text-2xl font-bold flex items-center gap-1',
          variant === 'gold' && 'text-genshin-gold',
          variant === 'success' && 'text-accent',
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
