import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Text,
} from 'react-native';
import { Header } from '../components/common';
import {
  WelcomeBanner,
  QuickActionsGrid,
  TodayOverview,
} from '../components/dashboard';
import { useGetDashboardDataQuery } from '../api/dashboardApi';
import { baseApi } from '../api/baseApi';
import { Colors, Typography, Spacing } from '../constants';
import { useAppDispatch } from '../hooks';
import { logout } from '../store/slices/userSlice';

interface DashboardScreenProps {
  onNavigate?: (screenName: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, isFetching, refetch, error } = useGetDashboardDataQuery();

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have 1 new order notification.');
  };

  const handleLogoutPress = () => {
    // Clear user Redux slice and purge RTK Query cache completely
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
  };

  const renderMainContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.errorText}>Unable to load dashboard details.</Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <WelcomeBanner
          userName={data?.user.name ?? 'Admin'}
          subtitle="Let's manage your orders and business today."
        />

        <QuickActionsGrid actions={data?.quickActions} onNavigate={onNavigate} />

        <TodayOverview />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Header
        onNotificationPress={handleNotificationPress}
        onLogoutPress={handleLogoutPress}
        unreadCount={data?.user.unreadNotifications ?? 1}
      />
      <View style={styles.flexContainer}>{renderMainContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.accentRed,
  },
});
