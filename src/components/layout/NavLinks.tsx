'use client';

import Link from 'next/link';

interface NavLinksProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function NavLinks({ isLoggedIn, onLogout }: NavLinksProps) {
  if (isLoggedIn) {
    return (
      <>
        <Link
          href="/app/achievements"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          My Achievements
        </Link>
        <button
          onClick={onLogout}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Logout
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
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white font-medium hover:bg-blue-700"
      >
        Register
      </Link>
    </>
  );
}
