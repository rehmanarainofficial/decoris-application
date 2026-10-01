import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, SearchIcon } from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';
import {
  useGetDashCategoryWiseValuationMutation,
  useGetDashLocationWiseValuationMutation,
  useGetDashItemWiseValuationMutation,
  CategoryValuationItem,
  LocationValuationItem,
  ItemValuationItem,
} from '../../api/managementApi';

interface InventoryValuationScreenProps {
  company?: string;
  dimensionId?: string | number;
  onBack?: () => void;
  onHome?: () => void;
}

type ValuationTab = 'category' | 'location' | 'item';

export const InventoryValuationScreen: React.FC<InventoryValuationScreenProps> = ({
  company = '1',
  dimensionId = '',
  onBack,
  onHome,
}) => {
  const [activeTab, setActiveTab] = useState<ValuationTab>('category');
  const [searchQuery, setSearchQuery] = useState('');

  const [categoryData, setCategoryData] = useState<CategoryValuationItem[]>([]);
  const [locationData, setLocationData] = useState<LocationValuationItem[]>([]);
  const [itemData, setItemData] = useState<ItemValuationItem[]>([]);

  const [getCategoryWise, { isLoading: isCatLoading }] =
    useGetDashCategoryWiseValuationMutation();
  const [getLocationWise, { isLoading: isLocLoading }] =
    useGetDashLocationWiseValuationMutation();
  const [getItemWise, { isLoading: isItemLoading }] =
    useGetDashItemWiseValuationMutation();

  const isLoading = isCatLoading || isLocLoading || isItemLoading;

  const fetchCategoryData = useCallback(async () => {
    try {
      const res = await getCategoryWise({ company, dimension_id: dimensionId }).unwrap();
      if (res && res.status_cate_wise_valutions === 'true') {
        setCategoryData(res.data_cate_wise_valutions || []);
      }
    } catch (err) {
      console.log('[InventoryValuation] Category fetch error:', err);
    }
  }, [company, dimensionId, getCategoryWise]);

  const fetchLocationData = useCallback(async () => {
    try {
      const res = await getLocationWise({ company, dimension_id: dimensionId }).unwrap();
      if (res && res.status_loc_wise_valutions === 'true') {
        setLocationData(res.data_loc_wise_valutions || []);
      }
    } catch (err) {
      console.log('[InventoryValuation] Location fetch error:', err);
    }
  }, [company, dimensionId, getLocationWise]);

  const fetchItemData = useCallback(async () => {
    try {
      const res = await getItemWise({ company, dimension_id: dimensionId }).unwrap();
      if (res && res.status_item_wise_valutions === 'true') {
        setItemData(res.data_item_wise_valutions || []);
      }
    } catch (err) {
      console.log('[InventoryValuation] Item fetch error:', err);
    }
  }, [company, dimensionId, getItemWise]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleTabChange = (tab: ValuationTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    if (tab === 'location' && locationData.length === 0) {
      fetchLocationData();
    } else if (tab === 'item' && itemData.length === 0) {
      fetchItemData();
    }
  };

  const currentList = useMemo(() => {
    if (activeTab === 'category') return categoryData;
    if (activeTab === 'location') return locationData;
    return itemData;
  }, [activeTab, categoryData, locationData, itemData]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase().trim();

    return currentList.filter((item: any) => {
      const desc = String(item.description || item.location_name || '').toLowerCase();
      const code = String(item.category_id || item.loc_code || item.stock_id || '').toLowerCase();
      return desc.includes(q) || code.includes(q);
    });
  }, [currentList, searchQuery]);

  const totalValuation = useMemo(() => {
    return filteredList.reduce((acc, item: any) => {
      const val = parseFloat(String(item.valution ?? item.valuation ?? '0')) || 0;
      return acc + val;
    }, 0);
  }, [filteredList]);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const titleText =
      item.description || item.location_name || item.stock_id || 'Inventory Record';
    const cleanTitle = String(titleText).replace(/&amp;/g, '&');
    const valueNum = parseFloat(String(item.valution ?? item.valuation ?? '0')) || 0;
    const subText =
      activeTab === 'item'
        ? `Stock ID: ${item.stock_id || '-'}  •  Qty: ${item.quantity || '0'}`
        : activeTab === 'location'
        ? `Location Code: ${item.loc_code || '-'}`
        : `Category ID: ${item.category_id || '-'}`;

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {cleanTitle}
          </Text>
          <Text style={styles.cardSubtitle}>{subText}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardAmount}>Rs. {valueNum.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Inventory Valuation"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'category' && styles.activeTabButton]}
          onPress={() => handleTabChange('category')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'category' && styles.activeTabButtonText,
            ]}
          >
            Category Wise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'location' && styles.activeTabButton]}
          onPress={() => handleTabChange('location')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'location' && styles.activeTabButtonText,
            ]}
          >
            Location Wise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'item' && styles.activeTabButton]}
          onPress={() => handleTabChange('item')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'item' && styles.activeTabButtonText,
            ]}
          >
            Item Wise
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Total Card */}
      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>
          TOTAL {activeTab.toUpperCase()} VALUATION
        </Text>
        <Text style={styles.summaryTotalValue}>
          Rs. {totalValuation.toLocaleString()}
        </Text>
        <Text style={styles.summaryCount}>
          Showing {filteredList.length} items
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <SearchIcon size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab} valuation...`}
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {isLoading && currentList.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching inventory valuation...</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No inventory records</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'No items match your search term.'
              : 'No valuation data found for this category/location.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item, index) =>
            `${item.stock_id || item.loc_code || item.category_id || index}_${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (activeTab === 'category') fetchCategoryData();
                else if (activeTab === 'location') fetchLocationData();
                else fetchItemData();
              }}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: '#EAE6E1',
    borderRadius: Spacing.borderRadius.md,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.sm,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  summaryTotalValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  summaryCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  clearSearchText: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 6,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#F3EFEA',
  },
  cardLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
