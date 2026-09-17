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
import { useGetEventQuotationHeadersQuery, EventQuotationHeaderItem } from '../../api/bookingApi';
import { TimeFilter } from '../../types';
import { Colors, Typography, Spacing } from '../../constants';

const FILTER_OPTIONS: TimeFilter[] = ['This Month', 'Today', 'This Week', 'This Year'];

interface TodayOverviewProps {
  onNavigate?: (screenTitle: string) => void;
}

export const TodayOverview: React.FC<TodayOverviewProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { selectedFilter, isFilterDropdownOpen } = useAppSelector(
    (state) => state.dashboard
  );

  const { data: headerResponse } = useGetEventQuotationHeadersQuery();
  const apiEvents: EventQuotationHeaderItem[] = headerResponse?.data || [];

  const handleSelectFilter = (filter: TimeFilter) => {
    dispatch(setSelectedFilter(filter));
  };

  // Compute live filtered stats based on selected time filter
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const currentMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const currentYear = `${now.getFullYear()}`;

  const filteredEvents = apiEvents.filter((item) => {
    const eventDate = (item.function_date || item.ord_date || '').trim();
    if (!eventDate) return true;

    if (selectedFilter === 'Today') {
      return eventDate === todayStr;
    } else if (selectedFilter === 'This Week') {
      const d = new Date(eventDate);
      if (isNaN(d.getTime())) return true;
      const diffDays = Math.abs((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7;
    } else if (selectedFilter === 'This Month') {
      return eventDate.startsWith(currentMonth);
    } else if (selectedFilter === 'This Year') {
      return eventDate.startsWith(currentYear);
    }
    return true;
  });

  const tentativeCount = filteredEvents.filter((e) => String(e.event_status) === '1').length;
  const confirmedCount = filteredEvents.filter((e) => String(e.event_status) === '2').length;
  const newOrdersCount = filteredEvents.length;
  const totalSales = filteredEvents.reduce(
    (sum, e) => sum + (parseFloat(e.total) || 0),
    0
  );
  const totalSalesFormatted = Math.round(totalSales).toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Overview</Text>
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
            value={tentativeCount}
            label="Tentative"
            onPress={() => onNavigate?.('Tentative')}
            renderIcon={() => (
              <TentativeOrdersIcon size={18} color={Colors.primary} />
            )}
          />

          <StatCard
            value={confirmedCount}
            label="Confirmed"
            onPress={() => onNavigate?.('Confirmed')}
            renderIcon={() => (
              <ConfirmedOrdersIcon size={18} color={Colors.primary} />
            )}
          />

          <StatCard
            value={newOrdersCount}
            label="Total Orders"
            onPress={() => onNavigate?.('Event Calendar')}
            renderIcon={() => (
              <TentativeOrdersIcon size={18} color={Colors.primary} />
            )}
          />

          <StatCard
            value={totalSalesFormatted}
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
