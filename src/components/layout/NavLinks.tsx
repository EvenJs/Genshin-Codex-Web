'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface NavLinksProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function NavLinks({ isLoggedIn, onLogout }: NavLinksProps) {
  const t = useTranslations('nav');

  if (isLoggedIn) {
    return (
      <>
        <Link
          href="/app/achievements"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {t('achievements')}
        </Link>
        <Link
          href="/app/artifacts"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {t('artifacts')}
        </Link>
        <Link
          href="/app/characters"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {t('characters')}
        </Link>
        <button
          onClick={onLogout}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {t('logout')}
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {t('login')}
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white font-medium hover:bg-blue-700"
      >
        {t('register')}
      </Link>
    </>
  );
}
