import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader, CalculatorIcon, SearchIcon, TrashIcon } from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';

interface CostingItem {
  id: string;
  vendor: string;
  description: string;
  qty: number;
  rate: number;
  total: number;
}

interface EventCostingScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

const INITIAL_COSTING: CostingItem[] = [
  { id: '1', vendor: 'Abid Contractor', description: 'Stage setup & carpeting', qty: 1, rate: 45000, total: 45000 },
  { id: '2', vendor: 'Ashok Lighting', description: 'Truss & moving heads', qty: 2, rate: 25000, total: 50000 },
  { id: '3', vendor: 'Ahsan SMD Screen', description: 'P3 Outdoor LED Wall', qty: 1, rate: 60000, total: 60000 },
  { id: '4', vendor: 'Abdullah Catering', description: 'Welcome drinks setup', qty: 200, rate: 350, total: 70000 },
];

export const EventCostingScreen: React.FC<EventCostingScreenProps> = ({
  onBack,
  onHome,
}) => {
  const [costingItems, setCostingItems] = useState<CostingItem[]>(INITIAL_COSTING);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = costingItems.filter(
    (c) =>
      c.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCost = costingItems.reduce((acc, it) => acc + it.total, 0);

  const handleDelete = (id: string) => {
    setCostingItems(costingItems.filter((it) => it.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Event Costing"
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
            <CalculatorIcon size={20} color={Colors.primary} />
            <Text style={styles.kpiTitle}>Total Event Cost</Text>
          </View>
          <Text style={styles.kpiValue}>Rs. {totalCost.toLocaleString()}</Text>
          <Text style={styles.kpiSub}>Estimated and actual vendor expenses</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vendor or description..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Costing Table Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeaderBanner}>
            <Text style={styles.bannerTitle}>VENDOR & EVENT COST BREAKDOWN</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInner}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.headCell, { width: 140 }]}>VENDOR</Text>
                <Text style={[styles.headCell, { width: 180 }]}>DESCRIPTION</Text>
                <Text style={[styles.headCell, { width: 60, textAlign: 'center' }]}>QTY</Text>
                <Text style={[styles.headCell, { width: 90, textAlign: 'center' }]}>RATE</Text>
                <Text style={[styles.headCell, { width: 100, textAlign: 'right' }]}>TOTAL</Text>
                <Text style={[styles.headCell, { width: 60, textAlign: 'center' }]}>ACTION</Text>
              </View>

              {filteredItems.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={[styles.cellText, { width: 140, fontWeight: 'bold', color: Colors.textPrimary }]}>
                    {item.vendor}
                  </Text>
                  <Text style={[styles.cellText, { width: 180, color: Colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={[styles.cellText, { width: 60, textAlign: 'center' }]}>
                    {item.qty}
                  </Text>
                  <Text style={[styles.cellText, { width: 90, textAlign: 'center' }]}>
                    {item.rate.toLocaleString()}
                  </Text>
                  <Text style={[styles.cellText, { width: 100, textAlign: 'right', fontWeight: 'bold', color: '#1a365d' }]}>
                    {item.total.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={{ width: 60, alignItems: 'center' }}
                    onPress={() => handleDelete(item.id)}
                  >
                    <TrashIcon size={16} color={Colors.accentRed} />
                  </TouchableOpacity>
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
    minWidth: 630,
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
