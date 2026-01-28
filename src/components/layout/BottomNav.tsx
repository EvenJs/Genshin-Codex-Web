'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, User, Home, LogIn, Gem, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] transition-colors',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { isLoggedIn, isLoading } = useAuth();
  const t = useTranslations('nav');

  // Don't show bottom nav on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isAchievementsActive =
    pathname === '/achievements' || pathname.startsWith('/achievements/');
  const isMyAchievementsActive = pathname === '/app/achievements';
  const isArtifactsActive = pathname === '/app/artifacts';
  const isCharactersActive = pathname.startsWith('/app/characters');
  const isAccountsActive = pathname === '/app/accounts';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around px-2 safe-area-pb">
        <NavItem
          href="/achievements"
          icon={<Home className="h-5 w-5" />}
          label={t('browse')}
          isActive={isAchievementsActive && !isMyAchievementsActive}
        />

        {!isLoading && isLoggedIn ? (
          <>
            <NavItem
              href="/app/achievements"
              icon={<Trophy className="h-5 w-5" />}
              label={t('progress')}
              isActive={isMyAchievementsActive}
            />
            <NavItem
              href="/app/artifacts"
              icon={<Gem className="h-5 w-5" />}
              label={t('artifacts')}
              isActive={isArtifactsActive}
            />
            <NavItem
              href="/app/characters"
              icon={<Users className="h-5 w-5" />}
              label={t('characters')}
              isActive={isCharactersActive}
            />
          </>
        ) : !isLoading ? (
          <NavItem
            href="/login"
            icon={<LogIn className="h-5 w-5" />}
            label={t('login')}
            isActive={false}
          />
        ) : null}
      </div>
    </nav>
  );
}
