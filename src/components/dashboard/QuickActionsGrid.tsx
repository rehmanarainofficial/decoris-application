import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ActionCard } from '../common/ActionCard';
import {
  TentativeOrdersIcon,
  ConfirmedOrdersIcon,
  PlusBookingIcon,
  CalendarIcon,
  WalletIcon,
  ShortingIcon,
  CalculatorIcon,
  PieChartIcon,
} from '../common/Icons';
import { QuickActionItem } from '../../types';
import { Colors, Spacing } from '../../constants';

interface QuickActionsGridProps {
  actions?: QuickActionItem[];
  onNavigate?: (screenName: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  onNavigate,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clipboard-list':
        return <TentativeOrdersIcon color={Colors.primary} />;
      case 'clipboard-check':
        return <ConfirmedOrdersIcon color={Colors.primary} />;
      case 'plus':
        return <PlusBookingIcon color={Colors.primary} />;
      case 'calendar':
        return <CalendarIcon color={Colors.primary} />;
      case 'wallet':
        return <WalletIcon color={Colors.primary} />;
      case 'arrow-down-up':
        return <ShortingIcon color={Colors.primary} />;
      case 'calculator':
        return <CalculatorIcon color={Colors.primary} />;
      case 'pie-chart':
        return <PieChartIcon color={Colors.primary} />;
      default:
        return <TentativeOrdersIcon color={Colors.primary} />;
    }
  };

  const handleCardPress = (title: string) => {
    if (onNavigate) {
      onNavigate(title);
    } else {
      Alert.alert('Module Selected', `Opening ${title} module.`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridRow}>
        {actions?.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <ActionCard
              title={item.title}
              subtitle={item.subtitle}
              renderIcon={() => getIcon(item.iconName)}
              onPress={() => handleCardPress(item.title)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
  },
});
