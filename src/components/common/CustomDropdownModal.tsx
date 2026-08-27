import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { SearchIcon, ChevronDownIcon } from './Icons';
import { Colors, Typography, Spacing } from '../../constants';

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownModalProps {
  visible: boolean;
  title: string;
  options: (string | DropdownOption)[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  placeholder?: string;
}

export const CustomDropdownModal: React.FC<CustomDropdownModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onSelect(val);
    setSearchQuery('');
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
          {/* Top Indicator */}
          <View style={styles.handleBar} />

          {/* Modal Header */}
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <SearchIcon size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    isSelected && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.selectedOptionLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

interface DropdownTriggerProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  label,
  value,
  placeholder = 'Select...',
  onPress,
}) => {
  return (
    <View style={styles.triggerWrapper}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.triggerText,
            !value && styles.triggerPlaceholderText,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <ChevronDownIcon size={14} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
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
    paddingBottom: Spacing.xxl,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    height: 46,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
    paddingVertical: 0,
  },
  listContent: {
    paddingVertical: Spacing.xs,
  },
  optionItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.sm,
    marginBottom: 4,
  },
  selectedOptionItem: {
    backgroundColor: Colors.iconBgLight,
  },
  optionLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  selectedOptionLabel: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  closeButton: {
    marginTop: Spacing.md,
    height: 48,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  triggerWrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    height: 44,
    paddingHorizontal: Spacing.md,
  },
  triggerText: {
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textPrimary,
    flex: 1,
  },
  triggerPlaceholderText: {
    color: Colors.textMuted,
  },
});
