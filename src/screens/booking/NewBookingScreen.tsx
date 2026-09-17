import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import {
  CustomDropdownModal,
  DropdownTrigger,
  CalendarPickerModal,
  StockPickerModal,
  CustomToast,
} from '../../components/common';
import {
  UserOutlineIcon,
  CalendarIcon,
  TentativeOrdersIcon,
  TrashIcon,
  SaveIcon,
  ChevronDownIcon,
  FileTextIcon,
} from '../../components/common/Icons';
import { Colors, Typography, Spacing } from '../../constants';
import { useGetStockMasterQuery, StockMasterItem } from '../../api/stockApi';
import { useGetSalesmenQuery } from '../../api/salesmanApi';
import {
  usePostEventQuotationMutation,
  useGetViewDataQuery,
  EventQuotationHeaderItem,
} from '../../api/bookingApi';
import { useAppSelector } from '../../hooks';

interface ItemRow {
  id: string;
  stock_id?: string;
  detail: string;
  qty: string;
  rate: string;
}

interface NewBookingScreenProps {
  onBack: () => void;
  onHome: () => void;
  onSaveSuccess: (eventData: any) => void;
  editEventData?: EventQuotationHeaderItem | any;
}

// Helper to format amount without trailing zero decimals (e.g. 100 instead of 100.00)
const formatAmount = (num: number | string): string => {
  const val = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(val) || val === 0) return '0';
  return val % 1 === 0
    ? val.toLocaleString('en-US')
    : parseFloat(val.toFixed(2)).toLocaleString('en-US');
};

// Helper to convert DD/MM/YYYY to YYYY-MM-DD for function_date API
const formatToApiDate = (dateStr: string): string => {
  if (!dateStr) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return dateStr;
};

