import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants';
import {
  ScreenHeader,
  TrashIcon,
  CalendarIcon,
  WalletIcon,
  FileTextIcon,
  CustomDropdownModal,
  CalendarPickerModal,
  CustomToast,
  PlusIcon,
} from '../../components/common';
import { useAppSelector } from '../../hooks';
import {
  useGetLocalPurchaseAccountsQuery,
  useGetLocalPurchasePaymentAccountsQuery,
  usePostLocalPurchaseReceiptMutation,
  usePostLocalPurchasePaymentMutation,
} from '../../api/expenseApi';

interface FactoryItem {
  id: string;
  type: string;
  typeValue: string;
  description: string;
  amount: string;
}

interface DailyExpenseScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const DailyExpenseScreen: React.FC<DailyExpenseScreenProps> = ({
  onBack,
  onHome,
}) => {
  const userProfile = useAppSelector((state) => state.user.profile);
  const userId = userProfile?.id || userProfile?.user_id || '1';

  // Main Tab: 'receipt' | 'payment'
  const [mainTab, setMainTab] = useState<'receipt' | 'payment'>('receipt');

  // Common Date State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // RTK Queries
  const { data: accountsData, isLoading: isAccountsLoading } = useGetLocalPurchaseAccountsQuery();
  const { data: expenseAccountsData, isLoading: isExpenseAccountsLoading } = useGetLocalPurchasePaymentAccountsQuery();

  // Mutations
  const [postReceipt, { isLoading: isReceiptPosting }] = usePostLocalPurchaseReceiptMutation();
  const [postPayment, { isLoading: isPaymentPosting }] = usePostLocalPurchasePaymentMutation();

  const isSubmitting = isReceiptPosting || isPaymentPosting;

  // Dropdown options
  const receiptAccountOptions = (accountsData?.data || []).map((acc) => ({
    label: (acc.account_name || '').replace(/&amp;/g, '&'),
    value: String(acc.account_code),
  }));

  const expenseAccountOptions = (expenseAccountsData?.data || []).map((acc) => ({
    label: (acc.account_name || '').replace(/&amp;/g, '&'),
    value: String(acc.account_code),
  }));

  // Receipt Form State
  const [receiptFrom, setReceiptFrom] = useState<string | null>(null);
  const [receiptAmount, setReceiptAmount] = useState<string>('');

  // Payment (Factory Expenses) Form State
  const [factoryItems, setFactoryItems] = useState<FactoryItem[]>([]);
  const [factoryType, setFactoryType] = useState<string | null>(null);
  const [factoryDescription, setFactoryDescription] = useState<string>('');
  const [factoryAmount, setFactoryAmount] = useState<string>('');

  // Active Dropdown Modal State
  const [dropdownModalType, setDropdownModalType] = useState<
    'receipt_account' | 'factory_type' | null
  >(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Add Item to Factory Expenses
  const handleAddFactoryItem = () => {
    if (!factoryType) {
      showToast('Please select Expense Type', 'error');
      return;
    }
    const amtNum = parseFloat(factoryAmount);
    if (!factoryAmount.trim() || isNaN(amtNum) || amtNum <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const typeLabel =
      expenseAccountOptions.find((o) => o.value === factoryType)?.label || factoryType;

    const newItem: FactoryItem = {
      id: Date.now().toString(),
      type: typeLabel,
      typeValue: factoryType,
      description: factoryDescription.trim(),
      amount: factoryAmount.trim(),
    };

    setFactoryItems((prev) => [...prev, newItem]);
    setFactoryType(null);
    setFactoryDescription('');
    setFactoryAmount('');
  };

  const removeFactoryItem = (id: string) => {
    setFactoryItems((prev) => prev.filter((it) => it.id !== id));
  };

  const calculateTotal = (items: { amount: string }[]) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const resetForm = () => {
    setReceiptFrom(null);
    setReceiptAmount('');
    setFactoryItems([]);
    setFactoryType(null);
    setFactoryDescription('');
    setFactoryAmount('');
  };

  const handleSubmit = async () => {
    if (mainTab === 'receipt') {
      if (!receiptFrom) {
        showToast('Please select Receipt From account', 'error');
        return;
      }
      const amtNum = parseFloat(receiptAmount);
      if (!receiptAmount.trim() || isNaN(amtNum) || amtNum <= 0) {
        showToast('Please enter a valid receipt amount', 'error');
        return;
      }

      try {
        const receiptDetail = [
          {
            account_code: receiptFrom,
            amount: receiptAmount.trim(),
          },
        ];

        const payload = {
          trans_date: selectedDate,
          amount: receiptAmount.trim(),
          user_id: userId,
          receipt_detail: JSON.stringify(receiptDetail),
        };

        const res = await postReceipt(payload).unwrap();
        if (
          res.status === true ||
          res.status === 'true' ||
          res.message?.toLowerCase().includes('success')
        ) {
          showToast('Receipt submitted successfully!', 'success');
          resetForm();
        } else {
          showToast(res.message || 'Server error while submitting receipt', 'error');
        }
      } catch (err: any) {
        console.error('Receipt Submission Error:', err);
        showToast(err?.data?.message || 'Network error while submitting receipt', 'error');
      }
    } else {
      // Payment (Factory Expenses)
      if (factoryItems.length === 0) {
        showToast('Please add at least one expense item to table', 'error');
        return;
      }

      const totalAmount = calculateTotal(factoryItems);
      const expenseDetail = factoryItems.map((item) => ({
        account_code: item.typeValue,
        amount: parseFloat(item.amount) || 0,
        line_memo: item.description || '',
      }));

      try {
        const payload = {
          trans_date: selectedDate,
          amount: totalAmount.toString(),
          user_id: userId,
          expense_detail: JSON.stringify(expenseDetail),
        };

        const res = await postPayment(payload).unwrap();
        if (
          res.status === true ||
          res.status === 'true' ||
          res.message?.toLowerCase().includes('success')
        ) {
          showToast('Expenses submitted successfully!', 'success');
          resetForm();
        } else {
          showToast(res.message || 'Server error while submitting payment', 'error');
        }
      } catch (err: any) {
        console.error('Payment Error:', err);
        showToast(err?.data?.message || 'Network error while submitting payment', 'error');
      }
    }
  };

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
        title="Daily Expenses"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      {/* Main Tab Bar (Receipt vs Payment) */}
      <View style={styles.mainTabContainer}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'receipt' && styles.mainTabActive]}
          onPress={() => setMainTab('receipt')}
          activeOpacity={0.8}
        >
          <FileTextIcon
            size={16}
            color={mainTab === 'receipt' ? '#FFFFFF' : Colors.textSecondary}
          />
          <Text
            style={[
              styles.mainTabText,
              mainTab === 'receipt' && styles.mainTabTextActive,
            ]}
          >
            Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'payment' && styles.mainTabActive]}
          onPress={() => setMainTab('payment')}
          activeOpacity={0.8}
        >
          <WalletIcon
            size={16}
            color={mainTab === 'payment' ? '#FFFFFF' : Colors.textSecondary}
          />
          <Text
            style={[
              styles.mainTabText,
              mainTab === 'payment' && styles.mainTabTextActive,
            ]}
          >
            Payment
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date Selector Card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setIsDatePickerOpen(true)}
            activeOpacity={0.8}
          >
            <CalendarIcon size={18} color={Colors.primary} />
            <Text style={styles.datePickerText}>{selectedDate}</Text>
          </TouchableOpacity>
        </View>

        {mainTab === 'receipt' ? (
          /* RECEIPT FORM */
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Receipt Details</Text>
            </View>

            {/* Receipt From Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Receipt From</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  !receiptFrom && styles.dropdownButtonEmpty,
                ]}
                onPress={() => setDropdownModalType('receipt_account')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !receiptFrom && styles.dropdownButtonPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {receiptFrom
                    ? receiptAccountOptions.find((o) => o.value === receiptFrom)?.label ||
                      'Selected Account'
                    : isAccountsLoading
                    ? 'Loading accounts...'
                    : 'Select Receipt From ▾'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Amount (Rs)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={receiptAmount}
                onChangeText={setReceiptAmount}
              />
            </View>
          </View>
        ) : (
          /* PAYMENT (EXPENSES) FORM */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expense Details</Text>

            {/* Type Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Expense Type</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  !factoryType && styles.dropdownButtonEmpty,
                ]}
                onPress={() => setDropdownModalType('factory_type')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !factoryType && styles.dropdownButtonPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {factoryType
                    ? expenseAccountOptions.find((o) => o.value === factoryType)?.label ||
                      'Selected Type'
                    : isExpenseAccountsLoading
                    ? 'Loading types...'
                    : 'Select Type ▾'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter description..."
                placeholderTextColor={Colors.textMuted}
                value={factoryDescription}
                onChangeText={setFactoryDescription}
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Amount (Rs)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={factoryAmount}
                onChangeText={setFactoryAmount}
              />
            </View>

            {/* Add Item Button */}
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={handleAddFactoryItem}
              activeOpacity={0.8}
            >
              <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addItemButtonText}>Add to Table</Text>
            </TouchableOpacity>

            {/* Factory Items Table */}
            {factoryItems.length > 0 && (
              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableHeadCell, { flex: 0.5 }]}>#</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>Type</Text>
                  <Text style={[styles.tableHeadCell, { flex: 2 }]}>Description</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1.2, textAlign: 'right' }]}>
                    Amount
                  </Text>
                  <Text style={[styles.tableHeadCell, { flex: 0.6, textAlign: 'center' }]}>
                    Action
                  </Text>
                </View>

                {factoryItems.map((item, index) => (
                  <View key={item.id} style={styles.tableBodyRow}>
                    <Text style={[styles.tableBodyCell, { flex: 0.5 }]}>{index + 1}</Text>
                    <Text style={[styles.tableBodyCell, { flex: 1.5, fontWeight: '600' }]} numberOfLines={1}>
                      {item.type}
                    </Text>
                    <Text style={[styles.tableBodyCell, { flex: 2 }]} numberOfLines={2}>
                      {item.description || '-'}
                    </Text>
                    <Text style={[styles.tableBodyCell, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>
                      Rs. {parseFloat(item.amount).toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={{ flex: 0.6, alignItems: 'center' }}
                      onPress={() => removeFactoryItem(item.id)}
                    >
                      <TrashIcon size={16} color={Colors.accentRed} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.tableTotalRow}>
                  <Text style={styles.tableTotalLabel}>Total Amount:</Text>
                  <Text style={styles.tableTotalValue}>
                    Rs. {calculateTotal(factoryItems).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      <CalendarPickerModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelectDateTime={(dateStr) => {
          setSelectedDate(dateStr);
          setIsDatePickerOpen(false);
        }}
      />

      {/* Dropdown Modals */}
      <CustomDropdownModal
        visible={dropdownModalType === 'receipt_account'}
        title="Select Receipt From"
        options={receiptAccountOptions}
        selectedValue={receiptFrom || undefined}
        onSelect={(val) => {
          setReceiptFrom(val);
          setDropdownModalType(null);
        }}
        onClose={() => setDropdownModalType(null)}
      />

      <CustomDropdownModal
        visible={dropdownModalType === 'factory_type'}
        title="Select Expense Type"
        options={expenseAccountOptions}
        selectedValue={factoryType || undefined}
        onSelect={(val) => {
          setFactoryType(val);
          setDropdownModalType(null);
        }}
        onClose={() => setDropdownModalType(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Spacing.borderRadius.sm,
    gap: 6,
  },
  mainTabActive: {
    backgroundColor: Colors.primary,
  },
  mainTabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  mainTabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: Spacing.sm + 4,
  },
  cardHeaderRow: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  datePickerButton: {
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
  datePickerText: {
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 2,
  },
  dropdownButton: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
    justifyContent: 'center',
  },
  dropdownButtonEmpty: {
    borderColor: '#E2E8F0',
  },
  dropdownButtonText: {
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dropdownButtonPlaceholder: {
    color: Colors.textMuted,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textPrimary,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: Spacing.borderRadius.sm,
    gap: 6,
    marginTop: Spacing.xs,
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#FFFFFF',
  },
  tableBodyCell: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
  },
  tableTotalLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  tableTotalValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: Spacing.xs,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
  },
});
