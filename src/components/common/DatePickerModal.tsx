import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeftIcon, ChevronRightIcon, ChevronDownIcon } from './Icons';
import { Colors, Typography, Spacing } from '../../constants';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  selectedDate?: string; // Format: YYYY-MM-DD
  title?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Generates years from currentYear + 5 down to currentYear - 30
const CURRENT_SYSTEM_YEAR = new Date().getFullYear();
const YEAR_LIST: number[] = [];
for (let y = CURRENT_SYSTEM_YEAR + 5; y >= CURRENT_SYSTEM_YEAR - 30; y--) {
  YEAR_LIST.push(y);
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  title = 'Select Date',
}) => {
  const parsedDate = useMemo(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return { year: y, month: m, day: d };
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    };
  }, [selectedDate]);

  const [currentYear, setCurrentYear] = useState(parsedDate.year);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(parsedDate.month);
  const [selectedDay, setSelectedDay] = useState(parsedDate.day);
  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  useEffect(() => {
    setCurrentYear(parsedDate.year);
    setCurrentMonthIndex(parsedDate.month);
    setSelectedDay(parsedDate.day);
    setViewMode('calendar');
  }, [parsedDate, visible]);

  const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleDaySelect = (dayNum: number) => {
    setSelectedDay(dayNum);
    const monthFormatted =
      currentMonthIndex + 1 < 10
        ? `0${currentMonthIndex + 1}`
        : `${currentMonthIndex + 1}`;
    const dayFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const formatted = `${currentYear}-${monthFormatted}-${dayFormatted}`;
    onSelectDate(formatted);
    onClose();
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setViewMode('calendar');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonthIndex(monthIndex);
    setViewMode('calendar');
  };

  // Render Days Grid
  const renderCalendarCells = () => {
    const cells: React.ReactNode[] = [];

    // Empty offset slots
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<View key={`empty_${i}`} style={styles.calendarCell} />);
    }

    // Days slots
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const isSelected =
        day === selectedDay &&
        currentMonthIndex === parsedDate.month &&
        currentYear === parsedDate.year;

      cells.push(
        <TouchableOpacity
          key={`day_${day}`}
          style={[styles.calendarCell, isSelected && styles.selectedCell]}
          activeOpacity={0.7}
          onPress={() => handleDaySelect(day)}
        >
          <Text
            style={[
              styles.cellDayText,
              isSelected && styles.selectedCellDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  // Year Selection Mode
  const renderYearPicker = () => (
    <View style={styles.selectorContainer}>
      <View style={styles.selectorHeader}>
        <TouchableOpacity
          style={styles.backToCalBtn}
          onPress={() => setViewMode('calendar')}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={14} color={Colors.primary} />
          <Text style={styles.backToCalText}>Calendar</Text>
        </TouchableOpacity>
        <Text style={styles.selectorTitle}>Select Year</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.yearScroll}
        contentContainerStyle={styles.yearGrid}
        showsVerticalScrollIndicator={true}
      >
        {YEAR_LIST.map((year) => {
          const isCurrent = year === currentYear;
          return (
            <TouchableOpacity
              key={`yr_${year}`}
              style={[
                styles.yearItem,
                isCurrent && styles.yearItemSelected,
              ]}
              onPress={() => handleYearSelect(year)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.yearItemText,
                  isCurrent && styles.yearItemTextSelected,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Month Selection Mode
  const renderMonthPicker = () => (
    <View style={styles.selectorContainer}>
      <View style={styles.selectorHeader}>
        <TouchableOpacity
          style={styles.backToCalBtn}
          onPress={() => setViewMode('calendar')}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={14} color={Colors.primary} />
          <Text style={styles.backToCalText}>Calendar</Text>
        </TouchableOpacity>
        <Text style={styles.selectorTitle}>Select Month</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.monthGrid}>
        {MONTHS_SHORT.map((mName, index) => {
          const isCurrent = index === currentMonthIndex;
          return (
            <TouchableOpacity
              key={`m_${mName}`}
              style={[
                styles.monthItem,
                isCurrent && styles.monthItemSelected,
              ]}
              onPress={() => handleMonthSelect(index)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.monthItemText,
                  isCurrent && styles.monthItemTextSelected,
                ]}
              >
                {mName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header Bar */}
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          {viewMode === 'year' && renderYearPicker()}
          {viewMode === 'month' && renderMonthPicker()}

          {viewMode === 'calendar' && (
            <>
              {/* Month & Year Navigation Row with Direct Tappable Selectors */}
              <View style={styles.monthHeaderRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.arrowBtn}
                  onPress={handlePrevMonth}
                >
                  <ArrowLeftIcon size={16} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.headerCenterSelectors}>
                  {/* Tap Month to pick month */}
                  <TouchableOpacity
                    style={styles.pillSelector}
                    activeOpacity={0.7}
                    onPress={() => setViewMode('month')}
                  >
                    <Text style={styles.pillSelectorText}>
                      {MONTH_NAMES[currentMonthIndex]}
                    </Text>
                    <ChevronDownIcon size={11} color={Colors.primary} />
                  </TouchableOpacity>

                  {/* Tap Year to pick year directly */}
                  <TouchableOpacity
                    style={[styles.pillSelector, styles.yearPillSelector]}
                    activeOpacity={0.7}
                    onPress={() => setViewMode('year')}
                  >
                    <Text style={styles.pillSelectorText}>{currentYear}</Text>
                    <ChevronDownIcon size={11} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.arrowBtn}
                  onPress={handleNextMonth}
                >
                  <ChevronRightIcon size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Days of week header */}
              <View style={styles.daysOfWeekRow}>
                {DAYS_OF_WEEK.map((d, index) => (
                  <Text key={`day_h_${index}`} style={styles.dayOfWeekText}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>{renderCalendarCells()}</View>
            </>
          )}

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  headerCenterSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    gap: 4,
  },
  yearPillSelector: {
    backgroundColor: '#F3EFEA',
  },
  pillSelectorText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  dayOfWeekText: {
    width: 38,
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: Spacing.md,
  },
  calendarCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 19,
  },
  selectedCell: {
    backgroundColor: Colors.primary,
  },
  cellDayText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  selectedCellDayText: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
  cancelButton: {
    backgroundColor: '#F3EFEA',
    height: 42,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  // Year & Month Selector Styles
  selectorContainer: {
    marginBottom: Spacing.md,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backToCalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#FAF8F5',
  },
  backToCalText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  selectorTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  yearScroll: {
    maxHeight: 220,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 4,
  },
  yearItem: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8F6F2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  yearItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearItemText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  yearItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F8F6F2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  monthItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthItemText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  monthItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
});
