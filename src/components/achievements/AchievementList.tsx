import Link from 'next/link';
import type { Achievement } from '@/types/achievement';
import { Star } from 'lucide-react';

export interface AchievementListProps {
  items: Achievement[];
}

export function AchievementList({ items }: AchievementListProps) {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No achievements found.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/achievements/${item.id}`}
            className="block p-3 sm:p-4 border border-border rounded-lg bg-card hover:border-primary/50 hover:bg-accent/5 transition-colors"
          >
            <div className="flex justify-between items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                    {item.category}
                  </span>
                  {item.region && (
                    <span className="px-2 py-0.5 bg-accent/20 text-accent-foreground rounded">
                      {item.region}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-genshin-gold font-semibold shrink-0">
                <span className="text-sm sm:text-base">{item.rewardPrimogems}</span>
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
