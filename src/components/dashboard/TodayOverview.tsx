import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { StatCard } from '../common/StatCard';
import {
  TentativeOrdersIcon,
  ConfirmedOrdersIcon,
  ChevronDownIcon,
  ReportsTabIcon,
} from '../common/Icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setSelectedFilter, toggleFilterDropdown } from '../../store/slices/dashboardSlice';
import { useGetOverviewByFilterQuery } from '../../api/dashboardApi';
import { TimeFilter } from '../../types';
import { Colors, Typography, Spacing } from '../../constants';

const FILTER_OPTIONS: TimeFilter[] = ['Today', 'This Week', 'This Month', 'This Year'];

export const TodayOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedFilter, isFilterDropdownOpen } = useAppSelector(
    (state) => state.dashboard
  );

  const { data: overviewData } = useGetOverviewByFilterQuery(selectedFilter);

  const handleSelectFilter = (filter: TimeFilter) => {
    dispatch(setSelectedFilter(filter));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => dispatch(toggleFilterDropdown())}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{selectedFilter}</Text>
            <ChevronDownIcon size={12} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            value={overviewData?.tentativeCount ?? 12}
            label="Tentative"
            renderIcon={() => (
              <TentativeOrdersIcon size={18} color={Colors.primary} />
            )}
          />

          <StatCard
            value={overviewData?.confirmedCount ?? 7}
            label="Confirmed"
            renderIcon={() => (
              <ConfirmedOrdersIcon size={18} color={Colors.primary} />
            )}
          />

          <StatCard
            value={overviewData?.newOrdersCount ?? 5}
            label="New Orders"
            renderIcon={() => (
              <TentativeOrdersIcon size={18} color={Colors.primary} />
            )}
          />

          <StatCard
            value={overviewData?.totalSalesFormatted ?? '285,000'}
            label="Total Sales"
            isLast={true}
            renderIcon={() => (
              <ReportsTabIcon size={18} color={Colors.primary} />
            )}
          />
        </View>
      </View>

      <Modal
        visible={isFilterDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          dispatch(toggleFilterDropdown());
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => dispatch(toggleFilterDropdown())}
        >
          <View style={styles.dropdownMenu}>
            {FILTER_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.dropdownOption,
                  selectedFilter === item && styles.selectedOption,
                ]}
                onPress={() => handleSelectFilter(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedFilter === item && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  dropdownText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginRight: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: 200,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.md,
    paddingVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dropdownOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  selectedOption: {
    backgroundColor: Colors.iconBgLight,
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  selectedOptionText: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
