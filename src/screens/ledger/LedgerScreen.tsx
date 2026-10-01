import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants';
import {
  ScreenHeader,
  CalendarIcon,
  CustomDropdownModal,
  DatePickerModal,
  CustomToast,
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
  initialAccount?: string;
  initialPersonId?: string;
  initialAccountName?: string;
  initialFromDate?: string;
  initialToDate?: string;
  onBack?: () => void;
  onHome?: () => void;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  initialAccount,
  initialPersonId,
  initialAccountName,
  initialFromDate,
  initialToDate,
  onBack,
  onHome,
}) => {
  // Date range defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfYear = `${new Date().getFullYear()}-01-01`;

  const [selectedAccountCode, setSelectedAccountCode] = useState<string | null>(
    initialAccount || null
  );
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(
    initialPersonId || null
  );
  const [fromDate, setFromDate] = useState<string>(initialFromDate || firstDayOfYear);
  const [toDate, setToDate] = useState<string>(initialToDate || todayStr);

  // View style: Landscape Table vs Card View
  const [viewStyle, setViewStyle] = useState<'table' | 'cards'>('table');

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
  const { data: accountsData, isLoading: isAccountsLoading } = useGetGLAccountsQuery();
  const [getGLAccountInquiry, { isLoading: isInquiryLoading }] = useGetGLAccountInquiryMutation();

  const glAccountsList: GLAccountItem[] = accountsData?.data || [];
  const accountOptions = glAccountsList.map((acc) => ({
    label: `${acc.account_code} - ${acc.account_name}`,
    value: String(acc.account_code),
  }));

  const selectedAccount = glAccountsList.find(
    (acc) => String(acc.account_code) === String(selectedAccountCode)
  );

  const fetchLedgerData = useCallback(
    async (accountCode?: string, personId?: string, from?: string, to?: string) => {
      const accToUse = accountCode !== undefined ? accountCode : selectedAccountCode;
      const personToUse = personId !== undefined ? personId : selectedPersonId;
      if (!accToUse && !personToUse) {
        showToast('Please select a GL account or counterparty', 'error');
        return;
      }

      try {
        const payload: any = {
          account: accToUse || '',
          from_date: from || fromDate,
          to_date: to || toDate,
        };
        if (personToUse) {
          payload.person_id = personToUse;
        }

        console.log('====================================================');
        console.log('>>> [LedgerScreen] Calling ledger/gl_account_inquiry.php with:', payload);
        console.log('====================================================');

        const res = await getGLAccountInquiry(payload).unwrap();

        console.log('====================================================');
        console.log('<<< [LedgerScreen] Response Status:', res?.status);
        console.log('<<< [LedgerScreen] Opening Balance:', res?.opening);
        console.log('<<< [LedgerScreen] Transactions Count:', res?.data?.length);
        console.log('====================================================');

        if (res.status === 'true' || res.status === true) {
          const opening =
            res.opening !== undefined && res.opening !== null
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
    },
    [selectedAccountCode, selectedPersonId, fromDate, toDate, getGLAccountInquiry]
  );

  // Auto-fetch on initial load if navigated with an account or personId
  useEffect(() => {
    if (initialAccount || initialPersonId) {
      if (initialAccount) setSelectedAccountCode(initialAccount);
      if (initialPersonId) setSelectedPersonId(initialPersonId);
      const start = initialFromDate || fromDate;
      const end = initialToDate || toDate;
      if (initialFromDate) setFromDate(initialFromDate);
      if (initialToDate) setToDate(initialToDate);
      fetchLedgerData(initialAccount, initialPersonId, start, end);
    }
  }, [initialAccount, initialPersonId, initialFromDate, initialToDate]);

  // Handle Account Selection from dropdown
  const handleSelectAccount = (code: string) => {
    setSelectedAccountCode(code);
    setSelectedPersonId(null);
    setIsAccountModalOpen(false);
    fetchLedgerData(code, undefined, fromDate, toDate);
  };

  // Totals calculations
  let totalDebit = 0;
  let totalCredit = 0;
  transactions.forEach((tx) => {
    const amt = parseFloat(String(tx.amount)) || 0;
    if (amt >= 0) {
      totalDebit += amt;
    } else {
      totalCredit += Math.abs(amt);
    }
  });

  const closingBalance =
    runningBalances.length > 0
      ? runningBalances[runningBalances.length - 1]
      : openingBalance;

  const headerTitle =
    initialAccountName ||
    (selectedAccount ? selectedAccount.account_name : 'General Ledger');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title={headerTitle}
        onBackPress={onBack}
        onHomePress={onHome}
      />

      {toastVisible && (
        <CustomToast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* FILTER CARD */}
        <View style={styles.filterCard}>
          <Text style={styles.filterCardTitle}>FILTER PARAMETERS</Text>

          {/* Account Picker */}
          <View style={styles.filterRow}>
            <Text style={styles.fieldLabel}>GL Account</Text>
            <TouchableOpacity
              style={[
                styles.accountPickerBtn,
                !selectedAccountCode && styles.accountPickerBtnEmpty,
              ]}
              onPress={() => setIsAccountModalOpen(true)}
              activeOpacity={0.7}
            >
              <WalletIcon size={18} color={Colors.primary} />
              <Text
                style={[
                  styles.accountPickerText,
                  !selectedAccountCode && !selectedPersonId && styles.accountPickerPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedAccount
                  ? `${selectedAccount.account_code} - ${selectedAccount.account_name}`
                  : initialAccountName
                  ? `${selectedAccountCode ? `${selectedAccountCode} - ` : ''}${initialAccountName}`
                  : selectedAccountCode
                  ? `${selectedAccountCode}`
                  : selectedPersonId
                  ? `Counterparty #${selectedPersonId}`
                  : isAccountsLoading
                  ? 'Loading accounts...'
                  : 'Select an Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Range Row with Calendar Pickers */}
          <View style={styles.dateInputsRow}>
            {/* From Date Box */}
            <TouchableOpacity
              style={styles.dateBox}
              activeOpacity={0.75}
              onPress={() => setDatePickerType('from')}
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
              onPress={() => setDatePickerType('to')}
            >
              <CalendarIcon size={16} color={Colors.primary} />
              <View style={styles.dateTextWrapper}>
                <Text style={styles.dateLabel}>TO</Text>
                <Text style={styles.dateValueText}>{toDate}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Inquiry Button */}
          <TouchableOpacity
            style={[
              styles.inquiryBtn,
              isInquiryLoading && styles.inquiryBtnDisabled,
            ]}
            onPress={() => fetchLedgerData()}
            disabled={isInquiryLoading}
            activeOpacity={0.8}
          >
            {isInquiryLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.inquiryBtnText}>Run Inquiry</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SUMMARY BALANCE CARDS */}
        {(selectedAccountCode || selectedPersonId) && (
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

        {/* TRANSACTIONS SECTION WITH VIEW TOGGLE */}
        <View style={styles.transactionsHeaderRow}>
          <View style={styles.txHeaderLeft}>
            <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
            {transactions.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {transactions.length} record{transactions.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Landscape Table vs Cards Toggle */}
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewStyle === 'table' && styles.viewToggleBtnActive,
              ]}
              onPress={() => setViewStyle('table')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.viewToggleBtnText,
                  viewStyle === 'table' && styles.viewToggleBtnTextActive,
                ]}
              >
                Landscape Table
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewToggleBtn,
                viewStyle === 'cards' && styles.viewToggleBtnActive,
              ]}
              onPress={() => setViewStyle('cards')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.viewToggleBtnText,
                  viewStyle === 'cards' && styles.viewToggleBtnTextActive,
                ]}
              >
                Cards View
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isInquiryLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching ledger transactions...</Text>
          </View>
        ) : !selectedAccountCode && !selectedPersonId ? (
          <View style={styles.emptyBox}>
            <WalletIcon size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Account Selected</Text>
            <Text style={styles.emptySub}>
              Please select a GL account or counterparty to view ledger transactions.
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
        ) : viewStyle === 'table' ? (
          /* ======================================================== */
          /* LANDSCAPE TABLE VIEW (SIDE-BY-SIDE ALL COLUMNS SCROLLABLE) */
          /* ======================================================== */
          <View style={styles.tableCardContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.tableScrollContent}
            >
              <View style={styles.tableInner}>
                {/* Header Row */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thCell, { width: 95 }]}>Date</Text>
                  <Text style={[styles.thCell, { width: 85 }]}>Ref #</Text>
                  <Text style={[styles.thCell, { width: 140 }]}>Counter Party</Text>
                  <Text style={[styles.thCell, { width: 180 }]}>Memo / Details</Text>
                  <Text style={[styles.thCell, { width: 110, textAlign: 'right' }]}>
                    Debit (+)
                  </Text>
                  <Text style={[styles.thCell, { width: 110, textAlign: 'right' }]}>
                    Credit (-)
                  </Text>
                  <Text style={[styles.thCell, { width: 120, textAlign: 'right' }]}>
                    Balance
                  </Text>
                </View>

                {/* Data Rows */}
                {transactions.map((tx, idx) => {
                  const amtNum = parseFloat(String(tx.amount)) || 0;
                  const isDebit = amtNum >= 0;
                  const runningBal =
                    runningBalances[idx] !== undefined
                      ? runningBalances[idx]
                      : openingBalance;
                  const isEven = idx % 2 === 0;

                  return (
                    <View
                      key={`tbl_${tx.reference || idx}_${idx}`}
                      style={[
                        styles.tableDataRow,
                        isEven ? styles.rowEven : styles.rowOdd,
                      ]}
                    >
                      <Text style={[styles.tdCell, { width: 95 }]}>
                        {tx.doc_date || '-'}
                      </Text>
                      <Text style={[styles.tdCell, styles.refText, { width: 85 }]}>
                        {tx.reference || '-'}
                      </Text>
                      <Text style={[styles.tdCell, { width: 140 }]} numberOfLines={1}>
                        {tx.person_name || '-'}
                      </Text>
                      <Text style={[styles.tdCell, { width: 180 }]} numberOfLines={2}>
                        {tx.memo || '-'}
                      </Text>
                      <Text
                        style={[
                          styles.tdCell,
                          styles.debitCell,
                          { width: 110, textAlign: 'right' },
                        ]}
                      >
                        {isDebit ? `Rs. ${Math.abs(amtNum).toLocaleString()}` : '-'}
                      </Text>
                      <Text
                        style={[
                          styles.tdCell,
                          styles.creditCell,
                          { width: 110, textAlign: 'right' },
                        ]}
                      >
                        {!isDebit ? `Rs. ${Math.abs(amtNum).toLocaleString()}` : '-'}
                      </Text>
                      <Text
                        style={[
                          styles.tdCell,
                          styles.balCell,
                          { width: 120, textAlign: 'right' },
                        ]}
                      >
                        Rs. {Math.round(runningBal).toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ) : (
          /* ======================================================== */
          /* CARD VIEW                                                */
          /* ======================================================== */
          <View style={styles.cardsList}>
            {transactions.map((tx, idx) => {
              const amtNum = parseFloat(String(tx.amount)) || 0;
              const isDebit = amtNum >= 0;
              const runningBal =
                runningBalances[idx] !== undefined
                  ? runningBalances[idx]
                  : openingBalance;

              return (
                <View key={`${tx.reference || idx}_${idx}`} style={styles.txCard}>
                  {/* Card Top: Date, Ref Badge & Amount */}
                  <View style={styles.txCardTop}>
                    <View style={styles.txLeftHeader}>
                      <View
                        style={[
                          styles.txTypeDot,
                          isDebit ? styles.debitDot : styles.creditDot,
                        ]}
                      />
                      <Text style={styles.txDate}>{tx.doc_date || '-'}</Text>
                      {tx.reference ? (
                        <View style={styles.refBadge}>
                          <Text style={styles.refBadgeText}>
                            Ref: #{tx.reference}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Transaction Amount */}
                    <View style={styles.txAmountWrapper}>
                      <Text
                        style={[
                          styles.txAmount,
                          isDebit ? styles.debitColor : styles.creditColor,
                        ]}
                      >
                        {isDebit ? '+' : '-'}Rs. {Math.abs(amtNum).toLocaleString()}
                      </Text>
                      <View
                        style={[
                          styles.txTypePill,
                          isDebit ? styles.debitPill : styles.creditPill,
                        ]}
                      >
                        <Text
                          style={[
                            styles.txTypePillText,
                            isDebit ? styles.debitPillText : styles.creditPillText,
                          ]}
                        >
                          {isDebit ? 'DEBIT' : 'CREDIT'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Card Middle: Memo / Description */}
                  <Text style={styles.txMemo} numberOfLines={3}>
                    {tx.memo || 'General Transaction'}
                  </Text>

                  {/* Card Bottom: Person & Running Balance */}
                  <View style={styles.txCardBottom}>
                    <Text style={styles.txPerson} numberOfLines={1}>
                      {tx.person_name ? `Counter: ${tx.person_name}` : ''}
                    </Text>

                    <Text style={styles.txRunningBal}>
                      Bal:{' '}
                      <Text style={styles.runningBalBold}>
                        Rs. {Math.round(runningBal).toLocaleString()}
                      </Text>
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

      {/* Date Picker Modal with Year & Month Selection */}
      <DatePickerModal
        visible={datePickerType !== null}
        title={datePickerType === 'from' ? 'Select From Date' : 'Select To Date'}
        selectedDate={datePickerType === 'from' ? fromDate : toDate}
        onClose={() => setDatePickerType(null)}
        onSelectDate={(dateStr) => {
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
    paddingBottom: Spacing.xxl + 30,
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
  filterCardTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
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
    height: 44,
    gap: Spacing.sm,
  },
  accountPickerBtnEmpty: {
    borderColor: '#E2E8F0',
  },
  accountPickerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  accountPickerPlaceholder: {
    color: Colors.textMuted,
    fontWeight: 'normal',
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    height: 44,
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  inquiryBtn: {
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: Spacing.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  inquiryBtnDisabled: {
    opacity: 0.6,
  },
  inquiryBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryContainer: {
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  closingCard: {
    backgroundColor: '#FAF8F5',
    borderColor: Colors.primary,
  },
  summaryCardLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  closingCardLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  closingCardValue: {
    fontSize: Typography.fontSize.base + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  debitColor: {
    color: '#059669',
  },
  creditColor: {
    color: '#DC2626',
  },
  transactionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  txHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3EFEA',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  viewToggleBtnText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  viewToggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
  },
  centerBox: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptyBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Landscape Table Styles
  tableCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableScrollContent: {
    paddingVertical: 0,
  },
  tableInner: {
    minWidth: 840,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F2',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E8E4DF',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  thCell: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    paddingHorizontal: 6,
    letterSpacing: 0.3,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: '#FAF8F5',
  },
  tdCell: {
    fontSize: 11,
    color: Colors.textPrimary,
    paddingHorizontal: 6,
  },
  refText: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  debitCell: {
    fontWeight: Typography.fontWeight.bold,
    color: '#059669',
  },
  creditCell: {
    fontWeight: Typography.fontWeight.bold,
    color: '#DC2626',
  },
  balCell: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  // Card View Styles
  cardsList: {
    gap: Spacing.sm,
  },
  txCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  txCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  txLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  debitDot: {
    backgroundColor: '#059669',
  },
  creditDot: {
    backgroundColor: '#DC2626',
  },
  txDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  refBadge: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  txAmountWrapper: {
    alignItems: 'flex-end',
    gap: 2,
  },
  txAmount: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.bold,
  },
  txTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  debitPill: {
    backgroundColor: '#ECFDF5',
  },
  creditPill: {
    backgroundColor: '#FEF2F2',
  },
  txTypePillText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
  },
  debitPillText: {
    color: '#059669',
  },
  creditPillText: {
    color: '#DC2626',
  },
  txMemo: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: Spacing.xs + 2,
  },
  txCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F5F2ED',
  },
  txPerson: {
    fontSize: 10,
    color: Colors.textMuted,
    flex: 1,
  },
  txRunningBal: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  runningBalBold: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
});
