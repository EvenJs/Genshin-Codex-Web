'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AddAccountForm } from './AddAccountForm';
import type { Account } from '@/types/account';

interface AccountDropdownProps {
  accounts: Account[];
  selectedAccountId: string | null;
  selectedAccount: Account | null;
  accountsLoading: boolean;
  onSelectAccount: (accountId: string) => void;
  onAddAccount: (uid: string, server: string, nickname?: string) => Promise<Account>;
  onDeleteAccount: (accountId: string) => Promise<void>;
}

export function AccountDropdown({
  accounts,
  selectedAccountId,
  selectedAccount,
  accountsLoading,
  onSelectAccount,
  onAddAccount,
  onDeleteAccount,
}: AccountDropdownProps) {
  const tAccount = useTranslations('account');
  const tServer = useTranslations('server');
  const tCommon = useTranslations('common');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowAddForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAccount = (accountId: string) => {
    onSelectAccount(accountId);
    setDropdownOpen(false);
  };

  const handleDeleteAccount = async (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    if (!confirm(tAccount('deleteConfirm'))) return;

    setDeletingId(accountId);
    try {
      await onDeleteAccount(accountId);
    } catch {
      // Error handling is in the context
    }
    setDeletingId(null);
  };

  const handleAddAccount = async (uid: string, server: string, nickname?: string) => {
    await onAddAccount(uid, server, nickname);
    setShowAddForm(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <span>{selectedAccount?.nickname || selectedAccount?.uid || tAccount('selectAccount')}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800 z-50">
          {accountsLoading ? (
            <div className="p-4 text-sm text-zinc-500">{tCommon('loading')}</div>
          ) : (
            <>
              {/* Account list */}
              <div className="max-h-48 overflow-y-auto">
                {accounts.length === 0 ? (
                  <div className="p-4 text-sm text-zinc-500">{tAccount('noAccounts')}</div>
                ) : (
                  accounts.map((account) => (
                    <div
                      key={account.id}
                      onClick={() => handleSelectAccount(account.id)}
                      className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                        selectedAccountId === account.id ? 'bg-blue-50 dark:bg-blue-950' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {account.nickname || account.uid}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {account.uid} · {tServer(account.server)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteAccount(e, account.id)}
                        disabled={deletingId === account.id}
                        className="ml-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === account.id ? '...' : tCommon('delete')}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-zinc-200 dark:border-zinc-700" />

              {/* Add account */}
              {showAddForm ? (
                <AddAccountForm onSubmit={handleAddAccount} onCancel={() => setShowAddForm(false)} />
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-zinc-100 dark:text-blue-400 dark:hover:bg-zinc-700"
                >
                  + {tAccount('addAccount')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
