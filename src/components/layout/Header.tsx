'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AccountDropdown } from './AccountDropdown';
import { NavLinks } from './NavLinks';
import { ThemeToggle } from './ThemeToggle';

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
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80">
            Genshin Codex
          </Link>
          <ThemeToggle />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80">
          Genshin Codex
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
