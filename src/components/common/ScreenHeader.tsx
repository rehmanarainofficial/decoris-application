import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ArrowLeftIcon, HomeIcon, CrownIcon, FlourishLoopIcon } from './Icons';
import { Colors, Typography, Spacing } from '../../constants';

interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  onHomePress?: () => void;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBackPress,
  onHomePress,
  rightElement,
}) => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerRow}>
        {/* Left Side: Back Arrow Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftIcon size={22} color={Colors.primary} />
        </TouchableOpacity>

        {/* Center: Title with Gold Crown Emblem Above & Flourish Below */}
        <View style={styles.centerContainer}>
          <View style={styles.crownWrapper}>
            <CrownIcon size={14} color={Colors.accentGold} />
          </View>
          <Text style={styles.titleText}>{title}</Text>
          <View style={styles.flourishWrapper}>
            <FlourishLoopIcon width={64} height={10} color={Colors.accentGold} />
          </View>
        </View>

        {/* Right Side: Home Button or Custom Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onHomePress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {rightElement ? (
            rightElement
          ) : (
            <HomeIcon size={22} color={Colors.primary} />
          )}
        </TouchableOpacity>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownWrapper: {
    marginBottom: -2,
  },
  titleText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.3,
  },
  flourishWrapper: {
    marginTop: -2,
  },
});
