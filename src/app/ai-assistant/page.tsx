'use client';

import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from '@/hooks/useAuth';
import { AiChatbot } from '@/components/ai/AiChatbot';
import { LogIn } from 'lucide-react';

export default function AiAssistantPage() {
  const mounted = useMounted();
  const { isLoggedIn, isLoading } = useAuth();

  if (!mounted) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">AI Strategy Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Get quick, focused advice for builds, teams, rotations, and progression.
        </p>
      </div>

      {!isLoading && !isLoggedIn ? (
        <div className="rounded-xl border border-border bg-card px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Please sign in to chat with the AI assistant.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <LogIn className="h-4 w-4" />
            Go to Login
          </Link>
        </div>
      ) : (
        <AiChatbot />
      )}
    </div>
  );
}
