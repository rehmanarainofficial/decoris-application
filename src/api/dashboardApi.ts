import { baseApi } from './baseApi';
import { GetDashboardOverviewResponse } from './types';
import { TimeFilter } from '../types';

const MOCK_DASHBOARD_DATA: GetDashboardOverviewResponse = {
  user: {
    id: 'usr_101',
    name: 'Ahsan',
    role: 'Event Manager',
    unreadNotifications: 1,
  },
  quickActions: [
    {
      id: 'action_1',
      title: 'Tentative',
      subtitle: 'View tentative orders and details',
      iconName: 'clipboard-list',
    },
    {
      id: 'action_2',
      title: 'Confirmed',
      subtitle: 'View confirmed orders',
      iconName: 'clipboard-check',
    },
    {
      id: 'action_3',
      title: 'New Booking',
      subtitle: 'Create a new customer order',
      iconName: 'plus',
    },
    {
      id: 'action_4',
      title: 'Event Calendar',
      subtitle: 'Check orders and schedule',
      iconName: 'calendar',
    },
    {
      id: 'action_5',
      title: 'Sales & Payments',
      subtitle: 'Manage sales and payments',
      iconName: 'wallet',
    },
    {
      id: 'action_6',
      title: 'Inventory Movement',
      subtitle: 'Manage items movement',
      iconName: 'arrow-down-up',
    },
    {
      id: 'action_7',
      title: 'Event Costing',
      subtitle: 'Manage costing details',
      iconName: 'calculator',
    },
    {
      id: 'action_8',
      title: 'Daily Expenses',
      subtitle: 'Manage daily expenses',
      iconName: 'pie-chart',
    },
  ],
  overview: {
    tentativeCount: 12,
    confirmedCount: 7,
    newOrdersCount: 5,
    totalSalesFormatted: '285,000',
    currency: '',
    selectedFilter: 'This Month',
  },
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<GetDashboardOverviewResponse, void>({
      async queryFn() {
        try {
          return { data: MOCK_DASHBOARD_DATA };
        } catch {
          return {
            error: {
              status: 500,
              data: 'Failed to load dashboard overview data',
            },
          };
        }
      },
      providesTags: ['Dashboard'],
    }),

    getOverviewByFilter: builder.query<GetDashboardOverviewResponse['overview'], TimeFilter>({
      async queryFn(filter) {
        let multiplier = 1;
        if (filter === 'Today') multiplier = 0.2;
        if (filter === 'This Week') multiplier = 0.5;
        if (filter === 'This Year') multiplier = 12;

        return {
          data: {
            tentativeCount: Math.round(12 * multiplier),
            confirmedCount: Math.round(7 * multiplier),
            newOrdersCount: Math.round(5 * multiplier),
            totalSalesFormatted: `${(285000 * multiplier).toLocaleString()}`,
            currency: 'PKR',
            selectedFilter: filter,
          },
        };
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardDataQuery, useGetOverviewByFilterQuery } = dashboardApi;
