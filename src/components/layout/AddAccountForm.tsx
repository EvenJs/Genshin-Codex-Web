'use client';

import { useState } from 'react';

const SERVERS = [
  { value: 'cn_gf01', label: '天空岛' },
  { value: 'cn_qd01', label: '世界树' },
  { value: 'os_usa', label: 'America' },
  { value: 'os_euro', label: 'Europe' },
  { value: 'os_asia', label: 'Asia' },
  { value: 'os_cht', label: 'TW/HK/MO' },
];

interface AddAccountFormProps {
  onSubmit: (uid: string, server: string, nickname?: string) => Promise<void>;
  onCancel: () => void;
}

export function AddAccountForm({ onSubmit, onCancel }: AddAccountFormProps) {
  const [uid, setUid] = useState('');
  const [server, setServer] = useState(SERVERS[0].value);
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(uid.trim(), server, nickname.trim() || undefined);
      setUid('');
      setNickname('');
    } catch {
      // Error handling is in the context
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-2">
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
          onClick={onCancel}
          className="px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400"
        >
          取消
        </button>
      </div>
    </form>
  );
}
