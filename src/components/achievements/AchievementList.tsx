import Link from 'next/link';
import type { Achievement } from '@/types/achievement';

export interface AchievementListProps {
  items: Achievement[];
}

export function AchievementList({ items }: AchievementListProps) {
  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-8">No achievements found.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/achievements/${item.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">{item.category}</span>
                  {item.region && (
                    <span className="px-2 py-1 bg-gray-100 rounded">{item.region}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-medium shrink-0">
                <span>{item.rewardPrimogems}</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                </svg>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
