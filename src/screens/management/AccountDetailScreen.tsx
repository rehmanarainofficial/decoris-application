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
import {
  ScreenHeader,
  SearchIcon,
  CalendarIcon,
  DatePickerModal,
} from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';
import {
  useGetParentAccountDetailMutation,
  ParentAccountDetailItem,
} from '../../api/managementApi';

interface AccountDetailScreenProps {
  title: string;
  accountType: string;
  initialFromDate?: string;
  initialToDate?: string;
  company?: string;
  dimensionId?: string | number;
  onNavigateLedger?: (params: {
    account: string;
    title: string;
    fromDate?: string;
    toDate?: string;
  }) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const AccountDetailScreen: React.FC<AccountDetailScreenProps> = ({
  title,
  accountType,
  initialFromDate,
  initialToDate,
  company = '1',
  dimensionId = '',
  onNavigateLedger,
  onBack,
  onHome,
}) => {
  const [fromDate, setFromDate] = useState(() => {
    if (initialFromDate) return initialFromDate;
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    if (initialToDate) return initialToDate;
    return new Date().toISOString().split('T')[0];
  });

  // Calendar Date Picker Modal state
  const [activeDatePicker, setActiveDatePicker] = useState<'from' | 'to' | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<ParentAccountDetailItem[]>([]);

  const [getParentAccountDetail, { isLoading }] = useGetParentAccountDetailMutation();

  const cleanTitle = useMemo(() => {
    return String(title || 'Account Details').replace(/&amp;/g, '&');
  }, [title]);

  const fetchData = useCallback(
    async (start = fromDate, end = toDate) => {
      console.log('====================================================');
      console.log('>>> [AccountDetailScreen] CALLING API:');
      console.log('Endpoint: dashboard/parent_account_detail.php');
      console.log('Payload:', {
        from_date: start,
        to_date: end,
        account_type: accountType,
        company,
        dimension_id: dimensionId,
      });
      console.log('====================================================');

      try {
        const res = await getParentAccountDetail({
          from_date: start,
          to_date: end,
          account_type: accountType,
          company,
          dimension_id: dimensionId,
        }).unwrap();

        console.log('====================================================');
        console.log('<<< [AccountDetailScreen] API RESPONSE STATUS:', res?.status);
        console.log('<<< [AccountDetailScreen] RECORD COUNT:', res?.data?.length || 0);
        console.log('<<< [AccountDetailScreen] FULL DATA RECEIVED:', JSON.stringify(res, null, 2));
        console.log('====================================================');

        if (res && (res.status === 'true' || res.status === true) && Array.isArray(res.data)) {
          setTransactions(res.data);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.log('!!! [AccountDetailScreen] API ERROR:', err);
        setTransactions([]);
      }
    },
    [accountType, company, dimensionId, fromDate, toDate, getParentAccountDetail]
  );

  useEffect(() => {
    fetchData(fromDate, toDate);
  }, [accountType, company, dimensionId]);

  const handleApplyFilter = () => {
    fetchData(fromDate, toDate);
  };

  const handleResetDateFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    const prev = new Date();
    prev.setDate(prev.getDate() - 30);
    const prevStr = prev.toISOString().split('T')[0];
    setFromDate(prevStr);
    setToDate(today);
    fetchData(prevStr, today);
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase().trim();
    return transactions.filter((t) => {
      const name = String(t.account_name || t.memo || '').toLowerCase();
      const code = String(t.account_code || t.reference || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [transactions, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t: any) => {
      const val = parseFloat(String(t.t_amount ?? t.amount ?? '0')) || 0;
      return acc + Math.abs(val);
    }, 0);
  }, [filteredTransactions]);

  const renderItem = ({ item }: { item: ParentAccountDetailItem | any; index: number }) => {
    const rawName = item.account_name || item.memo || 'Entry';
    const cleanAccountName = String(rawName).replace(/&amp;/g, '&');
    const amountVal = parseFloat(String(item.t_amount ?? item.amount ?? '0')) || 0;
    const code = item.account_code || item.reference || '';
    const dateStr = item.trans_date || item.doc_date || '';

    return (
      <TouchableOpacity
        style={styles.cardItem}
        activeOpacity={0.7}
        onPress={() => {
          if (code) {
            console.log('>>> [AccountDetailScreen] Opening Ledger for account_code:', code, cleanAccountName);
            onNavigateLedger?.({
              account: String(code),
              title: cleanAccountName,
              fromDate,
              toDate,
            });
          }
        }}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardAccountName} numberOfLines={2}>
            {cleanAccountName}
          </Text>
          <View style={styles.cardMetaRow}>
            {code ? <Text style={styles.cardCode}>Account #{code}</Text> : null}
            <Text style={styles.cardLedgerHint}>Tap to view ledger ›</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.cardAmount}>Rs. {Math.abs(amountVal).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title={cleanTitle}
        onBackPress={onBack}
        onHomePress={onHome}
      />

      {/* Date Filter Card with Calendar Picker */}
      <View style={styles.dateFilterCard}>
        <Text style={styles.filterCardTitle}>DATE FILTER</Text>
        <View style={styles.dateInputsRow}>
          {/* From Date Touch Target */}
          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.75}
            onPress={() => setActiveDatePicker('from')}
          >
            <CalendarIcon size={16} color={Colors.primary} />
            <View style={styles.dateTextWrapper}>
              <Text style={styles.dateLabel}>FROM</Text>
              <Text style={styles.dateValueText}>{fromDate}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dateArrowBox}>
            <Text style={styles.dateArrowText}>→</Text>
          </View>

          {/* To Date Touch Target */}
          <TouchableOpacity
            style={styles.dateBox}
            activeOpacity={0.75}
            onPress={() => setActiveDatePicker('to')}
          >
            <CalendarIcon size={16} color={Colors.primary} />
            <View style={styles.dateTextWrapper}>
              <Text style={styles.dateLabel}>TO</Text>
              <Text style={styles.dateValueText}>{toDate}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={styles.applyFilterBtn}
            onPress={handleApplyFilter}
            activeOpacity={0.8}
          >
            <Text style={styles.applyFilterBtnText}>Apply Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetFilterBtn}
            onPress={handleResetDateFilter}
            activeOpacity={0.8}
          >
            <Text style={styles.resetFilterBtnText}>Last 30 Days</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Total Banner */}
      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>TOTAL ACCUMULATED</Text>
        <Text style={styles.summaryTotalValue}>Rs. {totalAmount.toLocaleString()}</Text>
        <Text style={styles.summaryCount}>
          Showing {filteredTransactions.length} entries
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <SearchIcon size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by account name, ref..."
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

      {/* Transaction List */}
      {isLoading && transactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching account details...</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'No records match your search filter.'
              : 'No entries recorded for this account in the selected date range.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item, index) => `${item.account_code || index}_${item.trans_date || index}_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchData(fromDate, toDate)}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={activeDatePicker !== null}
        title={activeDatePicker === 'from' ? 'Select From Date' : 'Select To Date'}
        selectedDate={activeDatePicker === 'from' ? fromDate : toDate}
        onClose={() => setActiveDatePicker(null)}
        onSelectDate={(selectedDate) => {
          if (activeDatePicker === 'from') {
            setFromDate(selectedDate);
          } else if (activeDatePicker === 'to') {
            setToDate(selectedDate);
          }
          setActiveDatePicker(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  dateFilterCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  filterCardTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F2',
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E4DF',
    paddingHorizontal: Spacing.sm,
    gap: 8,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  dateValueText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  dateArrowBox: {
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  applyFilterBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 40,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyFilterBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  resetFilterBtn: {
    flex: 1,
    backgroundColor: '#EAE6E1',
    height: 40,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetFilterBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
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
  cardAccountName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 4,
  },
  cardCode: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  cardLedgerHint: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  cardDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardDateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
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
