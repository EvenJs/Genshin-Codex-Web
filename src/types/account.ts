export interface Account {
  id: string;
  uid: string;
  server: string;
  nickname: string | null;
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  category: string;
  region: string | null;
  rewardPrimogems: number;
  isHidden: boolean;
  completed: boolean;
}

export interface UserAchievementsResponse {
  items: UserAchievement[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    completed: number;
    total: number;
    incomplete: number;
    primogemsEarned: number;
    primogemsTotal: number;
  };
}
