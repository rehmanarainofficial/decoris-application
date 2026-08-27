import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NavigationTab, TimeFilter } from '../../types';

interface DashboardState {
  activeTab: NavigationTab;
  selectedFilter: TimeFilter;
  isFilterDropdownOpen: boolean;
}

const initialState: DashboardState = {
  activeTab: 'Dashboard',
  selectedFilter: 'This Month',
  isFilterDropdownOpen: false,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<NavigationTab>) => {
      state.activeTab = action.payload;
    },
    setSelectedFilter: (state, action: PayloadAction<TimeFilter>) => {
      state.selectedFilter = action.payload;
      state.isFilterDropdownOpen = false;
    },
    toggleFilterDropdown: (state) => {
      state.isFilterDropdownOpen = !state.isFilterDropdownOpen;
    },
    setFilterDropdownOpen: (state, action: PayloadAction<boolean>) => {
      state.isFilterDropdownOpen = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setSelectedFilter,
  toggleFilterDropdown,
  setFilterDropdownOpen,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
