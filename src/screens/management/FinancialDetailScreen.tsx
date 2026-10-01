import React, { useState, useEffect, useMemo } from 'react';
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
import { ScreenHeader, SearchIcon, RefreshIcon } from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';
import {
  useGetDashReceivableMutation,
  useGetDashPayableMutation,
  useGetDashBanksMutation,
  CustomerBalanceItem,
  SupplierBalanceItem,
  BankBalanceItem,
} from '../../api/managementApi';

interface FinancialDetailScreenProps {
  type: 'Receivable' | 'Payable' | 'Cash/Bank';
  title?: string;
  dimensionId?: string | number;
  company?: string;
  onNavigateLedger?: (params: {
    account?: string;
    personId?: string;
    title: string;
    fromDate?: string;
    toDate?: string;
  }) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const FinancialDetailScreen: React.FC<FinancialDetailScreenProps> = ({
  type,
  title,
  dimensionId = '',
  company = '1',
  onNavigateLedger,
  onBack,
  onHome,
}) => {
  const [viewAll, setViewAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any[]>([]);

  const [getReceivable, { isLoading: isRecLoading }] = useGetDashReceivableMutation();
  const [getPayable, { isLoading: isPayLoading }] = useGetDashPayableMutation();
  const [getBanks, { isLoading: isBanksLoading }] = useGetDashBanksMutation();

  const isLoading = isRecLoading || isPayLoading || isBanksLoading;

  const fetchData = async () => {
    try {
      if (type === 'Receivable') {
        const res = await getReceivable({ company, dimension_id: dimensionId }).unwrap();
        if (res.status_cust_bal === 'true' || res.status_cust_bal === true) {
          setSummaryData(res.data_cust_bal || []);
          setFullData(res.data_view_cust_bal || res.data_cust_bal || []);
        }
      } else if (type === 'Payable') {
        const res = await getPayable({ company, dimension_id: dimensionId }).unwrap();
        if (
          res.status_supp_bal === 'true' ||
          res.status_supp_bal === true ||
          res.status_supp_bal_view_all === 'true'
        ) {
          setSummaryData(res.data_supp_bal || []);
          setFullData(res.data_supp_bal_view_all || res.data_supp_bal || []);
        }
      } else if (type === 'Cash/Bank') {
        const res = await getBanks({ company, dimension_id: dimensionId }).unwrap();
        if (res.status_cash_bank === 'true' || res.status_cash_bank === true) {
          setSummaryData(res.data_bank_bal || []);
          setFullData(res.data_bank_bal_view_all || res.data_bank_bal || []);
        }
      }
    } catch (err) {
      console.log(`[FinancialDetailScreen] Fetch error for ${type}:`, err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, company, dimensionId]);

  const activeRawList = viewAll ? fullData : summaryData;

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeRawList;
    const q = searchQuery.toLowerCase().trim();
    return activeRawList.filter((item) => {
      const name = String(
        item.name ||
        item.supp_name ||
        item.bank_name ||
        item.bank_account_name ||
        ''
      ).toLowerCase();
      const code = String(
        item.debtor_no ||
        item.supplier_id ||
        item.bank_act ||
        item.account_code ||
        ''
      ).toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [activeRawList, searchQuery]);

  const totalBalance = useMemo(() => {
    return filteredList.reduce((acc, item) => {
      const val = parseFloat(item.Balance ?? item.bank_balance ?? '0') || 0;
      return acc + val;
    }, 0);
  }, [filteredList]);

  const headerTitle = title || (type === 'Cash/Bank' ? 'Cash & Bank' : type);

  const renderItem = ({ item }: { item: any }) => {
    const rawName = item.name || item.supp_name || item.bank_name || item.bank_account_name || 'Unknown';
    const cleanName = rawName.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const code = item.debtor_no || item.supplier_id || item.bank_act || item.account_code || '';
    const balanceNum = parseFloat(item.Balance ?? item.bank_balance ?? '0') || 0;

    const handleItemLedgerPress = () => {
      let accToPass = item.account || item.account_code || '';
      let personToPass = '';

      if (type === 'Cash/Bank') {
        accToPass = item.account || item.bank_act || item.account_code || '';
      } else if (type === 'Receivable') {
        personToPass = item.debtor_no || item.customer_id || item.person_id || '';
      } else if (type === 'Payable') {
        personToPass = item.supplier_id || item.person_id || '';
      }

      console.log(`>>> [FinancialDetailScreen] Navigating to Ledger for ${type}:`, {
        account: accToPass,
        personId: personToPass,
        title: cleanName,
      });

      onNavigateLedger?.({
        account: String(accToPass),
        personId: String(personToPass),
        title: cleanName,
      });
    };

    return (
      <TouchableOpacity
        style={styles.cardItem}
        activeOpacity={0.75}
        onPress={handleItemLedgerPress}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardName} numberOfLines={2}>
              {cleanName}
            </Text>
            {code ? (
              <Text style={styles.cardCode}>
                {type === 'Receivable' ? 'Customer #' : type === 'Payable' ? 'Supplier #' : 'A/C: '}
                {code}
              </Text>
            ) : null}
          </View>

          <View style={styles.cardRight}>
            <Text
              style={[
                styles.cardAmount,
                type === 'Receivable'
                  ? styles.amountPositive
                  : type === 'Payable'
                  ? styles.amountNegative
                  : styles.amountNeutral,
              ]}
            >
              Rs. {Math.abs(balanceNum).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Ledger Navigation Button */}
        <View style={styles.cardActionRow}>
          <View style={styles.ledgerBadge}>
            <Text style={styles.ledgerBadgeText}>View Ledger ›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title={headerTitle}
        onBackPress={onBack}
        onHomePress={onHome}
      />

      {/* Top Total Summary Banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryTopRow}>
          <Text style={styles.summaryLabel}>TOTAL {headerTitle.toUpperCase()}</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={fetchData}
            activeOpacity={0.7}
          >
            <RefreshIcon size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.summaryTotalValue}>
          Rs. {Math.abs(totalBalance).toLocaleString()}
        </Text>
        <Text style={styles.summaryCount}>
          Showing {filteredList.length} records
        </Text>
      </View>

      {/* View Toggle Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.toggleTab, !viewAll && styles.activeToggleTab]}
          onPress={() => setViewAll(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleTabText, !viewAll && styles.activeToggleTabText]}>
            Summary View ({summaryData.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleTab, viewAll && styles.activeToggleTab]}
          onPress={() => setViewAll(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleTabText, viewAll && styles.activeToggleTabText]}>
            View All ({fullData.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <SearchIcon size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${headerTitle}...`}
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

      {/* Main List */}
      {isLoading && summaryData.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading {headerTitle} balances...</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No records found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try matching another name or code.' : 'No balance data available.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item, index) => `${item.id || index}_${item.name || index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchData}
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
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    padding: 4,
  },
  summaryTotalValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  summaryCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: '#EAE6E1',
    borderRadius: Spacing.borderRadius.md,
    padding: 3,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.sm,
  },
  activeToggleTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleTabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  activeToggleTabText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
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
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: '#F3EFEA',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FAF8F5',
  },
  ledgerBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  ledgerBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#2563EB',
  },
  cardLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  cardCode: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
  },
  amountPositive: {
    color: '#059669', // Emerald Green
  },
  amountNegative: {
    color: '#DC2626', // Red
  },
  amountNeutral: {
    color: '#2563EB', // Blue
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
