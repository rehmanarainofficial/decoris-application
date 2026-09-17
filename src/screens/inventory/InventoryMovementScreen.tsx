import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { ScreenHeader, ShortingIcon, SearchIcon } from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';
import { useGetStockMasterQuery } from '../../api/stockApi';

interface InventoryMovementScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const InventoryMovementScreen: React.FC<InventoryMovementScreenProps> = ({
  onBack,
  onHome,
}) => {
  const { data: stockData } = useGetStockMasterQuery();
  const stockList = stockData?.data || [];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStock = stockList.filter((it) =>
    it.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.stock_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    it.cat_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Inventory Movement"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* KPI Card */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <ShortingIcon size={20} color={Colors.primary} />
            <Text style={styles.kpiTitle}>Total Inventory Items</Text>
          </View>
          <Text style={styles.kpiValue}>{stockList.length}</Text>
          <Text style={styles.kpiSub}>Track stock items and warehouse movements</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search item name, code or category..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Table Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeaderBanner}>
            <Text style={styles.bannerTitle}>STOCK & ITEM MOVEMENT</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInner}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.headCell, { width: 90 }]}>ITEM CODE</Text>
                <Text style={[styles.headCell, { width: 180 }]}>DESCRIPTION</Text>
                <Text style={[styles.headCell, { width: 120 }]}>CATEGORY</Text>
                <Text style={[styles.headCell, { width: 80, textAlign: 'center' }]}>UNIT</Text>
                <Text style={[styles.headCell, { width: 100, textAlign: 'right' }]}>PRICE</Text>
              </View>

              {filteredStock.map((item, idx) => (
                <View
                  key={item.stock_id || idx}
                  style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={[styles.cellText, { width: 90, fontWeight: 'bold', color: Colors.primary }]}>
                    {item.stock_id}
                  </Text>
                  <Text style={[styles.cellText, { width: 180, color: Colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[styles.cellText, { width: 120 }]} numberOfLines={1}>
                    {item.cat_name || '-'}
                  </Text>
                  <Text style={[styles.cellText, { width: 80, textAlign: 'center' }]}>
                    {item.units || '-'}
                  </Text>
                  <Text style={[styles.cellText, { width: 100, textAlign: 'right', fontWeight: 'bold', color: '#1a365d' }]}>
                    {item.price ? `Rs. ${item.price}` : '-'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  kpiCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.md,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
    marginLeft: 6,
  },
  kpiValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  mainCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
  },
  cardHeaderBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  tableInner: {
    minWidth: 570,
  },
  tableHeaderRow: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headCell: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#FAF9F6',
  },
  cellText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
});
