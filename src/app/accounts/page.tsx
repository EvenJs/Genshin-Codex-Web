'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import { LogIn, User } from 'lucide-react';

const SERVERS = [
  { value: 'cn_gf01', labelKey: 'cn_gf01' },
  { value: 'cn_qd01', labelKey: 'cn_qd01' },
  { value: 'os_usa', labelKey: 'os_usa' },
  { value: 'os_euro', labelKey: 'os_euro' },
  { value: 'os_asia', labelKey: 'os_asia' },
  { value: 'os_cht', labelKey: 'os_cht' },
];

export default function AccountsPage() {
  const mounted = useMounted();
  const tAccount = useTranslations('account');
  const tAccountsPage = useTranslations('accountsPage');
  const tServer = useTranslations('server');
  const tCommon = useTranslations('common');
  const {
    isLoggedIn,
    isLoading,
    accounts,
    selectedAccountId,
    accountsLoading,
    addAccount,
    deleteAccount,
    selectAccount,
  } = useAuth();

  // Form state
  const [uid, setUid] = useState('');
  const [server, setServer] = useState(SERVERS[0].value);
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (accountId: string) => {
    selectAccount(accountId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!uid.trim()) {
      setFormError(tAccountsPage('uidRequired'));
      return;
    }

    setSubmitting(true);

    try {
      await addAccount(uid.trim(), server, nickname.trim() || undefined);
      setUid('');
      setNickname('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : tAccountsPage('addFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();

    if (!confirm(tAccount('deleteConfirm'))) {
      return;
    }

    setDeletingId(accountId);
    setError(null);

    try {
      await deleteAccount(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : tAccountsPage('deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted || isLoading) {
    return null;
  }

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{tAccountsPage('title')}</h1>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <div className="py-12 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {tAccountsPage('loginPromptTitle')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {tAccountsPage('loginPromptBody')}
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                {tAccountsPage('loginCta')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {tAccountsPage('title')}
          </h1>
          <Link
            href="/achievements"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700"
          >
            {tAccount('goToAchievements')}
          </Link>
        </div>

        {/* Add account form */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            {tAccount('addNewAccount')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  {tAccount('uid')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder={tAccountsPage('uidPlaceholder')}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  {tAccount('server')}
                </label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                >
                  {SERVERS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {tServer(s.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  {tAccount('nickname')}
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={tAccountsPage('nicknamePlaceholder')}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
            </div>

            {formError && <div className="text-red-500 text-sm">{formError}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? tAccount('adding') : tAccount('addAccount')}
            </button>
          </form>
        </div>

        {/* Account list */}
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          {tAccountsPage('myAccounts')}
        </h2>

        {accountsLoading && (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
            {tCommon('loading')}
          </div>
        )}

        {error && <div className="py-4 text-center text-red-500">{error}</div>}

        {!accountsLoading && (
          <>
            {accounts.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                {tAccount('noAccounts')}，{tAccount('noAccountsHint')}
              </div>
            ) : (
              <ul className="space-y-3">
                {accounts.map((account) => (
                  <li
                    key={account.id}
                    onClick={() => handleSelect(account.id)}
                    className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedAccountId === account.id
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {account.nickname || tAccountsPage('nicknameFallback')}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {tAccount('uid')}: {account.uid} · {tServer(account.server)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAccountId === account.id && (
                        <span className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
                          {tAccount('currentlySelected')}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, account.id)}
                        disabled={deletingId === account.id}
                        className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        {deletingId === account.id ? tAccount('deleting') : tCommon('delete')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