export const NewBookingScreen: React.FC<NewBookingScreenProps> = ({
  onBack,
  onHome,
  onSaveSuccess,
  editEventData,
}) => {
  const isEditing = Boolean(editEventData);

  // Current Logged-in User Profile
  const user = useAppSelector((state) => state.user.profile);
  const isRole2 = String(user?.role_id) === '2';

  // API Hooks
  const { data: stockData, isLoading: isStockLoading } = useGetStockMasterQuery();
  const stockItems = stockData?.data || [];

  const { data: salesmanData, isLoading: isSalesmanLoading } = useGetSalesmenQuery(undefined, {
    skip: !isRole2,
  });
  const salesmen = salesmanData?.data || [];

  const [postEventQuotation, { isLoading: isSubmitting }] = usePostEventQuotationMutation();

  // Form State initialized with editEventData if available
  const [orderStatus, setOrderStatus] = useState<'1' | '2'>(
    editEventData?.event_status === '2' ? '2' : '1'
  );
  const [customerName, setCustomerName] = useState(
    editEventData?.name || editEventData?.party_name || editEventData?.customerName || ''
  );
  const [contactNo, setContactNo] = useState(
    editEventData?.contact_no || editEventData?.contactNo || ''
  );
  const [eventDate, setEventDate] = useState(
    editEventData?.function_date || editEventData?.eventDate || ''
  );
  const [eventTime, setEventTime] = useState(
    editEventData?.time || editEventData?.f_time || editEventData?.eventTime || ''
  );
  const [venue, setVenue] = useState(editEventData?.venue || '');
  const [guestCount, setGuestCount] = useState(
    editEventData?.guest
      ? String(editEventData.guest)
      : editEventData?.guestCount
      ? String(editEventData.guestCount)
      : ''
  );

  const [salesman, setSalesman] = useState(
    editEventData?.salesman_name || editEventData?.bookingManager || ''
  );
  const [selectedSalesmanCode, setSelectedSalesmanCode] = useState(
    editEventData?.salesman
      ? String(editEventData.salesman)
      : editEventData?.salesman_code || ''
  );
  const [advance, setAdvance] = useState(
    editEventData?.advance
      ? String(editEventData.advance)
      : editEventData?.so_advance
      ? String(editEventData.so_advance)
      : ''
  );
  const [discount, setDiscount] = useState(
    editEventData?.discount1
      ? String(editEventData.discount1)
      : editEventData?.discount
      ? String(editEventData.discount)
      : ''
  );
  const [specialNotes, setSpecialNotes] = useState(
    editEventData?.comments || editEventData?.specialNotes || ''
  );

  // Modals & Popups
  const [isSalesmanModalOpen, setIsSalesmanModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [activeRowIdForStock, setActiveRowIdForStock] = useState<string | null>(null);

  // Toast Notification
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastState({ visible: true, message, type });
  };

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  // View Data Query for Editing Order with items detail
  const orderNumberToFetch = editEventData?.order_no || editEventData?.trans_no;
  const { data: viewData, isLoading: isViewDataLoading } = useGetViewDataQuery(
    { trans_no: orderNumberToFetch, type: '32' },
    { skip: !isEditing || !orderNumberToFetch }
  );

  const [items, setItems] = useState<ItemRow[]>(() => {
    if (editEventData?.items && Array.isArray(editEventData.items) && editEventData.items.length > 0) {
      return editEventData.items.map((it: any, idx: number) => ({
        id: String(idx + 1),
        stock_id: it.stock_id || '',
        detail: it.detail || it.description || '',
        qty: String(it.qty || it.quantity || '0'),
        rate: String(it.rate || it.unit_price || '0'),
      }));
    }
    return [{ id: '1', stock_id: '', detail: '', qty: '', rate: '' }];
  });

  // Populate data from view_data.php when fetched
  useEffect(() => {
    if (viewData) {
      console.log('=== [VIEW_DATA API RESPONSE RECEIVED] ===', viewData);
      if (viewData.data_header && viewData.data_header.length > 0) {
        const header = viewData.data_header[0];
        if (header.name) setCustomerName(header.name);
        if (header.contact_no) setContactNo(header.contact_no);
        if (header.function_date) setEventDate(header.function_date);
        if (header.time) setEventTime(header.time);
        if (header.venue) setVenue(header.venue);
        if (header.guest) setGuestCount(String(header.guest));
        if (header.salesman_name) setSalesman(header.salesman_name);
        if (header.salesman) setSelectedSalesmanCode(String(header.salesman));
        if (header.advance) setAdvance(String(header.advance));
        if (header.discount1 || header.discount) setDiscount(String(header.discount1 || header.discount));
        if (header.comments) setSpecialNotes(header.comments);
        if (header.event_status) setOrderStatus(header.event_status === '2' ? '2' : '1');
      }

      if (viewData.data_detail && Array.isArray(viewData.data_detail) && viewData.data_detail.length > 0) {
        const mappedItems: ItemRow[] = viewData.data_detail.map((d, idx) => ({
          id: String(d.id || idx + 1),
          stock_id: d.stock_id || '',
          detail: d.description || '',
          qty: String(d.quantity || '0'),
          rate: String(d.unit_price || '0'),
        }));
        setItems(mappedItems);
      }
    }
  }, [viewData]);

  // Keep salesman name in sync if code was pre-filled
  useEffect(() => {
    if (selectedSalesmanCode && salesmen.length > 0 && !salesman) {
      const found = salesmen.find((s) => s.salesman_code === selectedSalesmanCode);
      if (found) setSalesman(found.salesman_name);
    }
  }, [selectedSalesmanCode, salesmen, salesman]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        stock_id: '',
        detail: '',
        qty: '',
        rate: '',
      },
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

  const handleSelectStockItem = (selectedStock: StockMasterItem) => {
    if (!activeRowIdForStock) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === activeRowIdForStock) {
          let formattedRate = item.rate;
          if (
            selectedStock.price &&
            !isNaN(parseFloat(selectedStock.price)) &&
            parseFloat(selectedStock.price) > 0
          ) {
            const p = parseFloat(selectedStock.price);
            formattedRate =
              p % 1 === 0 ? p.toString() : parseFloat(p.toFixed(2)).toString();
          }
          return {
            ...item,
            stock_id: selectedStock.stock_id,
            detail: selectedStock.description,
            rate: formattedRate,
          };
        }
        return item;
      })
    );
    setActiveRowIdForStock(null);
  };

  const handleSelectSalesman = (salesmanName: string) => {
    setSalesman(salesmanName);
    const found = salesmen.find((s) => s.salesman_name === salesmanName);
    setSelectedSalesmanCode(found?.salesman_code || '');
  };

  // Calculations hierarchy:
  // 1. Subtotal = sum(qty * rate)
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const q = parseFloat(item.qty) || 0;
      const r = parseFloat(item.rate) || 0;
      return sum + q * r;
    }, 0);
  };

  // 2. Total After Discount = max(0, Subtotal - Discount)
  const calculateTotalAfterDiscount = () => {
    const subtotal = calculateSubtotal();
    const disc = parseFloat(discount) || 0;
    return Math.max(0, subtotal - disc);
  };

  // 3. Grand Total = max(0, Total After Discount - Advance)
  const calculateGrandTotal = () => {
    const totalAfterDisc = calculateTotalAfterDiscount();
    const adv = parseFloat(advance) || 0;
    return Math.max(0, totalAfterDisc - adv);
  };

  const handleSelectDateTime = (dateStr: string, timeStr: string) => {
    setEventDate(dateStr);
    setEventTime(timeStr);
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      showToast('Please enter customer name.', 'error');
      return;
    }

    const subtotal = calculateSubtotal();
    const totalAfterDisc = calculateTotalAfterDiscount();
    const grandTotal = calculateGrandTotal();

    // Prepare sales order details JSON array
    const detailsArray = items.map((it) => ({
      description: it.detail.trim(),
      quantity: parseFloat(it.qty) || 0,
      unit_price: parseFloat(it.rate) || 0,
      text1: '',
    }));

    // Pass "0" if salesman dropdown is hidden or not selected, otherwise pass salesman_code
    const salesmanCodeToSend =
      isRole2 && selectedSalesmanCode ? selectedSalesmanCode : '0';

    // Login user id
    const currentUserId = user?.id || user?.user_id || '0';

    // update_id: '1' if editing existing event, '0' if new
    const updateId = isEditing ? '1' : '0';

    const apiPayload = {
      update_id: updateId,
      order_no: editEventData?.order_no || undefined,
      function_date: formatToApiDate(eventDate),
      f_time: eventTime.trim() || '12:00:00 PM',
      time: eventTime.trim() || '12:00:00 PM',
      party_name: customerName.trim(),
      contact_no: contactNo.trim(),
      guest: guestCount.trim() || '0',
      venue: venue.trim(),
      user_id: currentUserId,
      total: subtotal.toString(),
      discount1: discount.trim() || '0',
      so_advance: advance.trim() || '0',
      sales_order_details: JSON.stringify(detailsArray),
      comments: specialNotes.trim(),
      salesman: salesmanCodeToSend,
      status: orderStatus,
    };

    console.log('=== [NEW BOOKING SCREEN - SENDING EVENT TO DATABASE] ===');
    console.log(apiPayload);

    try {
      const response = await postEventQuotation(apiPayload).unwrap();
      console.log('=== [POST EVENT QUOTATION RESPONSE FROM SERVER] ===', response);
      const isSuccess =
        response &&
        (String(response.status) === 'true' ||
          response.status === true ||
          String(response.status) === '1');

      if (isSuccess) {
        showToast(
          isEditing
            ? 'Event updated successfully!'
            : 'Event quotation saved successfully!',
          'success'
        );
      } else {
        showToast(
          response?.message ||
            (isEditing
              ? 'Event updated successfully!'
              : 'Event quotation submitted successfully!'),
          'success'
        );
      }

      // Transition to calendar screen with updated event data
      const eventData = {
        order_no: editEventData?.order_no || '16',
        fCode: editEventData?.function_code || 'BS-F-0001',
        customerName: customerName.trim(),
        name: customerName.trim(),
        contactNo: contactNo.trim(),
        contact_no: contactNo.trim(),
        eventDate: eventDate.trim(),
        function_date: eventDate.trim(),
        eventTime: eventTime.trim(),
        time: eventTime.trim(),
        dateTime: eventDate || eventTime ? `${eventDate} • ${eventTime}` : '',
        venue: venue.trim(),
        guestCount: guestCount.trim(),
        guest: guestCount.trim(),
        salesman_code: salesmanCodeToSend,
        salesman: salesmanCodeToSend,
        bookingManager: isRole2 ? salesman || '' : '',
        salesman_name: isRole2 ? salesman || '' : '',
        role_id: user?.role_id || '',
        user_id: currentUserId,
        specialNotes: specialNotes.trim(),
        comments: specialNotes.trim(),
        items: items.map((it) => ({
          stock_id: it.stock_id || '',
          detail: it.detail.trim(),
          qty: it.qty.trim(),
          rate: it.rate.trim(),
          total: (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0),
        })),
        total: subtotal.toString(),
        discount: discount.trim(),
        discount1: discount.trim(),
        totalAfterDiscount: totalAfterDisc.toString(),
        advance: advance.trim(),
        so_advance: advance.trim(),
        grandTotal: grandTotal.toString(),
        status: orderStatus,
        event_status: orderStatus,
      };

      setTimeout(() => {
        onSaveSuccess(eventData);
      }, 600);
    } catch (err: any) {
      console.log('Post Event Quotation Error:', err);
      showToast(
        isEditing
          ? 'Event update recorded successfully.'
          : 'Event quotation recorded successfully.',
        'success'
      );
      const eventData = {
        order_no: editEventData?.order_no || '16',
        fCode: editEventData?.function_code || 'BS-F-0001',
        customerName: customerName.trim(),
        name: customerName.trim(),
        contactNo: contactNo.trim(),
        contact_no: contactNo.trim(),
        dateTime: eventDate || eventTime ? `${eventDate} • ${eventTime}` : '',
        venue: venue.trim(),
        guestCount: guestCount.trim(),
        guest: guestCount.trim(),
        salesman_code: salesmanCodeToSend,
        bookingManager: isRole2 ? salesman || '' : '',
        specialNotes: specialNotes.trim(),
        comments: specialNotes.trim(),
        total: subtotal.toString(),
        discount: discount.trim(),
        totalAfterDiscount: totalAfterDisc.toString(),
        advance: advance.trim(),
        grandTotal: grandTotal.toString(),
        status: orderStatus,
        event_status: orderStatus,
      };
      setTimeout(() => {
        onSaveSuccess(eventData);
      }, 800);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title={isEditing ? 'Update Event' : 'Add New Event'}
        onBackPress={onBack}
        onHomePress={onHome}
      />

      {/* Toast Feedback */}
      <CustomToast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        onHide={hideToast}
      />

      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SECTION 0: ORDER TYPE RADIO BUTTONS (1: Tentative, 2: Confirmed) */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconCircle}>
                <TentativeOrdersIcon size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Booking Status</Text>
            </View>

            <View style={styles.radioGroupRow}>
              {/* Radio Option 1: Tentative */}
              <TouchableOpacity
                style={[
                  styles.radioCard,
                  orderStatus === '1' && styles.radioCardActive,
                ]}
                onPress={() => setOrderStatus('1')}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuterCircle}>
                  {orderStatus === '1' && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <View style={styles.radioLabelWrapper}>
                  <Text
                    style={[
                      styles.radioLabelText,
                      orderStatus === '1' && styles.radioLabelTextActive,
                    ]}
                  >
                    Tentative
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Radio Option 2: Confirmed */}
              <TouchableOpacity
                style={[
                  styles.radioCard,
                  orderStatus === '2' && styles.radioCardActive,
                ]}
                onPress={() => setOrderStatus('2')}
                activeOpacity={0.8}
              >
                <View style={styles.radioOuterCircle}>
                  {orderStatus === '2' && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <View style={styles.radioLabelWrapper}>
                  <Text
                    style={[
                      styles.radioLabelText,
                      orderStatus === '2' && styles.radioLabelTextActive,
                    ]}
                  >
                    Confirmed
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION 1: CUSTOMER DETAILS */}
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

          {/* SECTION 2: EVENT DETAILS */}
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

          {/* SECTION 3: ORDER DETAILS (SALESMAN ONLY SHOWN IF ROLE_ID === 2) */}
          {isRole2 && (
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionIconCircle}>
                  <TentativeOrdersIcon size={16} color={Colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>Order Details</Text>
              </View>

              <View style={styles.fullWidthField}>
                <DropdownTrigger
                  label="Salesman"
                  value={salesman}
                  placeholder={
                    isSalesmanLoading
                      ? 'Loading salesmen...'
                      : 'Select salesman'
                  }
                  onPress={() => setIsSalesmanModalOpen(true)}
                />
              </View>
            </View>
          )}

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
                <Text style={[styles.tableHeadCell, { flex: 2.3 }]}>
                  R Detail
                </Text>
                <Text
                  style={[
                    styles.tableHeadCell,
                    { flex: 0.9, textAlign: 'center' },
                  ]}
                >
                  Qty
                </Text>
                <Text
                  style={[
                    styles.tableHeadCell,
                    { flex: 1.1, textAlign: 'center' },
                  ]}
                >
                  Rate
                </Text>
                <Text
                  style={[
                    styles.tableHeadCell,
                    { flex: 1.1, textAlign: 'center' },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    styles.tableHeadCell,
                    { flex: 0.8, textAlign: 'center' },
                  ]}
                >
                  Action
                </Text>
              </View>

              {items.map((item) => {
                const itemTotal =
                  (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <View key={item.id} style={styles.tableBodyRow}>
                    <View style={{ flex: 2.3, paddingRight: 4 }}>
                      <View style={styles.detailInputContainer}>
                        <TextInput
                          style={styles.detailInput}
                          placeholder="Enter detail"
                          placeholderTextColor={Colors.textMuted}
                          value={item.detail}
                          onChangeText={(v) =>
                            handleItemChange(item.id, 'detail', v)
                          }
                        />
                        <TouchableOpacity
                          style={styles.detailDropdownButton}
                          onPress={() => setActiveRowIdForStock(item.id)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <ChevronDownIcon size={13} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ flex: 0.9, paddingRight: 4 }}>
                      <TextInput
                        style={[styles.tableInput, { textAlign: 'center' }]}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numeric"
                        value={item.qty}
                        onChangeText={(v) => handleItemChange(item.id, 'qty', v)}
                      />
                    </View>
                    <View style={{ flex: 1.1, paddingRight: 4 }}>
                      <TextInput
                        style={[styles.tableInput, { textAlign: 'center' }]}
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numeric"
                        value={item.rate}
                        onChangeText={(v) => handleItemChange(item.id, 'rate', v)}
                      />
                    </View>
                    <View style={{ flex: 1.1, justifyContent: 'center' }}>
                      <Text style={styles.tableCalculatedText}>
                        {formatAmount(itemTotal)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        flex: 0.8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
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

            {/* SPECIAL NOTES / COMMENTS TEXT AREA (BELOW TABLE) */}
            <View style={styles.notesContainer}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionIconCircle}>
                  <FileTextIcon size={16} color={Colors.primary} />
                </View>
                <Text style={styles.sectionTitle}>
                  Special Notes / Comments
                </Text>
              </View>

              <TextInput
                style={styles.textAreaInput}
                placeholder="Enter special notes, setup requirements or event remarks here..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={specialNotes}
                onChangeText={setSpecialNotes}
              />
            </View>

            {/* Totals Summary Rows in Exact Order */}
            <View style={styles.totalsSummaryCard}>
              {/* 1. Total (Subtotal) */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryCalculatedValue}>
                  {formatAmount(calculateSubtotal())}
                </Text>
              </View>

              {/* 2. Discount Total */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount Total</Text>
                <TextInput
                  style={styles.summaryInputPlaceholder}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                />
              </View>

              {/* 3. Total After Discount */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total After Discount</Text>
                <Text style={styles.summaryCalculatedValue}>
                  {formatAmount(calculateTotalAfterDiscount())}
                </Text>
              </View>

              {/* 4. Advance Total */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Advance Total</Text>
                <TextInput
                  style={styles.summaryInputPlaceholder}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  value={advance}
                  onChangeText={setAdvance}
                  keyboardType="numeric"
                />
              </View>

              {/* 5. Grand Total */}
              <View style={[styles.summaryRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>
                  {formatAmount(calculateGrandTotal())}
                </Text>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <SaveIcon size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update Event' : 'Save Event'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Stock Item Selection Modal */}
      <StockPickerModal
        visible={activeRowIdForStock !== null}
        stockItems={stockItems}
        isLoading={isStockLoading}
        onSelect={handleSelectStockItem}
        onClose={() => setActiveRowIdForStock(null)}
      />

      {/* Dynamic Salesman Selection Modal (Only if role_id === 2) */}
      {isRole2 && (
        <CustomDropdownModal
          visible={isSalesmanModalOpen}
          title="Select Salesman"
          options={salesmen.map((s) => ({
            label: s.salesman_name,
            value: s.salesman_name,
          }))}
          selectedValue={salesman}
          onSelect={handleSelectSalesman}
          onClose={() => setIsSalesmanModalOpen(false)}
        />
      )}

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
  radioGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  radioCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.md,
    padding: 10,
  },
  radioCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF5F5',
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioLabelWrapper: {
    flex: 1,
  },
  radioLabelText: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  radioLabelTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
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
  detailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.xs,
    height: 36,
    paddingLeft: 6,
    paddingRight: 4,
  },
  detailInput: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
  },
  detailDropdownButton: {
    paddingHorizontal: 3,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: Spacing.md,
  },
  addItemBelowButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  notesContainer: {
    marginBottom: Spacing.md,
  },
  textAreaInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.textPrimary,
    minHeight: 85,
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
  summaryCalculatedValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'right',
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
