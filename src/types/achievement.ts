export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  region: string | null;
  rewardPrimogems: number;
  isHidden: boolean;
  guide: string | null;
}

export interface AchievementListResponse {
  items: Achievement[];
  total: number;
  page: number;
  pageSize: number;
}
