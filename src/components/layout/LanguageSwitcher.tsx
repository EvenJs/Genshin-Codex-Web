'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: Locale) => {
    startTransition(() => {
      // Set cookie and reload page
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
      window.location.reload();
    });
  };

  // Get the next locale to switch to
  const nextLocale = locale === 'zh' ? 'en' : 'zh';

  return (
    <button
      onClick={() => handleChange(nextLocale)}
      disabled={isPending}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
      title={`Switch to ${localeNames[nextLocale]}`}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{localeNames[locale]}</span>
    </button>
  );
}
