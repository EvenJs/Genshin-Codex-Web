'use client';

import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from '@/hooks/useAuth';
import { AiChatbot } from '@/components/ai/AiChatbot';
import { LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AiAssistantPage() {
  const t = useTranslations('aiAssistant');
  const mounted = useMounted();
  const { isLoggedIn, isLoading } = useAuth();

  if (!mounted) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {!isLoading && !isLoggedIn && (
        <div className="mb-6 rounded-xl border border-border bg-card px-6 py-5 text-center">
          <p className="text-sm text-muted-foreground">
            {t('loginPrompt')}
          </p>
          <Link
            href="/login"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <LogIn className="h-4 w-4" />
            {t('loginAction')}
          </Link>
        </div>
      )}

      <AiChatbot />
    </div>
  );
}
