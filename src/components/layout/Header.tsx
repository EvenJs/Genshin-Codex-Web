'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const SERVERS = [
  { value: 'cn_gf01', label: '天空岛' },
  { value: 'cn_qd01', label: '世界树' },
  { value: 'os_usa', label: 'America' },
  { value: 'os_euro', label: 'Europe' },
  { value: 'os_asia', label: 'Asia' },
  { value: 'os_cht', label: 'TW/HK/MO' },
];

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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uid, setUid] = useState('');
  const [server, setServer] = useState(SERVERS[0].value);
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSelectAccount = (accountId: string) => {
    selectAccount(accountId);
    setDropdownOpen(false);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) return;

    setSubmitting(true);
    try {
      await addAccount(uid.trim(), server, nickname.trim() || undefined);
      setUid('');
      setNickname('');
      setShowAddForm(false);
    } catch {
      // Error handling is in the context
    }
    setSubmitting(false);
  };

  const handleDeleteAccount = async (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    if (!confirm('确定删除此账号？')) return;

    setDeletingId(accountId);
    try {
      await deleteAccount(accountId);
    } catch {
      // Error handling is in the context
    }
    setDeletingId(null);
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
          {isLoggedIn ? (
            <>
              {/* Account dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  <span>{selectedAccount?.nickname || selectedAccount?.uid || '选择账号'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800 z-50">
                    {accountsLoading ? (
                      <div className="p-4 text-sm text-zinc-500">加载中...</div>
                    ) : (
                      <>
                        {/* Account list */}
                        <div className="max-h-48 overflow-y-auto">
                          {accounts.length === 0 ? (
                            <div className="p-4 text-sm text-zinc-500">暂无账号</div>
                          ) : (
                            accounts.map((account) => (
                              <div
                                key={account.id}
                                onClick={() => handleSelectAccount(account.id)}
                                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                                  selectedAccountId === account.id
                                    ? 'bg-blue-50 dark:bg-blue-950'
                                    : ''
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {account.nickname || account.uid}
                                  </div>
                                  <div className="text-xs text-zinc-500 truncate">
                                    {account.uid} · {account.server}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => handleDeleteAccount(e, account.id)}
                                  disabled={deletingId === account.id}
                                  className="ml-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                  {deletingId === account.id ? '...' : '删除'}
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Separator */}
                        <div className="border-t border-zinc-200 dark:border-zinc-700" />

                        {/* Add account */}
                        {showAddForm ? (
                          <form onSubmit={handleAddAccount} className="p-3 space-y-2">
                            <input
                              type="text"
                              value={uid}
                              onChange={(e) => setUid(e.target.value)}
                              placeholder="UID *"
                              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                            />
                            <select
                              value={server}
                              onChange={(e) => setServer(e.target.value)}
                              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                            >
                              {SERVERS.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={nickname}
                              onChange={(e) => setNickname(e.target.value)}
                              placeholder="昵称（可选）"
                              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={submitting || !uid.trim()}
                                className="flex-1 rounded bg-blue-600 px-2 py-1 text-sm text-white disabled:opacity-50"
                              >
                                {submitting ? '添加中...' : '添加'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400"
                              >
                                取消
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-zinc-100 dark:text-blue-400 dark:hover:bg-zinc-700"
                          >
                            + 添加账号
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/app/achievements"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                My Achievements
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white font-medium hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
