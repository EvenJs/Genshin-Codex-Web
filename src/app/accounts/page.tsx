'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMounted } from '@/hooks/useMounted';
import { Button } from '@/components/ui/button';
import { LogIn, User } from 'lucide-react';

const SERVERS = [
  { value: 'cn_gf01', label: '天空岛 (cn_gf01)' },
  { value: 'cn_qd01', label: '世界树 (cn_qd01)' },
  { value: 'os_usa', label: 'America (os_usa)' },
  { value: 'os_euro', label: 'Europe (os_euro)' },
  { value: 'os_asia', label: 'Asia (os_asia)' },
  { value: 'os_cht', label: 'TW/HK/MO (os_cht)' },
];

export default function AccountsPage() {
  const mounted = useMounted();
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
      setFormError('UID 不能为空');
      return;
    }

    setSubmitting(true);

    try {
      await addAccount(uid.trim(), server, nickname.trim() || undefined);
      setUid('');
      setNickname('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '添加账号失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();

    if (!confirm('确定要删除此账号吗？删除后无法恢复。')) {
      return;
    }

    setDeletingId(accountId);
    setError(null);

    try {
      await deleteAccount(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除账号失败');
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">账号管理</h1>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <div className="py-12 text-center">
            <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              管理您的游戏账号
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              登录后可以添加和管理您的原神游戏账号，追踪不同账号的成就、角色和圣遗物。
            </p>
            <Link href="/login">
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                登录以开始
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">账号管理</h1>
          <Link
            href="/achievements"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700"
          >
            去我的成就
          </Link>
        </div>

        {/* Add account form */}
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">新增账号</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  UID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="输入游戏 UID"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  服务器
                </label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                >
                  {SERVERS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  昵称（可选）
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="备注名称"
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
              {submitting ? '添加中...' : '添加账号'}
            </button>
          </form>
        </div>

        {/* Account list */}
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">我的账号</h2>

        {accountsLoading && (
          <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">加载中...</div>
        )}

        {error && <div className="py-4 text-center text-red-500">{error}</div>}

        {!accountsLoading && (
          <>
            {accounts.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                暂无账号，请先添加游戏账号
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
                        {account.nickname || '未设置昵称'}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        UID: {account.uid} · {account.server}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAccountId === account.id && (
                        <span className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
                          当前选中
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, account.id)}
                        disabled={deletingId === account.id}
                        className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        {deletingId === account.id ? '删除中...' : '删除'}
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
