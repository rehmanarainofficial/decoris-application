import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, StatusBar } from 'react-native';
import { BellIcon, CrownIcon, FlourishLoopIcon, LogOutIcon } from './Icons';
import { Colors, Typography, Spacing } from '../../constants';

interface HeaderProps {
  onNotificationPress?: () => void;
  onLogoutPress?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  onLogoutPress,
  unreadCount = 1,
}) => {
  const handleLogout = () => {
    if (onLogoutPress) {
      onLogoutPress();
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerRow}>
        <View style={styles.logoContainer}>
          <View style={styles.crownWrapper}>
            <CrownIcon size={18} color={Colors.accentGold} />
          </View>
          <Text style={styles.logoText}>Decoris</Text>
          <View style={styles.flourishWrapper}>
            <FlourishLoopIcon width={68} height={12} color={Colors.accentGold} />
          </View>
        </View>

        <View style={styles.rightActionsRow}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BellIcon size={24} color={Colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <View style={styles.badgeInnerDot} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={handleLogout}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <LogOutIcon size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 6 : 2,
    paddingBottom: Spacing.xs,
  },
  headerRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  crownWrapper: {
    marginBottom: -4,
    marginLeft: 2,
  },
  logoText: {
    fontSize: Typography.fontSize.xxl + 2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.5,
  },
  flourishWrapper: {
    marginTop: -3,
    marginLeft: -2,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.accentRed,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeInnerDot: {
    width: '100%',
    height: '100%',
    borderRadius: 4.5,
    backgroundColor: Colors.accentRed,
  },
});
