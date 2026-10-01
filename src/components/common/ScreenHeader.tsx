import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { ArrowLeftIcon, HomeIcon } from './Icons';
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

        {/* Center: Clean Modern Title */}
        <View style={styles.centerContainer}>
          <Text style={styles.titleText}>{title}</Text>
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
    borderBottomColor: 'rgba(0,0,0,0.04)',
    paddingTop: Platform.OS === 'ios' ? 14 : 8,
    paddingBottom: 10,
  },
  headerRow: {
    minHeight: 48,
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
  titleText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.3,
  },
});
