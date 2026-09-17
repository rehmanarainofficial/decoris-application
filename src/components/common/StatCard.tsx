import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants';

interface StatCardProps {
  renderIcon: () => React.ReactNode;
  value: string | number;
  label: string;
  isLast?: boolean;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  renderIcon,
  value,
  label,
  isLast = false,
  onPress,
}) => {
  const content = (
    <>
      <View style={styles.topRow}>
        <View style={styles.iconWrapper}>{renderIcon()}</View>
        <Text
          style={styles.valueText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
      </View>
      <Text style={styles.labelText} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, !isLast && styles.withBorder]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, !isLast && styles.withBorder]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xs,
  },
  withBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapper: {
    marginRight: 6,
  },
  valueText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  labelText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
});
