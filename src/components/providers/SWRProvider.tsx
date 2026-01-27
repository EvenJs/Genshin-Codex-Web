'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr';
import type { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
