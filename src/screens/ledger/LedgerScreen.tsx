import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants';
import {
  ScreenHeader,
  CalendarIcon,
  SearchIcon,
  CustomDropdownModal,
  CalendarPickerModal,
  CustomToast,
  RefreshIcon,
  FileTextIcon,
  WalletIcon,
} from '../../components/common';
import {
  useGetGLAccountsQuery,
  useGetGLAccountInquiryMutation,
  GLAccountItem,
  GLTransactionItem,
} from '../../api/ledgerApi';

interface LedgerScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  onBack,
  onHome,
}) => {
  // Date range defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfYear = `${new Date().getFullYear()}-01-01`;

  const [selectedAccountCode, setSelectedAccountCode] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>(firstDayOfYear);
  const [toDate, setToDate] = useState<string>(todayStr);

  // Date picker modal state
  const [datePickerType, setDatePickerType] = useState<'from' | 'to' | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Inquiry result state
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<GLTransactionItem[]>([]);
  const [runningBalances, setRunningBalances] = useState<number[]>([]);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Queries & Mutations
  const { data: accountsData, isLoading: isAccountsLoading, refetch: refetchAccounts } = useGetGLAccountsQuery();
  const [getGLAccountInquiry, { isLoading: isInquiryLoading }] = useGetGLAccountInquiryMutation();

  const glAccountsList: GLAccountItem[] = accountsData?.data || [];
  const accountOptions = glAccountsList.map((acc) => ({
    label: `${acc.account_code} - ${acc.account_name}`,
    value: String(acc.account_code),
  }));

  const selectedAccount = glAccountsList.find(
    (acc) => String(acc.account_code) === String(selectedAccountCode)
  );

  const fetchLedgerData = async (accountCode?: string) => {
    const accToUse = accountCode || selectedAccountCode;
    if (!accToUse) {
      showToast('Please select a GL account', 'error');
      return;
    }

    try {
      const payload = {
        account: accToUse,
        from_date: fromDate,
        to_date: toDate,
      };

      console.log('Fetching GL Account Inquiry:', payload);
      const res = await getGLAccountInquiry(payload).unwrap();

      if (res.status === 'true' || res.status === true) {
        const opening = res.opening !== undefined && res.opening !== null
          ? parseFloat(String(res.opening))
          : 0;
        setOpeningBalance(opening);

        const txList = Array.isArray(res.data) ? res.data : [];
        setTransactions(txList);

        // Calculate running balances for each transaction
        let currentBal = opening;
        const balances: number[] = [];
        txList.forEach((tx) => {
          const amt = parseFloat(String(tx.amount)) || 0;
          currentBal += amt;
          balances.push(currentBal);
        });
        setRunningBalances(balances);
      } else {
        setTransactions([]);
        setOpeningBalance(0);
        setRunningBalances([]);
        showToast('No ledger records returned', 'error');
      }
    } catch (err: any) {
      console.error('GL Inquiry Error:', err);
      showToast(err?.data?.message || 'Error fetching ledger transactions', 'error');
      setTransactions([]);
      setOpeningBalance(0);
      setRunningBalances([]);
    }
  };

  // Auto-fetch when account is chosen
  const handleSelectAccount = (code: string) => {
    setSelectedAccountCode(code);
    setIsAccountModalOpen(false);
    fetchLedgerData(code);
  };

  // Total debits, credits, closing balance
  let totalDebit = 0;
  let totalCredit = 0;
  transactions.forEach((tx) => {
    const amt = parseFloat(String(tx.amount)) || 0;
    if (amt > 0) {
      totalDebit += amt;
    } else {
      totalCredit += Math.abs(amt);
    }
  });

  const closingBalance = openingBalance + totalDebit - totalCredit;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <ScreenHeader
        title="General Ledger"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* FILTER CARD */}
        <View style={styles.filterCard}>
          {/* Row 1: Account Dropdown */}
          <View style={styles.filterRow}>
            <Text style={styles.fieldLabel}>Select Account</Text>
            <TouchableOpacity
              style={[
                styles.accountPickerBtn,
                !selectedAccountCode && styles.accountPickerBtnEmpty,
              ]}
              onPress={() => setIsAccountModalOpen(true)}
              activeOpacity={0.8}
            >
              <FileTextIcon size={18} color={Colors.primary} />
              <Text
                style={[
                  styles.accountPickerText,
                  !selectedAccountCode && styles.accountPickerPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedAccount
                  ? `${selectedAccount.account_code} - ${selectedAccount.account_name}`
                  : isAccountsLoading
                  ? 'Loading accounts...'
                  : 'Select GL Account ▾'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Date Filters (From Date & To Date) */}
          <View style={styles.dateFilterRow}>
            {/* From Date */}
            <View style={styles.dateCol}>
              <Text style={styles.fieldLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setDatePickerType('from')}
                activeOpacity={0.8}
              >
                <CalendarIcon size={16} color={Colors.primary} />
                <Text style={styles.dateText}>{fromDate}</Text>
              </TouchableOpacity>
            </View>

            {/* To Date */}
            <View style={styles.dateCol}>
              <Text style={styles.fieldLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setDatePickerType('to')}
                activeOpacity={0.8}
              >
                <CalendarIcon size={16} color={Colors.primary} />
                <Text style={styles.dateText}>{toDate}</Text>
              </TouchableOpacity>
            </View>

            {/* Refresh/Search button */}
            <TouchableOpacity
              style={[styles.searchActionBtn, isInquiryLoading && styles.searchActionBtnDisabled]}
              onPress={() => fetchLedgerData()}
              disabled={isInquiryLoading}
              activeOpacity={0.8}
            >
              {isInquiryLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <SearchIcon size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* FINANCIAL SUMMARY CARDS */}
        {selectedAccountCode && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              {/* Opening Balance */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Opening Balance</Text>
                <Text style={styles.summaryCardValue}>
                  Rs. {Math.round(openingBalance).toLocaleString()}
                </Text>
              </View>

              {/* Total Debit (In) */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Total Debit (+)</Text>
                <Text style={[styles.summaryCardValue, styles.debitColor]}>
                  Rs. {Math.round(totalDebit).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              {/* Total Credit (Out) */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Total Credit (-)</Text>
                <Text style={[styles.summaryCardValue, styles.creditColor]}>
                  Rs. {Math.round(totalCredit).toLocaleString()}
                </Text>
              </View>

              {/* Closing Balance */}
              <View style={[styles.summaryCard, styles.closingCard]}>
                <Text style={styles.closingCardLabel}>Closing Balance</Text>
                <Text style={styles.closingCardValue}>
                  Rs. {Math.round(closingBalance).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* TRANSACTIONS LIST (BANK STYLE CARDS) */}
        <View style={styles.transactionsHeaderRow}>
          <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
          {transactions.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{transactions.length} record{transactions.length !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>

        {isInquiryLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching ledger transactions...</Text>
          </View>
        ) : !selectedAccountCode ? (
          <View style={styles.emptyBox}>
            <WalletIcon size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Account Selected</Text>
            <Text style={styles.emptySub}>
              Please select a GL account from the dropdown above to view ledger transactions.
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <FileTextIcon size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySub}>
              There are no transactions recorded for this account between {fromDate} and {toDate}.
            </Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {transactions.map((tx, idx) => {
              const amtNum = parseFloat(String(tx.amount)) || 0;
              const isDebit = amtNum >= 0;
              const runningBal = runningBalances[idx] !== undefined
                ? runningBalances[idx]
                : openingBalance;

              return (
                <View key={`${tx.reference || idx}_${idx}`} style={styles.txCard}>
                  {/* Card Top: Date, Ref Badge & Amount */}
                  <View style={styles.txCardTop}>
                    <View style={styles.txLeftHeader}>
                      <View style={[styles.txTypeDot, isDebit ? styles.debitDot : styles.creditDot]} />
                      <Text style={styles.txDate}>{tx.doc_date || '-'}</Text>
                      {tx.reference ? (
                        <View style={styles.refBadge}>
                          <Text style={styles.refBadgeText}>Ref: #{tx.reference}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Transaction Amount */}
                    <View style={styles.txAmountWrapper}>
                      <Text style={[styles.txAmount, isDebit ? styles.debitColor : styles.creditColor]}>
                        {isDebit ? '+' : '-'}Rs. {Math.abs(amtNum).toLocaleString()}
                      </Text>
                      <View style={[styles.txTypePill, isDebit ? styles.debitPill : styles.creditPill]}>
                        <Text style={[styles.txTypePillText, isDebit ? styles.debitPillText : styles.creditPillText]}>
                          {isDebit ? 'DEBIT' : 'CREDIT'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Card Middle: Memo / Description */}
                  <Text style={styles.txMemo} numberOfLines={3}>
                    {tx.memo || 'General Transaction'}
                  </Text>

                  {/* Card Bottom: Person / Counter Party & Running Balance */}
                  <View style={styles.txCardBottom}>
                    <Text style={styles.txPerson} numberOfLines={1}>
                      {tx.person_name ? `Counter: ${tx.person_name}` : ''}
                    </Text>

                    <Text style={styles.txRunningBal}>
                      Bal: <Text style={styles.runningBalBold}>Rs. {Math.round(runningBal).toLocaleString()}</Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Account Selector Modal */}
      <CustomDropdownModal
        visible={isAccountModalOpen}
        title="Select GL Account"
        options={accountOptions}
        selectedValue={selectedAccountCode || undefined}
        onSelect={handleSelectAccount}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Date Picker Modal */}
      <CalendarPickerModal
        visible={datePickerType !== null}
        onClose={() => setDatePickerType(null)}
        onSelectDateTime={(dateStr) => {
          if (datePickerType === 'from') {
            setFromDate(dateStr);
          } else if (datePickerType === 'to') {
            setToDate(dateStr);
          }
          setDatePickerType(null);
        }}
      />
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
    paddingBottom: Spacing.xxl + 20,
    gap: Spacing.md,
  },
  filterCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: Spacing.sm + 2,
  },
  filterRow: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  accountPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
    gap: Spacing.sm,
  },
  accountPickerBtnEmpty: {
    borderColor: '#E2E8F0',
  },
  accountPickerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  accountPickerPlaceholder: {
    color: Colors.textMuted,
    fontWeight: 'normal',
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  dateCol: {
    flex: 1,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: 10,
    height: 42,
    gap: 6,
  },
  dateText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  searchActionBtn: {
    width: 42,
    height: 42,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchActionBtnDisabled: {
    opacity: 0.6,
  },
  summaryContainer: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.sm,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
  },
  summaryCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryCardValue: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  debitColor: {
    color: '#10B981',
  },
  creditColor: {
    color: Colors.primary,
  },
  closingCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  closingCardLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 2,
  },
  closingCardValue: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  transactionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  countBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardsList: {
    gap: 10,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  txCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  txTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  debitDot: {
    backgroundColor: '#10B981',
  },
  creditDot: {
    backgroundColor: Colors.primary,
  },
  txDate: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  refBadge: {
    backgroundColor: '#F5EFE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  txAmountWrapper: {
    alignItems: 'flex-end',
    gap: 2,
  },
  txAmount: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: 'bold',
  },
  txTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  debitPill: {
    backgroundColor: '#D1FAE5',
  },
  creditPill: {
    backgroundColor: '#FEE2E2',
  },
  txTypePillText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  debitPillText: {
    color: '#065F46',
  },
  creditPillText: {
    color: Colors.primary,
  },
  txMemo: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    fontWeight: '500',
    lineHeight: 18,
  },
  txCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  txPerson: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  txRunningBal: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  runningBalBold: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  centerBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textMuted,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  emptySub: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
