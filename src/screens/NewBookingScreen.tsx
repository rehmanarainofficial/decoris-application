import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import {
  CustomDropdownModal,
  DropdownTrigger,
  CalendarPickerModal,
} from '../components/common';
import {
  UserOutlineIcon,
  CalendarIcon,
  TentativeOrdersIcon,
  TrashIcon,
  SaveIcon,
} from '../components/common/Icons';
import { Colors, Typography, Spacing } from '../constants';

interface ItemRow {
  id: string;
  detail: string;
  qty: string;
  rate: string;
}

interface NewBookingScreenProps {
  onBack: () => void;
  onHome: () => void;
  onSaveSuccess: (eventData: any) => void;
}

export const NewBookingScreen: React.FC<NewBookingScreenProps> = ({
  onBack,
  onHome,
  onSaveSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState('');

  const [salesman, setSalesman] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [advance, setAdvance] = useState('');
  const [discount, setDiscount] = useState('');

  const [isSalesmanModalOpen, setIsSalesmanModalOpen] = useState(false);
  const [isPaymentTermsModalOpen, setIsPaymentTermsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const salesmanOptions = ['Madiha Imtiaz', 'Ali Ahmed', 'Usman Khan', 'Tariq Hassan'];
  const paymentTermsOptions = ['50% Advance - 50% On Event', 'Full Advance', 'Net 15 Days'];

  const [items, setItems] = useState<ItemRow[]>([
    { id: '1', detail: '', qty: '', rate: '' },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), detail: '', qty: '', rate: '' },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ItemRow, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateGrandTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      const q = parseFloat(item.qty) || 0;
      const r = parseFloat(item.rate) || 0;
      return sum + q * r;
    }, 0);
    const adv = parseFloat(advance) || 0;
    const disc = parseFloat(discount) || 0;
    const grand = subtotal - adv - disc;
    return grand > 0 ? grand.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
  };

  const handleSelectDateTime = (dateStr: string, timeStr: string) => {
    setEventDate(dateStr);
    setEventTime(timeStr);
  };

  const handleSave = () => {
    const newEvent = {
      fCode: `BS-F-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName || 'Customer',
      contactNo: contactNo || '03000000000',
      dateTime: `${eventDate || '27/08/2026'} • ${eventTime || '02:35 PM'}`,
      venue: venue || 'Venue Name',
      guestCount: guestCount || '200',
      bookingManager: salesman || 'Madiha Imtiaz',
      specialNotes: 'Setup start from one day before',
      items,
      advance,
      discount,
      grandTotal: calculateGrandTotal(),
    };
    onSaveSuccess(newEvent);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Add New Event"
        onBackPress={onBack}
        onHomePress={onHome}
      />
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SECTION 1: CUSTOMER DETAILS (TOP SECTION) */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <UserOutlineIcon size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Customer Details</Text>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.columnHalf}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter customer name"
                  placeholderTextColor={Colors.textMuted}
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              <View style={styles.columnHalf}>
                <Text style={styles.fieldLabel}>Contact No.</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter contact number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  value={contactNo}
                  onChangeText={setContactNo}
                />
              </View>
            </View>
          </View>

          {/* SECTION 2: EVENT DETAILS (INTERACTIVE CALENDAR MODAL TRIGGER) */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <CalendarIcon size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Event Details</Text>
            </View>

            <View style={styles.fullWidthField}>
              <Text style={styles.fieldLabel}>Date & Time</Text>
              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => setIsCalendarModalOpen(true)}
                activeOpacity={0.8}
              >
                <View style={styles.dateInputHalf}>
                  <CalendarIcon size={16} color={Colors.primary} />
                  <Text
                    style={[
                      styles.dateTimeInputText,
                      !eventDate && styles.placeholderText,
                    ]}
                  >
                    {eventDate || 'dd/mm/yyyy'}
                  </Text>
                </View>
                <View style={styles.dateTimeDivider} />
                <View style={styles.dateInputHalf}>
                  <Text
                    style={[
                      styles.dateTimeInputText,
                      !eventTime && styles.placeholderText,
                    ]}
                  >
                    {eventTime || '--:-- --'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.columnHalf}>
                <Text style={styles.fieldLabel}>Venue</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter venue name"
                  placeholderTextColor={Colors.textMuted}
                  value={venue}
                  onChangeText={setVenue}
                />
              </View>

              <View style={styles.columnHalf}>
                <Text style={styles.fieldLabel}>Guest</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter number of guests"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={guestCount}
                  onChangeText={setGuestCount}
                />
              </View>
            </View>
          </View>

          {/* SECTION 3: ORDER DETAILS (SALESMAN & PAYMENT TERMS) */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <TentativeOrdersIcon size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Order Details</Text>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.columnHalf}>
                <DropdownTrigger
                  label="Salesman"
                  value={salesman}
                  placeholder="Select salesman"
                  onPress={() => setIsSalesmanModalOpen(true)}
                />
              </View>

              <View style={styles.columnHalf}>
                <DropdownTrigger
                  label="Payment Terms"
                  value={paymentTerms}
                  placeholder="Select payment terms"
                  onPress={() => setIsPaymentTermsModalOpen(true)}
                />
              </View>
            </View>
          </View>

          {/* SECTION 4: ITEMS / REQUIREMENTS TABLE */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <TentativeOrdersIcon size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Items / Requirements</Text>
            </View>

            {/* Items Table */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeadCell, { flex: 2.2 }]}>R Detail</Text>
                <Text style={[styles.tableHeadCell, { flex: 1 }]}>Qty</Text>
                <Text style={[styles.tableHeadCell, { flex: 1.2 }]}>Rate</Text>
                <Text style={[styles.tableHeadCell, { flex: 1.2 }]}>Total</Text>
                <Text style={[styles.tableHeadCell, { flex: 0.8, textAlign: 'center' }]}>Action</Text>
              </View>

              {items.map((item) => {
                const itemTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <View key={item.id} style={styles.tableBodyRow}>
                    <View style={{ flex: 2.2, paddingRight: 4 }}>
                      <TextInput
                        style={styles.tableInput}
                        placeholder="Enter detail"
                        placeholderTextColor={Colors.textMuted}
                        value={item.detail}
                        onChangeText={(v) => handleItemChange(item.id, 'detail', v)}
                      />
                    </View>
                    <View style={{ flex: 1, paddingRight: 4 }}>
                      <TextInput
                        style={[styles.tableInput, { textAlign: 'center' }]}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numeric"
                        value={item.qty}
                        onChangeText={(v) => handleItemChange(item.id, 'qty', v)}
                      />
                    </View>
                    <View style={{ flex: 1.2, paddingRight: 4 }}>
                      <TextInput
                        style={[styles.tableInput, { textAlign: 'center' }]}
                        placeholder="0.00"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numeric"
                        value={item.rate}
                        onChangeText={(v) => handleItemChange(item.id, 'rate', v)}
                      />
                    </View>
                    <View style={{ flex: 1.2, justifyContent: 'center' }}>
                      <Text style={styles.tableCalculatedText}>
                        {itemTotal > 0 ? itemTotal.toFixed(2) : '0.00'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center' }}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <TrashIcon size={16} color={Colors.accentRed} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* ADD ITEM BUTTON BELOW TABLE */}
            <TouchableOpacity
              style={styles.addItemBelowButton}
              onPress={handleAddItem}
              activeOpacity={0.8}
            >
              <Text style={styles.addItemBelowButtonText}>+ Add Item</Text>
            </TouchableOpacity>

            {/* Totals Summary Rows */}
            <View style={styles.totalsSummaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Advance Total</Text>
                <TextInput
                  style={styles.summaryInputPlaceholder}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={advance}
                  onChangeText={setAdvance}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount Total</Text>
                <TextInput
                  style={styles.summaryInputPlaceholder}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>{calculateGrandTotal()}</Text>
              </View>
            </View>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>✕ Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <SaveIcon size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Dropdown Modals */}
      <CustomDropdownModal
        visible={isSalesmanModalOpen}
        title="Select Salesman"
        options={salesmanOptions}
        selectedValue={salesman}
        onSelect={setSalesman}
        onClose={() => setIsSalesmanModalOpen(false)}
      />

      <CustomDropdownModal
        visible={isPaymentTermsModalOpen}
        title="Select Payment Terms"
        options={paymentTermsOptions}
        selectedValue={paymentTerms}
        onSelect={setPaymentTerms}
        onClose={() => setIsPaymentTermsModalOpen(false)}
      />

      {/* Custom Interactive Calendar Date & Time Modal */}
      <CalendarPickerModal
        visible={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onSelectDateTime={handleSelectDateTime}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  cardSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.iconBgLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.xs,
  },
  columnHalf: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  fullWidthField: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    height: 44,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textPrimary,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    height: 44,
    paddingHorizontal: Spacing.md,
  },
  dateInputHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeInputText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  dateTimeDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeadCell: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.xs,
    height: 36,
    paddingHorizontal: 6,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
  },
  tableCalculatedText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  addItemBelowButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.borderRadius.sm,
    marginBottom: Spacing.lg,
  },
  addItemBelowButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  totalsSummaryCard: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.borderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  summaryInputPlaceholder: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    textAlign: 'right',
    width: 100,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
    paddingTop: 8,
    backgroundColor: Colors.iconBgGold,
    marginHorizontal: -Spacing.md,
    marginBottom: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: Spacing.borderRadius.sm,
    borderBottomRightRadius: Spacing.borderRadius.sm,
  },
  grandTotalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  grandTotalValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginLeft: Spacing.xs,
  },
});
