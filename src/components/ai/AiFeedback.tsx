'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface AiFeedbackProps {
  aiResultId?: string;
  className?: string;
}

export function AiFeedback({ aiResultId, className }: AiFeedbackProps) {
  const t = useTranslations('aiFeedback');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!aiResultId) return null;

  const handleSubmit = async () => {
    if (!rating) {
      setError(t('selectRating'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch('/ai/feedback', {
        method: 'POST',
        body: JSON.stringify({
          aiResultId,
          rating,
          helpful: rating >= 4 ? true : rating <= 2 ? false : undefined,
          comment: comment.trim() || undefined,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('rounded-md border border-border bg-muted/10 p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{t('title')}</p>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
        {submitted && (
          <span className="text-xs text-green-500">{t('thanks')}</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const active = rating !== null && value <= rating;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRating(value);
                setSubmitted(false);
              }}
              className={cn(
                'rounded p-1 transition-colors',
                active ? 'text-amber-400' : 'text-muted-foreground/60 hover:text-amber-400',
              )}
              aria-label={t('ratingLabel', { value })}
            >
              <Star className={cn('h-4 w-4', active && 'fill-amber-400')} />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t('commentPlaceholder')}
        className="mt-2 min-h-[64px] w-full resize-none rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-genshin-gold focus:outline-none"
      />

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      <div className="mt-2 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-genshin-gold/20 px-3 py-1 text-xs font-medium text-genshin-gold hover:bg-genshin-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </div>
  );
}
