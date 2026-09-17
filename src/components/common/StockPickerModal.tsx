import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SearchIcon, ChevronDownIcon } from './Icons';
import { Colors, Typography, Spacing } from '../../constants';
import { StockMasterItem } from '../../api/stockApi';

interface StockPickerModalProps {
  visible: boolean;
  stockItems: StockMasterItem[];
  isLoading?: boolean;
  onSelect: (item: StockMasterItem) => void;
  onClose: () => void;
}

export const StockPickerModal: React.FC<StockPickerModalProps> = ({
  visible,
  stockItems,
  isLoading = false,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return stockItems;
    const q = searchQuery.toLowerCase().trim();
    return stockItems.filter(
      (item) =>
        item.description?.toLowerCase().includes(q) ||
        item.stock_id?.toLowerCase().includes(q) ||
        item.cat_name?.toLowerCase().includes(q)
    );
  }, [stockItems, searchQuery]);

  const handleSelectItem = (item: StockMasterItem) => {
    onSelect(item);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Top Handle Bar */}
          <View style={styles.handleBar} />

          {/* Title */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Select Stock Item</Text>
            <Text style={styles.modalSubtitle}>Choose item for requirement detail</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchIcon size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items by name or ID..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Items List / Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading stock items...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.stock_id || item.description}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matching stock items found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => handleSelectItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemInfoCol}>
                    <Text style={styles.itemDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      {item.cat_name ? (
                        <Text style={styles.itemCategory}>{item.cat_name}</Text>
                      ) : null}
                      {item.unit_name || item.units ? (
                        <Text style={styles.itemUnit}>
                          • {item.unit_name || item.units}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>ID: {item.stock_id}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textSecondary,
    marginTop: 2,
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
    marginBottom: Spacing.sm,
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
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 6,
  },
  itemInfoCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accentGold,
    fontWeight: Typography.fontWeight.medium,
  },
  itemUnit: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  stockBadge: {
    backgroundColor: Colors.iconBgLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  closeButton: {
    marginTop: Spacing.md,
    height: 46,
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
});
