'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const SERVERS = [
  { value: 'cn_gf01', labelKey: 'cn_gf01' },
  { value: 'cn_qd01', labelKey: 'cn_qd01' },
  { value: 'os_usa', labelKey: 'os_usa' },
  { value: 'os_euro', labelKey: 'os_euro' },
  { value: 'os_asia', labelKey: 'os_asia' },
  { value: 'os_cht', labelKey: 'os_cht' },
];

interface AddAccountFormProps {
  onSubmit: (uid: string, server: string, nickname?: string) => Promise<void>;
  onCancel: () => void;
}

export function AddAccountForm({ onSubmit, onCancel }: AddAccountFormProps) {
  const tAccount = useTranslations('account');
  const tAccountsPage = useTranslations('accountsPage');
  const tServer = useTranslations('server');
  const tCommon = useTranslations('common');
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
        placeholder={tAccountsPage('uidPlaceholderShort')}
        className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
      />
      <select
        value={server}
        onChange={(e) => setServer(e.target.value)}
        className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
      >
        {SERVERS.map((s) => (
          <option key={s.value} value={s.value}>
            {tServer(s.labelKey)}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder={tAccount('nickname')}
        className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !uid.trim()}
          className="flex-1 rounded bg-blue-600 px-2 py-1 text-sm text-white disabled:opacity-50"
        >
          {submitting ? tAccount('adding') : tCommon('add')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-sm text-zinc-600 dark:text-zinc-400"
        >
          {tCommon('cancel')}
        </button>
      </div>
    </form>
  );
}
