export interface AchievementCategory {
  id: string;
  name: string;
  title: string;
  link: string | null;
  icon: string | null;
  background: string | null;
  achievementCount: number;
  completedCount?: number;
}

export interface AchievementCategoryListResponse {
  items: AchievementCategory[];
  total: number;
  page: number;
  pageSize: number;
}
