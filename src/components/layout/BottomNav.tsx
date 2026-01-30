'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, User, Home, Gem, Users } from 'lucide-react';
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
  const isArtifactsActive = pathname === '/artifacts' || pathname.startsWith('/artifacts/');
  const isCharactersActive = pathname === '/characters' || pathname.startsWith('/characters/');
  const isBuildsActive = pathname === '/builds' || pathname.startsWith('/builds/');
  const isAccountsActive = pathname === '/accounts' || pathname.startsWith('/accounts/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around px-2 safe-area-pb">
        <NavItem
          href="/achievements"
          icon={<Trophy className="h-5 w-5" />}
          label={t('achievements')}
          isActive={isAchievementsActive}
        />
        <NavItem
          href="/characters"
          icon={<Users className="h-5 w-5" />}
          label={t('characters')}
          isActive={isCharactersActive}
        />
        <NavItem
          href="/artifacts"
          icon={<Gem className="h-5 w-5" />}
          label={t('artifacts')}
          isActive={isArtifactsActive}
        />

        <NavItem
          href="/builds"
          icon={<Home className="h-5 w-5" />}
          label={t('builds')}
          isActive={isBuildsActive}
        />
        {!isLoading && (
          <NavItem
            href="/accounts"
            icon={<User className="h-5 w-5" />}
            label={t('accounts')}
            isActive={isAccountsActive}
          />
        )}
      </div>
    </nav>
  );
}
