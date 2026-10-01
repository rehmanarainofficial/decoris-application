import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScreenHeader,
  CalendarIcon,
  WalletIcon,
  PieChartIcon,
  RefreshIcon,
  DatePickerModal,
  BankIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CubeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';
import {
  useGetFinancialOverviewMutation,
  useGetIncomeExpenseMutation,
  IncomeExpenseItem,
} from '../../api/managementApi';

interface ManagementScreenProps {
  company?: string;
  dimensionId?: string | number;
  onNavigateFinancialDetail?: (params: { type: 'Receivable' | 'Payable' | 'Cash/Bank'; title: string }) => void;
  onNavigateInventoryValuation?: () => void;
  onNavigateAccountDetail?: (params: {
    title: string;
    accountType: string;
    fromDate?: string;
    toDate?: string;
  }) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const ManagementScreen: React.FC<ManagementScreenProps> = ({
  company = '1',
  dimensionId = '',
  onNavigateFinancialDetail,
  onNavigateInventoryValuation,
  onNavigateAccountDetail,
  onBack,
  onHome,
}) => {
  const [getFinancialOverview, { isLoading: isFinancialLoading }] =
    useGetFinancialOverviewMutation();
  const [getIncomeExpense, { isLoading: isIncomeLoading }] =
    useGetIncomeExpenseMutation();

  const [sliderData, setSliderData] = useState<any>(null);
  const [incomeList, setIncomeList] = useState<IncomeExpenseItem[]>([]);
  const [expenseList, setExpenseList] = useState<IncomeExpenseItem[]>([]);

  // Date states
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Calendar Modal state
  const [activeDatePicker, setActiveDatePicker] = useState<'from' | 'to' | null>(null);

  const isLoading = isFinancialLoading || isIncomeLoading;

  const fetchFinancials = useCallback(async () => {
    try {
      const res = await getFinancialOverview({
        company,
        dimension_id: dimensionId,
      }).unwrap();
      if (res && res.slider_data) {
        setSliderData(res.slider_data);
      }
    } catch (err) {
      console.log('[ManagementScreen] Overview error:', err);
    }
  }, [company, dimensionId, getFinancialOverview]);

  const fetchIncomeExpense = useCallback(
    async (start = fromDate, end = toDate) => {
      try {
        const res = await getIncomeExpense({
          from_date: start,
          to_date: end,
          company,
          dimension_id: dimensionId,
        }).unwrap();

        if (res) {
          if (res.status_income_det === 'true' || res.status_income_det === true) {
            setIncomeList(res.data_income_det || []);
          } else {
            setIncomeList([]);
          }
          if (res.status_exp_det === 'true' || res.status_exp_det === true) {
            setExpenseList(res.data_exp_det || []);
          } else {
            setExpenseList([]);
          }
        }
      } catch (err) {
        console.log('[ManagementScreen] Income/Expense error:', err);
      }
    },
    [company, dimensionId, fromDate, toDate, getIncomeExpense]
  );

  const loadAllData = useCallback(() => {
    fetchFinancials();
    fetchIncomeExpense();
  }, [fetchFinancials, fetchIncomeExpense]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const totalIncome = useMemo(() => {
    return incomeList.reduce((acc, item) => {
      const num = parseFloat(item.total || '0') || 0;
      return acc + Math.abs(num);
    }, 0);
  }, [incomeList]);

  const totalExpense = useMemo(() => {
    return expenseList.reduce((acc, item) => {
      const num = parseFloat(item.total || '0') || 0;
      return acc + Math.abs(num);
    }, 0);
  }, [expenseList]);

  const netDifference = totalIncome - totalExpense;

  const calculateTrend = (curStr?: string, preStr?: string) => {
    const cur = parseFloat(curStr || '0') || 0;
    const pre = parseFloat(preStr || '0') || 0;
    if (pre === 0 && cur === 0) return { text: '0%', isPositive: true };
    if (pre === 0) return { text: '+100%', isPositive: true };

    const diff = Math.abs(cur) - Math.abs(pre);
    const pct = (diff / Math.abs(pre)) * 100;
    const isPositive = Math.abs(cur) >= Math.abs(pre);
    return {
      text: `${isPositive ? '+' : ''}${pct.toFixed(1)}%`,
      isPositive,
    };
  };

  // Always return 8 cards even if sliderData is null/loading so cards are never missing
  const statCards = useMemo(() => {
    const sd = sliderData || {};

    return [
      {
        id: 'bank',
        title: 'Cash/Bank',
        type: 'Cash/Bank' as const,
        value: parseFloat(sd.cur_m_bank || '0') || 0,
        trend: calculateTrend(sd.cur_m_bank, sd.pre_m_bank),
        color: '#3B82F6', // Blue
        bgColor: '#EFF6FF',
        iconType: 'bank',
      },
      {
        id: 'rec',
        title: 'Receivable',
        type: 'Receivable' as const,
        value: parseFloat(sd.cur_m_receivable || '0') || 0,
        trend: calculateTrend(sd.cur_m_receivable, sd.pre_m_receivable),
        color: '#10B981', // Emerald
        bgColor: '#ECFDF5',
        iconType: 'receivable',
      },
      {
        id: 'pay',
        title: 'Payable',
        type: 'Payable' as const,
        value: parseFloat(sd.cur_m_payable || '0') || 0,
        trend: calculateTrend(sd.cur_m_payable, sd.pre_m_payable),
        color: '#EF4444', // Red
        bgColor: '#FEF2F2',
        iconType: 'payable',
      },
      {
        id: 'inv',
        title: 'Inventory Val',
        type: 'Inventory' as const,
        value: parseFloat(sd.cur_m_inventory_val || '0') || 0,
        trend: calculateTrend(sd.cur_m_inventory_val, sd.pre_m_inventory_val),
        color: '#F59E0B', // Amber
        bgColor: '#FFFBEB',
        iconType: 'inventory',
      },
      {
        id: 'inc',
        title: 'Income',
        type: 'Other' as const,
        value: parseFloat(sd.cur_m_income || '0') || 0,
        trend: calculateTrend(sd.cur_m_income, sd.pre_m_income),
        color: '#10B981',
        bgColor: '#ECFDF5',
        iconType: 'income',
      },
      {
        id: 'exp',
        title: 'Expense',
        type: 'Other' as const,
        value: parseFloat(sd.cur_m_expense || '0') || 0,
        trend: calculateTrend(sd.cur_m_expense, sd.pre_m_expense),
        color: '#EF4444',
        bgColor: '#FEF2F2',
        iconType: 'expense',
      },
      {
        id: 'rev',
        title: 'Revenue',
        type: 'Other' as const,
        value: parseFloat(sd.cur_m_revenue || '0') || 0,
        trend: calculateTrend(sd.cur_m_revenue, sd.pre_m_revenue),
        color: '#3B82F6',
        bgColor: '#EFF6FF',
        iconType: 'revenue',
      },
      {
        id: 'eq',
        title: 'Equity',
        type: 'Other' as const,
        value: parseFloat(sd.cur_m_equity || '0') || 0,
        trend: calculateTrend(sd.cur_m_equity, sd.pre_m_equity),
        color: '#8B5CF6',
        bgColor: '#F5F3FF',
        iconType: 'equity',
      },
    ];
  }, [sliderData]);

  const handleStatCardClick = (card: any) => {
    if (card.type === 'Receivable' || card.type === 'Payable' || card.type === 'Cash/Bank') {
      onNavigateFinancialDetail?.({ type: card.type, title: card.title });
    } else if (card.type === 'Inventory') {
      onNavigateInventoryValuation?.();
    }
  };

  const handleAccountClick = (item: IncomeExpenseItem) => {
    console.log('>>> [ManagementScreen] Account clicked for detail breakdown:', {
      name: item.name,
      account_type: item.account_type,
      total: item.total,
      fromDate,
      toDate,
    });
    if (item.account_type) {
      onNavigateAccountDetail?.({
        title: item.name ? item.name.replace(/&amp;/g, '&') : 'Account Details',
        accountType: item.account_type,
        fromDate,
        toDate,
      });
    }
  };

  const handleApplyDateFilter = () => {
    fetchIncomeExpense(fromDate, toDate);
  };

  const handleResetDateFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    const prev = new Date();
    prev.setDate(prev.getDate() - 30);
    const prevStr = prev.toISOString().split('T')[0];
    setFromDate(prevStr);
    setToDate(today);
    fetchIncomeExpense(prevStr, today);
  };

  const renderCardIcon = (iconType: string, color: string) => {
    switch (iconType) {
      case 'bank':
        return <BankIcon size={22} color={color} />;
      case 'receivable':
        return <ArrowDownCircleIcon size={22} color={color} />;
      case 'payable':
        return <ArrowUpCircleIcon size={22} color={color} />;
      case 'inventory':
        return <CubeIcon size={22} color={color} />;
      case 'income':
        return <TrendingUpIcon size={20} color={color} />;
      case 'expense':
        return <TrendingDownIcon size={20} color={color} />;
      case 'revenue':
        return <WalletIcon size={22} color={color} />;
      case 'equity':
        return <PieChartIcon size={22} color={color} />;
      default:
        return <WalletIcon size={22} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Management"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadAllData}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* 1. Date Filter with Calendar Picker Modal */}
        <View style={styles.filterCard}>
          <Text style={styles.filterCardTitle}>DATE FILTER</Text>
          <View style={styles.filterInputsRow}>
            {/* From Date Box */}
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

            {/* To Date Box */}
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
              style={styles.applyBtn}
              onPress={handleApplyDateFilter}
              activeOpacity={0.8}
            >
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetDateFilter}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Income Breakdown Section */}
        <View style={styles.listSectionCard}>
          <View style={[styles.listHeaderRow, { borderBottomColor: '#10B981' }]}>
            <Text style={[styles.listSectionTitle, { color: '#059669' }]}>
              INCOME BREAKDOWN
            </Text>
            <Text style={[styles.listTotalText, { color: '#059669' }]}>
              Rs. {totalIncome.toLocaleString()}
            </Text>
          </View>

          {isIncomeLoading && incomeList.length === 0 ? (
            <View style={styles.listLoadingBox}>
              <ActivityIndicator size="small" color="#059669" />
            </View>
          ) : incomeList.length === 0 ? (
            <Text style={styles.noDataText}>No income records in this period.</Text>
          ) : (
            incomeList.map((item, idx) => {
              const amountNum = parseFloat(item.total || '0') || 0;
              const cleanName = String(item.name || 'Income Account').replace(/&amp;/g, '&');

              return (
                <TouchableOpacity
                  key={`inc_${idx}`}
                  style={[
                    styles.accountRow,
                    idx < incomeList.length - 1 && styles.accountRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleAccountClick(item)}
                >
                  <View style={styles.accountRowLeft}>
                    <Text style={styles.accountTitle} numberOfLines={1}>
                      {cleanName}
                    </Text>
                    <Text style={styles.accountHint}>Tap for ledger detail ›</Text>
                  </View>
                  <Text style={[styles.accountAmount, { color: '#059669' }]}>
                    Rs. {Math.abs(amountNum).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 3. Expense Breakdown Section */}
        <View style={styles.listSectionCard}>
          <View style={[styles.listHeaderRow, { borderBottomColor: '#EF4444' }]}>
            <Text style={[styles.listSectionTitle, { color: '#DC2626' }]}>
              EXPENSE BREAKDOWN
            </Text>
            <Text style={[styles.listTotalText, { color: '#DC2626' }]}>
              Rs. {totalExpense.toLocaleString()}
            </Text>
          </View>

          {isIncomeLoading && expenseList.length === 0 ? (
            <View style={styles.listLoadingBox}>
              <ActivityIndicator size="small" color="#DC2626" />
            </View>
          ) : expenseList.length === 0 ? (
            <Text style={styles.noDataText}>No expense records in this period.</Text>
          ) : (
            expenseList.map((item, idx) => {
              const amountNum = parseFloat(item.total || '0') || 0;
              const cleanName = String(item.name || 'Expense Account').replace(/&amp;/g, '&');

              return (
                <TouchableOpacity
                  key={`exp_${idx}`}
                  style={[
                    styles.accountRow,
                    idx < expenseList.length - 1 && styles.accountRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleAccountClick(item)}
                >
                  <View style={styles.accountRowLeft}>
                    <Text style={styles.accountTitle} numberOfLines={1}>
                      {cleanName}
                    </Text>
                    <Text style={styles.accountHint}>Tap for ledger detail ›</Text>
                  </View>
                  <Text style={[styles.accountAmount, { color: '#DC2626' }]}>
                    Rs. {Math.abs(amountNum).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 4. Net Difference (Inc - Exp) Card */}
        <View style={styles.netDiffCard}>
          <View style={styles.netDiffLeft}>
            <Text style={styles.netDiffLabel}>DIFFERENCE (INC - EXP)</Text>
            <Text
              style={[
                styles.netDiffValue,
                netDifference >= 0 ? styles.diffPositive : styles.diffNegative,
              ]}
            >
              Rs. {Math.abs(netDifference).toLocaleString()}
              {netDifference < 0 ? ' (Loss)' : ' (Profit)'}
            </Text>
          </View>
          <View
            style={[
              styles.netDiffBadge,
              { backgroundColor: netDifference >= 0 ? '#ECFDF5' : '#FEF2F2' },
            ]}
          >
            <Text
              style={[
                styles.netDiffBadgeText,
                { color: netDifference >= 0 ? '#059669' : '#DC2626' },
              ]}
            >
              {netDifference >= 0 ? 'Surplus' : 'Deficit'}
            </Text>
          </View>
        </View>

        {/* 5. Financial Overview Header (Placed BELOW Income & Expense) */}
        <View style={styles.overviewHeaderRow}>
          <View style={styles.overviewHeaderLeft}>
            <Text style={styles.overviewHeaderTitle}>Financial Overview</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Up to date</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshIconBtn}
            onPress={loadAllData}
            activeOpacity={0.7}
          >
            <RefreshIcon size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* 6. Financial Overview 2-Column Cards Grid (8 Cards: Cash/Bank, Receivable, Payable, etc.) */}
        <View style={styles.statsGrid}>
          {statCards.map((card) => {
            const isClickable =
              card.type === 'Receivable' ||
              card.type === 'Payable' ||
              card.type === 'Cash/Bank' ||
              card.type === 'Inventory';

            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.statCard,
                  { borderColor: isClickable ? card.color + '40' : '#EFEBE6' },
                ]}
                activeOpacity={isClickable ? 0.75 : 1}
                onPress={() => isClickable && handleStatCardClick(card)}
              >
                {/* Icon Box */}
                <View style={[styles.iconBox, { backgroundColor: card.bgColor }]}>
                  {renderCardIcon(card.iconType, card.color)}
                </View>

                {/* Amount */}
                <Text style={styles.statValue} numberOfLines={1}>
                  Rs. {Math.abs(card.value).toLocaleString()}
                </Text>

                {/* Title */}
                <Text style={styles.statTitle}>{card.title}</Text>

                {/* Trend Row */}
                <View style={styles.trendRow}>
                  {card.trend.isPositive ? (
                    <TrendingUpIcon size={12} color="#059669" />
                  ) : (
                    <TrendingDownIcon size={12} color="#DC2626" />
                  )}
                  <Text
                    style={[
                      styles.trendText,
                      { color: card.trend.isPositive ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {card.trend.text}
                  </Text>
                </View>

                {/* Clickable indicator */}
                {isClickable ? (
                  <Text style={styles.clickHintText}>Tap for details ›</Text>
                ) : (
                  <View style={{ height: 14 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Date Picker Modal for From/To Date */}
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
  scrollContent: {
    paddingBottom: Spacing.xxl + 20,
  },
  filterCard: {
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
  filterInputsRow: {
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
  applyBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 40,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#EAE6E1',
    height: 40,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  listSectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1.5,
    marginBottom: Spacing.xs,
  },
  listSectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  listTotalText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  accountRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  accountRowLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  accountTitle: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  accountHint: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  accountAmount: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
  },
  listLoadingBox: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    paddingVertical: Spacing.md,
    textAlign: 'center',
  },
  netDiffCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#EFEBE6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netDiffLeft: {
    flex: 1,
  },
  netDiffLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  netDiffValue: {
    fontSize: Typography.fontSize.base + 1,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  diffPositive: {
    color: '#059669',
  },
  diffNegative: {
    color: '#DC2626',
  },
  netDiffBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadius.sm,
  },
  netDiffBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  overviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewHeaderTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: '#059669',
  },
  refreshIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEBE6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  clickHintText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 6,
  },
});
