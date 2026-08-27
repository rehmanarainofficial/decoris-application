import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants';
import {
  ScreenHeader,
  CalculatorIcon,
  PrinterIcon,
  TrashIcon,
  PlusBookingIcon,
  SearchIcon,
  WalletIcon,
  CustomToast,
} from '../components/common';

interface TransactionItem {
  id: string;
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  memo: string;
}

interface DailyExpenseScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx_1',
    date: '27-08-2026',
    debitAccount: 'Advances and Deposits',
    creditAccount: 'Bank Islami',
    amount: 500,
    memo: 'zxasxasxasxasx',
  },
  {
    id: 'tx_2',
    date: '27-08-2026',
    debitAccount: 'Office Maintenance',
    creditAccount: 'Cash in Hand',
    amount: 12500,
    memo: 'Stage flowers & decor setup materials',
  },
  {
    id: 'tx_3',
    date: '26-08-2026',
    debitAccount: 'Vendor Payment',
    creditAccount: 'Meezan Bank',
    amount: 2500,
    memo: 'Generator diesel refilling',
  },
];

export const DailyExpenseScreen: React.FC<DailyExpenseScreenProps> = ({
  onBack,
  onHome,
}) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>(
    INITIAL_TRANSACTIONS,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  // Modal Form State
  const [newDate, setNewDate] = useState('27-08-2026');
  const [newDebitAccount, setNewDebitAccount] = useState('Advances and Deposits');
  const [newCreditAccount, setNewCreditAccount] = useState('Bank Islami');
  const [newAmount, setNewAmount] = useState('');
  const [newMemo, setNewMemo] = useState('');

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handleAddTransaction = () => {
    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) <= 0) {
      triggerToast('Please enter a valid transaction amount.', 'error');
      return;
    }

    const newItem: TransactionItem = {
      id: `tx_${Date.now()}`,
      date: newDate.trim() || '27-08-2026',
      debitAccount: newDebitAccount.trim() || 'General Expense',
      creditAccount: newCreditAccount.trim() || 'Cash in Hand',
      amount: Number(newAmount),
      memo: newMemo.trim() || '-',
    };

    setTransactions([newItem, ...transactions]);
    setIsModalVisible(false);

    // Reset Form
    setNewAmount('');
    setNewMemo('');
    triggerToast('Transaction added successfully!');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((item) => item.id !== id));
    triggerToast('Transaction deleted successfully.');
  };

  const handlePrintTransaction = (item: TransactionItem) => {
    triggerToast(
      `Printing Receipt for ${item.debitAccount} (Rs. ${item.amount.toLocaleString()})...`,
    );
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.debitAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.creditAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.date.includes(searchQuery),
  );

  // Total Amounts
  const totalAmount = transactions.reduce((acc, item) => acc + item.amount, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Regal Brand Screen Header with Gold Crown Emblem & Flourish */}
      <ScreenHeader
        title="Daily Expenses"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderLeftColor: Colors.primary }]}>
            <View style={styles.kpiHeader}>
              <WalletIcon size={18} color={Colors.primary} />
              <Text style={styles.kpiTitle}>Total Expenses</Text>
            </View>
            <Text style={styles.kpiValue}>Rs. {totalAmount.toLocaleString()}</Text>
            <Text style={styles.kpiSub}>Today's Transactions</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: '#28a745' }]}>
            <View style={styles.kpiHeader}>
              <CalculatorIcon size={18} color="#28a745" />
              <Text style={styles.kpiTitle}>Total Entries</Text>
            </View>
            <Text style={[styles.kpiValue, { color: '#28a745' }]}>
              {transactions.length}
            </Text>
            <Text style={styles.kpiSub}>Recorded Rows</Text>
          </View>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search narration, account or date..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* DAILY CASH TRANSACTION Card matching user image */}
        <View style={styles.mainCard}>
          {/* Main Card Deep Burgundy Banner */}
          <View style={styles.cardHeaderBanner}>
            <View style={styles.bannerLeft}>
              <CalculatorIcon size={22} color="#FFFFFF" />
              <Text style={styles.bannerTitle}>DAILY CASH TRANSACTION</Text>
            </View>

            <View style={styles.bannerRight}>
              <TouchableOpacity
                style={styles.addRowButton}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.8}
              >
                <PlusBookingIcon size={14} color="#FFFFFF" />
                <Text style={styles.addRowText}>+ Add Row</Text>
              </TouchableOpacity>

              <View style={styles.datePill}>
                <Text style={styles.datePillText}>Thursday, 27 August 2026</Text>
              </View>
            </View>
          </View>

          {/* Table Container with Horizontal Scroll for Mobile Precision */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInnerContainer}>
              {/* Table Header Row */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { width: 90 }]}>DATE</Text>
                <Text style={[styles.tableHeaderCell, { width: 150 }]}>
                  DEBIT ACCOUNT
                </Text>
                <Text style={[styles.tableHeaderCell, { width: 130 }]}>
                  CREDIT ACCOUNT
                </Text>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: 90, textAlign: 'right' },
                  ]}
                >
                  AMOUNT
                </Text>
                <Text style={[styles.tableHeaderCell, { width: 170, paddingLeft: 12 }]}>
                  MEMO / NARRATION
                </Text>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: 80, textAlign: 'center' },
                  ]}
                >
                  PRINT
                </Text>
              </View>

              {/* Account Group Row (Cash in Hand summary row) */}
              <View style={styles.accountGroupRow}>
                <Text style={styles.accountGroupText}>Cash in Hand</Text>
              </View>

              {/* Data Rows */}
              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No cash transactions found.</Text>
                </View>
              ) : (
                filteredTransactions.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.tableDataRow,
                      index % 2 === 1 && styles.tableDataRowAlt,
                    ]}
                  >
                    <Text style={[styles.tableCellText, { width: 90 }]}>
                      {item.date}
                    </Text>
                    <Text
                      style={[
                        styles.tableCellText,
                        { width: 150, fontWeight: '600', color: Colors.textPrimary },
                      ]}
                      numberOfLines={2}
                    >
                      {item.debitAccount}
                    </Text>
                    <Text style={[styles.tableCellText, { width: 130 }]} numberOfLines={2}>
                      {item.creditAccount}
                    </Text>
                    <Text style={[styles.amountCell, { width: 90 }]}>
                      {item.amount.toLocaleString()}
                    </Text>
                    <Text
                      style={[styles.tableCellText, { width: 170, paddingLeft: 12 }]}
                      numberOfLines={2}
                    >
                      {item.memo}
                    </Text>

                    {/* Actions (Print & Delete) */}
                    <View style={[styles.actionCellContainer, { width: 80 }]}>
                      <TouchableOpacity
                        style={styles.iconActionButton}
                        onPress={() => handlePrintTransaction(item)}
                        activeOpacity={0.7}
                      >
                        <PrinterIcon size={18} color="#1a365d" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconActionButton}
                        onPress={() => handleDeleteTransaction(item.id)}
                        activeOpacity={0.7}
                      >
                        <TrashIcon size={16} color={Colors.accentRed} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Cash Transaction</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="DD-MM-YYYY"
              />

              <Text style={styles.inputLabel}>Debit Account</Text>
              <TextInput
                style={styles.modalInput}
                value={newDebitAccount}
                onChangeText={setNewDebitAccount}
                placeholder="e.g. Advances and Deposits"
              />

              <Text style={styles.inputLabel}>Credit Account</Text>
              <TextInput
                style={styles.modalInput}
                value={newCreditAccount}
                onChangeText={setNewCreditAccount}
                placeholder="e.g. Bank Islami / Cash in Hand"
              />

              <Text style={styles.inputLabel}>Amount (PKR)</Text>
              <TextInput
                style={styles.modalInput}
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder="e.g. 500"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Memo / Narration</Text>
              <TextInput
                style={[styles.modalInput, { height: 70 }]}
                value={newMemo}
                onChangeText={setNewMemo}
                placeholder="Description of transaction"
                multiline
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddTransaction}
              >
                <Text style={styles.saveButtonText}>Save Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Toast Notification */}
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
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
    paddingBottom: Spacing.xxl,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 0.48,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: Spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    marginLeft: 6,
  },
  kpiValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 2,
  },
  kpiSub: {
    fontSize: 11,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderBanner: {
    backgroundColor: Colors.primary, // Deep burgundy #5B141C
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.8,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addRowButton: {
    backgroundColor: '#1e7e34', // Green button matching user screenshot
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  addRowText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  datePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  datePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  tableInnerContainer: {
    minWidth: 710,
  },
  tableHeaderRow: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  accountGroupRow: {
    backgroundColor: '#FAF8F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  accountGroupText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    paddingLeft: 90,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
    backgroundColor: '#FFFFFF',
  },
  tableDataRowAlt: {
    backgroundColor: '#FAF9F6',
  },
  tableCellText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  amountCell: {
    textAlign: 'right',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
    color: '#1a365d', // Deep blue bold text for amount matching screenshot
  },
  actionCellContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActionButton: {
    padding: 6,
    marginHorizontal: 4,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: Spacing.lg,
    maxHeight: 380,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    backgroundColor: '#FAF8F5',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: '#FAF8F5',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
