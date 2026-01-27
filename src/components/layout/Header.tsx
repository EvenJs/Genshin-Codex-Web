'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AccountDropdown } from './AccountDropdown';
import { NavLinks } from './NavLinks';

export function Header() {
  const {
    isLoggedIn,
    isLoading,
    accounts,
    selectedAccountId,
    selectedAccount,
    accountsLoading,
    logout,
    addAccount,
    deleteAccount,
    selectAccount,
  } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Don't render until auth state is loaded
  if (isLoading) {
    return (
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Genshin Codex
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Genshin Codex
        </Link>

        <nav className="flex items-center gap-4">
          {isLoggedIn && (
            <AccountDropdown
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              selectedAccount={selectedAccount}
              accountsLoading={accountsLoading}
              onSelectAccount={selectAccount}
              onAddAccount={addAccount}
              onDeleteAccount={deleteAccount}
            />
          )}
          <NavLinks isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        </nav>
      </div>
    </header>
  );
}
