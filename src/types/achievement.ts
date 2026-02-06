export interface Achievement {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: {
    name: string;
    title: string;
  };
  region: string | null;
  rewardPrimogems: number;
  isHidden: boolean;
  hiddenDescription?: string | null;
  version?: string | null;
  guide: string | null;
}

export interface AchievementListResponse {
  items: Achievement[];
  total: number;
  page: number;
  pageSize: number;
}
