import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  HomeTabIcon,
  OrdersTabIcon,
  CalendarTabIcon,
  ReportsTabIcon,
  MoreTabIcon,
} from '../common/Icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setActiveTab } from '../../store/slices/dashboardSlice';
import { NavigationTab } from '../../types';
import { Colors, Typography, Spacing } from '../../constants';

export const BottomNavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.dashboard.activeTab);

  const tabs: { id: NavigationTab; label: string; renderIcon: (active: boolean) => React.ReactNode }[] = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      renderIcon: (active) => (
        <HomeTabIcon
          size={18}
          color={active ? Colors.primary : Colors.textMuted}
        />
      ),
    },
    {
      id: 'Orders',
      label: 'Orders',
      renderIcon: (active) => (
        <OrdersTabIcon
          size={18}
          color={active ? Colors.primary : Colors.textMuted}
        />
      ),
    },
    {
      id: 'Calendar',
      label: 'Calendar',
      renderIcon: (active) => (
        <CalendarTabIcon
          size={18}
          color={active ? Colors.primary : Colors.textMuted}
        />
      ),
    },
    {
      id: 'Reports',
      label: 'Reports',
      renderIcon: (active) => (
        <ReportsTabIcon
          size={18}
          color={active ? Colors.primary : Colors.textMuted}
        />
      ),
    },
    {
      id: 'More',
      label: 'More',
      renderIcon: (active) => (
        <MoreTabIcon
          size={18}
          color={active ? Colors.primary : Colors.textMuted}
        />
      ),
    },
  ];

  return (
    <View style={styles.navBarContainer}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                isActive && styles.activePillItem,
              ]}
              onPress={() => dispatch(setActiveTab(tab.id))}
              activeOpacity={0.8}
            >
              {tab.renderIcon(isActive)}
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBarContainer: {
    backgroundColor: Colors.navBg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingBottom: 16,
    paddingTop: 8,
    paddingHorizontal: Spacing.md,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Spacing.borderRadius.full,
  },
  activePillItem: {
    backgroundColor: Colors.navActiveBg,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 6,
  },
  activeTabLabel: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  inactiveTabLabel: {
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textMuted,
  },
});
