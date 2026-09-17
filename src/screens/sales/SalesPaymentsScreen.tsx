import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ScreenHeader, WalletIcon, SearchIcon, PrinterIcon } from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';

interface SalesPaymentItem {
  id: string;
  orderId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: 'Completed' | 'Pending';
}

interface SalesPaymentsScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

const INITIAL_SALES: SalesPaymentItem[] = [
  {
    id: 'sp_1',
    orderId: 'BS-F-0001',
    customerName: 'Muhammad Ali',
    date: '16-09-2026',
    amount: 150000,
    paymentMethod: 'Bank Transfer',
    status: 'Completed',
  },
  {
    id: 'sp_2',
    orderId: 'BS-F-0002',
    customerName: 'Zainab Tariq',
    date: '15-09-2026',
    amount: 85000,
    paymentMethod: 'Cash',
    status: 'Completed',
  },
  {
    id: 'sp_3',
    orderId: 'BS-F-0003',
    customerName: 'Usman Sheikh',
    date: '14-09-2026',
    amount: 50000,
    paymentMethod: 'Cheque',
    status: 'Pending',
  },
];

export const SalesPaymentsScreen: React.FC<SalesPaymentsScreenProps> = ({
  onBack,
  onHome,
}) => {
  const [sales] = useState<SalesPaymentItem[]>(INITIAL_SALES);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSales = sales.filter(
    (s) =>
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = sales.reduce((acc, s) => acc + s.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Sales & Payments"
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
            <WalletIcon size={20} color={Colors.primary} />
            <Text style={styles.kpiTitle}>Total Collections</Text>
          </View>
          <Text style={styles.kpiValue}>Rs. {totalCollected.toLocaleString()}</Text>
          <Text style={styles.kpiSub}>Total payments recorded this month</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, order # or method..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Payments List Table Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeaderBanner}>
            <Text style={styles.bannerTitle}>PAYMENT TRANSACTIONS</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInner}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.headCell, { width: 100 }]}>ORDER #</Text>
                <Text style={[styles.headCell, { width: 150 }]}>CUSTOMER</Text>
                <Text style={[styles.headCell, { width: 100 }]}>DATE</Text>
                <Text style={[styles.headCell, { width: 120 }]}>METHOD</Text>
                <Text style={[styles.headCell, { width: 100, textAlign: 'right' }]}>AMOUNT</Text>
                <Text style={[styles.headCell, { width: 90, textAlign: 'center' }]}>STATUS</Text>
              </View>

              {filteredSales.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={[styles.cellText, { width: 100, fontWeight: 'bold', color: Colors.primary }]}>
                    {item.orderId}
                  </Text>
                  <Text style={[styles.cellText, { width: 150, color: Colors.textPrimary }]} numberOfLines={1}>
                    {item.customerName}
                  </Text>
                  <Text style={[styles.cellText, { width: 100 }]}>{item.date}</Text>
                  <Text style={[styles.cellText, { width: 120 }]}>{item.paymentMethod}</Text>
                  <Text style={[styles.cellText, { width: 100, textAlign: 'right', fontWeight: 'bold', color: '#1a365d' }]}>
                    {item.amount.toLocaleString()}
                  </Text>
                  <View style={{ width: 90, alignItems: 'center' }}>
                    <View
                      style={[
                        styles.statusPill,
                        item.status === 'Completed' ? styles.statusCompleted : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextPending,
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
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
    minWidth: 660,
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
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#DEF7EC',
  },
  statusPending: {
    backgroundColor: '#FEF08A',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextCompleted: {
    color: '#03543F',
  },
  statusTextPending: {
    color: '#713F12',
  },
});
