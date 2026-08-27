import { UserProfile, QuickActionItem, TodayOverviewData, TimeFilter } from '../types';

export interface GetDashboardOverviewResponse {
  user: UserProfile;
  quickActions: QuickActionItem[];
  overview: TodayOverviewData;
}

export interface GetOverviewFilterRequest {
  filter: TimeFilter;
}
