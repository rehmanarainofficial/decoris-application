export type NavigationTab = 'Dashboard' | 'Orders' | 'Calendar' | 'Reports' | 'More';

export type TimeFilter = 'This Month' | 'Today' | 'This Week' | 'This Year';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  unreadNotifications: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'clipboard-list' | 'clipboard-check' | 'plus' | 'calendar' | 'wallet' | 'arrow-down-up' | 'calculator' | 'pie-chart';
  targetScreen?: string;
}

export interface TodayOverviewData {
  tentativeCount: number;
  confirmedCount: number;
  newOrdersCount: number;
  totalSalesFormatted: string;
  currency: string;
  selectedFilter: TimeFilter;
}
