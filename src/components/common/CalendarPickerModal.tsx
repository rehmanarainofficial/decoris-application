import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { CrownIcon, ChevronRightIcon, ArrowLeftIcon } from './Icons';
import { Colors, Typography, Spacing } from '../../constants';

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDateTime: (dateStr: string, timeStr: string) => void;
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

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  visible,
  onClose,
  onSelectDateTime,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(27);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(7); // August (0-indexed 7)
  const [selectedTime, setSelectedTime] = useState<string>('02:35 PM');
  const [customTime, setCustomTime] = useState<string>('');

  const timeSlots = [
    '11:00 AM',
    '01:00 PM',
    '02:35 PM',
    '05:00 PM',
    '07:30 PM',
    '09:00 PM',
    '10:30 PM',
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate days & starting offset for currently selected month & year
  const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const startWeekday = new Date(currentYear, currentMonthIndex, 1).getDay();

  const paddingDays = Array.from({ length: startWeekday }, (_, i) => i);
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const handleSelectPresetTime = (time: string) => {
    setSelectedTime(time);
    setCustomTime('');
  };

  const handleCustomTimeChange = (val: string) => {
    setCustomTime(val);
    setSelectedTime(val);
  };

  const handleConfirm = () => {
    const dayFormatted = selectedDay < 10 ? `0${selectedDay}` : `${selectedDay}`;
    const monthFormatted =
      currentMonthIndex + 1 < 10
        ? `0${currentMonthIndex + 1}`
        : `${currentMonthIndex + 1}`;
    const dateFormatted = `${dayFormatted}/${monthFormatted}/${currentYear}`;
    const finalTime = selectedTime || '02:35 PM';
    onSelectDateTime(dateFormatted, finalTime);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header Bar */}
          <View style={styles.headerContainer}>
            <CrownIcon size={16} color={Colors.accentGold} />
            <Text style={styles.modalTitle}>Select Date & Time</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Interactive Month Switcher */}
            <View style={styles.monthHeaderRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.arrowBtn}
                onPress={handlePrevMonth}
              >
                <ArrowLeftIcon size={16} color={Colors.primary} />
              </TouchableOpacity>

              <Text style={styles.monthText}>
                {MONTH_NAMES[currentMonthIndex]} {currentYear}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.arrowBtn}
                onPress={handleNextMonth}
              >
                <ChevronRightIcon size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Days of Week Row */}
            <View style={styles.daysHeaderRow}>
              {daysOfWeek.map((day, idx) => (
                <Text key={idx} style={styles.dayHeaderText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.calendarGrid}>
              {paddingDays.map((p) => (
                <View key={`pad-${p}`} style={styles.dayCell} />
              ))}
              {monthDays.map((d) => {
                const isSelected = selectedDay === d;
                return (
                  <TouchableOpacity
                    key={`day-${d}`}
                    style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                    onPress={() => setSelectedDay(d)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isSelected && styles.selectedDayCellText,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Time Slot & Custom Time Section */}
            <View style={styles.timeSection}>
              <Text style={styles.sectionLabel}>Select Time Slot</Text>
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => {
                  const isTimeSelected = selectedTime === time && !customTime;
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeChip,
                        isTimeSelected && styles.selectedTimeChip,
                      ]}
                      onPress={() => handleSelectPresetTime(time)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          isTimeSelected && styles.selectedTimeChipText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Time Input Option */}
              <View style={styles.customTimeWrapper}>
                <Text style={styles.customTimeLabel}>Or Enter Custom Time:</Text>
                <TextInput
                  style={styles.customTimeInput}
                  placeholder="e.g. 03:15 PM"
                  placeholderTextColor={Colors.textMuted}
                  value={customTime}
                  onChangeText={handleCustomTimeChange}
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Confirm Date & Time</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '85%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  arrowBtn: {
    padding: Spacing.xs,
  },
  monthText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  daysHeaderRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayCell: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  dayCellText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  selectedDayCellText: {
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  timeSection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  timeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTimeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeChipText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
  },
  selectedTimeChipText: {
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  customTimeWrapper: {
    marginTop: Spacing.xs,
  },
  customTimeLabel: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  customTimeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    height: 42,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  cancelBtnText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    height: 46,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  confirmBtnText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
