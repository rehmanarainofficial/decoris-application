import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScreenHeader,
  SearchIcon,
  TrashIcon,
  SaveIcon,
  PlusIcon,
  CustomDropdownModal,
  CustomToast,
  CalendarIcon,
  LocationIcon,
  UserOutlineIcon,
  FileTextIcon,
  RefreshIcon,
  CalculatorIcon,
} from '../../components/common';
import { Colors, Typography, Spacing } from '../../constants';
import {
  useGetSuppliersQuery,
  useGetFunctionCostingQuery,
  usePostFunctionCostingMutation,
  SupplierItem,
  FunctionCostingItem,
} from '../../api/bookingApi';

export interface CostingRow {
  id: string;
  supplier_id: string;
  supplier_name: string;
  description: string;
  quantity: string;
  unit_price: string;
  date: string;
  f_code: string;
  isSaved?: boolean;
  isSaving?: boolean;
}

interface EventCostingScreenProps {
  eventData?: any;
  onBack?: () => void;
  onHome?: () => void;
}

export const EventCostingScreen: React.FC<EventCostingScreenProps> = ({
  eventData,
  onBack,
  onHome,
}) => {
  // Extract event context
  const fCode = eventData?.function_code || eventData?.f_code || eventData?.order_no || '1';
  const eventDate =
    eventData?.function_date ||
    eventData?.trans_date ||
    eventData?.ord_date ||
    new Date().toISOString().split('T')[0];
  const partyName = eventData?.name || eventData?.party_name || 'Event Customer';
  const venue = eventData?.venue || 'Event Venue';

  // RTK Query hooks
  const { data: suppliersResponse, isLoading: isSuppliersLoading } = useGetSuppliersQuery();
  const {
    data: fetchedCostingRes,
    isLoading: isCostingLoading,
    isFetching: isCostingFetching,
    refetch: refetchCosting,
  } = useGetFunctionCostingQuery(fCode, { skip: !fCode });

  const [postFunctionCosting] = usePostFunctionCostingMutation();

  const suppliersList: SupplierItem[] = suppliersResponse?.data || [];
  const supplierOptions = suppliersList.map((s) => ({
    label: s.name || `Supplier #${s.supplier_id}`,
    value: String(s.supplier_id),
  }));

  const savedCostingItems: FunctionCostingItem[] = fetchedCostingRes?.data || [];

  const totalSavedCost = savedCostingItems.reduce((acc, item) => {
    const q = parseFloat(item.quantity) || 0;
    const r = parseFloat(item.rates) || 0;
    return acc + q * r;
  }, 0);

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('success');

  const showToast = (msg: string, type: 'error' | 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // State for new rows to add
  const [costingRows, setCostingRows] = useState<CostingRow[]>([
    {
      id: '1',
      supplier_id: '',
      supplier_name: '',
      description: '',
      quantity: '1',
      unit_price: '',
      date: eventDate,
      f_code: fCode,
      isSaved: false,
      isSaving: false,
    },
  ]);

  // Modal State for Vendor selection
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [activeRowIdForVendor, setActiveRowIdForVendor] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const handleAddRow = () => {
    const newRow: CostingRow = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      supplier_id: '',
      supplier_name: '',
      description: '',
      quantity: '1',
      unit_price: '',
      date: eventDate,
      f_code: fCode,
      isSaved: false,
      isSaving: false,
    };
    setCostingRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    if (costingRows.length === 1) {
      setCostingRows([
        {
          id: Date.now().toString(),
          supplier_id: '',
          supplier_name: '',
          description: '',
          quantity: '1',
          unit_price: '',
          date: eventDate,
          f_code: fCode,
          isSaved: false,
          isSaving: false,
        },
      ]);
      return;
    }
    setCostingRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRowField = (id: string, field: keyof CostingRow, value: string) => {
    setCostingRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value, isSaved: false };
        }
        return r;
      })
    );
  };

  const openVendorPicker = (rowId: string) => {
    setActiveRowIdForVendor(rowId);
    setIsVendorModalOpen(true);
  };

  const handleSelectVendor = (supplierId: string) => {
    if (!activeRowIdForVendor) return;
    const foundSupplier = suppliersList.find(
      (s) => String(s.supplier_id) === String(supplierId)
    );
    const supplierName = foundSupplier?.name || `Vendor #${supplierId}`;

    setCostingRows((prev) =>
      prev.map((r) => {
        if (r.id === activeRowIdForVendor) {
          return {
            ...r,
            supplier_id: supplierId,
            supplier_name: supplierName,
            isSaved: false,
          };
        }
        return r;
      })
    );
    setActiveRowIdForVendor(null);
  };

  const handleSaveRow = async (row: CostingRow) => {
    if (!row.supplier_id) {
      showToast('Please select a vendor for this row', 'error');
      return;
    }
    if (!row.description.trim()) {
      showToast('Please enter item / service description', 'error');
      return;
    }
    const rateNum = parseFloat(row.unit_price);
    if (isNaN(rateNum) || rateNum < 0) {
      showToast('Please enter a valid rate', 'error');
      return;
    }
    const qtyNum = parseFloat(row.quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    setCostingRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, isSaving: true } : r))
    );

    try {
      const payload = {
        description: row.description.trim(),
        unit_price: row.unit_price,
        date: row.date || eventDate,
        f_code: row.f_code || fCode,
        supplier_id: row.supplier_id,
        quantity: row.quantity,
      };

      console.log('Posting single costing row:', payload);
      const res = await postFunctionCosting(payload).unwrap();

      if (
        res.status === 'true' ||
        res.status === true ||
        res.message?.toLowerCase().includes('success') ||
        res.message?.toLowerCase().includes('data')
      ) {
        showToast('Costing item saved successfully!', 'success');
        setCostingRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, isSaved: true, isSaving: false } : r
          )
        );
        refetchCosting();
      } else {
        showToast(res.message || 'Failed to save costing item', 'error');
        setCostingRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, isSaving: false } : r))
        );
      }
    } catch (err: any) {
      console.error('Error saving costing row:', err);
      showToast(err?.data?.message || 'Server error while saving costing', 'error');
      setCostingRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, isSaving: false } : r))
      );
    }
  };

  const filteredNewRows = costingRows.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.supplier_name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

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
        title="Event Costing"
        onBackPress={onBack}
        onHomePress={onHome}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Event Header Information Card */}
        <View style={styles.eventInfoCard}>
          <View style={styles.eventInfoTopRow}>
            <View style={styles.fCodeBadge}>
              <FileTextIcon size={14} color="#FFFFFF" />
              <Text style={styles.fCodeBadgeText}>F-CODE: {fCode}</Text>
            </View>
            <View style={styles.dateBadge}>
              <CalendarIcon size={14} color={Colors.primary} />
              <Text style={styles.dateBadgeText}>{eventDate}</Text>
            </View>
          </View>

          <View style={styles.eventInfoDetails}>
            <View style={styles.infoRow}>
              <UserOutlineIcon size={15} color={Colors.textSecondary} />
              <Text style={styles.infoCustomerText} numberOfLines={1}>
                {partyName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <LocationIcon size={15} color={Colors.textSecondary} />
              <Text style={styles.infoVenueText} numberOfLines={1}>
                {venue}
              </Text>
            </View>
          </View>
        </View>

        {/* 1. FETCHED / SAVED COSTING RECORDS LIST */}
        <View style={styles.savedSectionCard}>
          <View style={styles.savedSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CalculatorIcon size={16} color="#FFFFFF" />
              <Text style={styles.savedSectionTitle}>SAVED EVENT EXPENSES</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{savedCostingItems.length}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => refetchCosting()}
              style={styles.refreshIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isCostingFetching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <RefreshIcon size={14} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {isCostingLoading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching saved costing records...</Text>
            </View>
          ) : savedCostingItems.length === 0 ? (
            <View style={styles.emptySavedBox}>
              <Text style={styles.emptySavedText}>
                No costing records saved yet for F-Code: {fCode}
              </Text>
              <Text style={styles.emptySavedSub}>
                Add new expenses below and click Save to record them.
              </Text>
            </View>
          ) : (
            <View>
              {savedCostingItems.map((item, idx) => {
                const itemQty = parseFloat(item.quantity) || 0;
                const itemRate = parseFloat(item.rates) || 0;
                const itemTotal = itemQty * itemRate;

                return (
                  <View
                    key={item.id || idx}
                    style={[
                      styles.savedItemRow,
                      idx % 2 === 1 && styles.savedItemRowAlt,
                    ]}
                  >
                    {/* Top Row: Vendor & Date */}
                    <View style={styles.savedItemTop}>
                      <Text style={styles.savedVendorName} numberOfLines={2}>
                        {item.supplier || `Supplier #${item.supplier_id}`}
                      </Text>
                      <Text style={styles.savedOrderDate}>
                        {item.order_date && item.order_date !== '0000-00-00'
                          ? item.order_date
                          : eventDate}
                      </Text>
                    </View>

                    {/* Middle: Description (wrapping) */}
                    {item.description ? (
                      <Text style={styles.savedDescription}>{item.description}</Text>
                    ) : null}

                    {/* Bottom: Qty x Rate = Total */}
                    <View style={styles.savedFinancialsRow}>
                      <Text style={styles.savedQtyRateText}>
                        Qty: <Text style={styles.boldDark}>{item.quantity}</Text> × Rate:{' '}
                        <Text style={styles.boldDark}>Rs. {item.rates}</Text>
                      </Text>
                      <Text style={styles.savedTotalText}>
                        Rs. {Math.round(itemTotal).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Total Saved Cost Summary Banner */}
              <View style={styles.savedTotalSummaryRow}>
                <Text style={styles.summaryLabel}>Total Recorded Expense:</Text>
                <Text style={styles.summaryValue}>
                  Rs. {Math.round(totalSavedCost).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 2. ADD NEW COSTING SECTION */}
        <View style={styles.addSectionContainer}>
          {/* Section Banner */}
          <View style={styles.sectionHeaderBanner}>
            <Text style={styles.sectionBannerTitle}>ADD NEW COSTING ITEM</Text>
            <TouchableOpacity
              style={styles.addTopButton}
              onPress={handleAddRow}
              activeOpacity={0.8}
            >
              <PlusIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addTopButtonText}>Add Row</Text>
            </TouchableOpacity>
          </View>

          {/* Search Filter for new rows */}
          {costingRows.length > 1 ? (
            <View style={styles.searchBarContainer}>
              <SearchIcon size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search vendor / item..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          ) : null}

          {/* New Costing Cards (No horizontal overflow, text wraps gracefully) */}
          {filteredNewRows.map((row, idx) => {
            const qty = parseFloat(row.quantity) || 0;
            const rate = parseFloat(row.unit_price) || 0;
            const total = qty * rate;

            return (
              <View key={row.id} style={styles.costCard}>
                {/* Row Header: Number badge, Vendor selector, Delete button */}
                <View style={styles.cardTopRow}>
                  <View style={styles.rowNumberPill}>
                    <Text style={styles.rowNumberText}>#{idx + 1}</Text>
                  </View>

                  {/* Vendor Picker Dropdown */}
                  <TouchableOpacity
                    style={[
                      styles.vendorPickerBtn,
                      !row.supplier_id && styles.vendorPickerBtnEmpty,
                    ]}
                    onPress={() => openVendorPicker(row.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.vendorPickerText,
                        !row.supplier_id && styles.vendorPickerPlaceholder,
                      ]}
                      numberOfLines={2}
                    >
                      {row.supplier_name || 'Select Vendor / Supplier ▾'}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteRowBtn}
                    onPress={() => handleDeleteRow(row.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <TrashIcon size={18} color={Colors.accentRed} />
                  </TouchableOpacity>
                </View>

                {/* Description Input (Auto-wrapping multiline) */}
                <View style={styles.descInputWrapper}>
                  <Text style={styles.fieldLabel}>Description / Service</Text>
                  <TextInput
                    style={styles.descInput}
                    placeholder="e.g. Stage Setup, DJ Service, Lighting..."
                    placeholderTextColor={Colors.textMuted}
                    value={row.description}
                    onChangeText={(val) => updateRowField(row.id, 'description', val)}
                    multiline
                  />
                </View>

                {/* Numbers Row: Rate, Qty, Auto Total, and Save Action */}
                <View style={styles.numbersGridRow}>
                  {/* Rate Input */}
                  <View style={styles.numInputBox}>
                    <Text style={styles.fieldLabel}>Rate (Rs)</Text>
                    <TextInput
                      style={styles.numericTextInput}
                      placeholder="0"
                      placeholderTextColor={Colors.textMuted}
                      value={row.unit_price}
                      onChangeText={(val) => updateRowField(row.id, 'unit_price', val)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Quantity Input */}
                  <View style={[styles.numInputBox, { maxWidth: 70 }]}>
                    <Text style={styles.fieldLabel}>Qty</Text>
                    <TextInput
                      style={[styles.numericTextInput, { textAlign: 'center' }]}
                      placeholder="1"
                      placeholderTextColor={Colors.textMuted}
                      value={row.quantity}
                      onChangeText={(val) => updateRowField(row.id, 'quantity', val)}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Computed Total Display */}
                  <View style={styles.totalDisplayBox}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue} numberOfLines={1}>
                      Rs. {Math.round(total).toLocaleString()}
                    </Text>
                  </View>

                  {/* Post/Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.saveRowBtn,
                      row.isSaved && styles.saveRowBtnSaved,
                      row.isSaving && styles.saveRowBtnDisabled,
                    ]}
                    onPress={() => handleSaveRow(row)}
                    disabled={row.isSaving}
                    activeOpacity={0.8}
                  >
                    {row.isSaving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <SaveIcon size={14} color="#FFFFFF" />
                        <Text style={styles.saveRowBtnText}>
                          {row.isSaved ? 'Saved' : 'Save'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Add Row Big Button at bottom */}
          <TouchableOpacity
            style={styles.addBottomRowBtn}
            onPress={handleAddRow}
            activeOpacity={0.85}
          >
            <PlusIcon size={18} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.addBottomRowBtnText}>Add Another Expense Row</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Vendor Selection Modal */}
      <CustomDropdownModal
        visible={isVendorModalOpen}
        title="Select Vendor / Supplier"
        options={supplierOptions}
        selectedValue={
          activeRowIdForVendor
            ? costingRows.find((r) => r.id === activeRowIdForVendor)?.supplier_id
            : undefined
        }
        onSelect={handleSelectVendor}
        onClose={() => {
          setIsVendorModalOpen(false);
          setActiveRowIdForVendor(null);
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
  },
  eventInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventInfoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  fCodeBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EBDCC8',
  },
  dateBadgeText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  eventInfoDetails: {
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCustomerText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  infoVenueText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Saved Costing Section
  savedSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    elevation: 2,
  },
  savedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a365d',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  savedSectionTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  countBadge: {
    backgroundColor: '#2b6cb0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  refreshIconBtn: {
    padding: 4,
  },
  centerLoading: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  emptySavedBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySavedText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySavedSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  savedItemRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  savedItemRowAlt: {
    backgroundColor: '#FAF9F6',
  },
  savedItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  savedVendorName: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  savedOrderDate: {
    fontSize: 10,
    color: Colors.textMuted,
    backgroundColor: '#EAE6DF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savedDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  savedFinancialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  savedQtyRateText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  boldDark: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  savedTotalText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  savedTotalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm + 1,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  // Add Section
  addSectionContainer: {
    marginBottom: Spacing.md,
  },
  sectionHeaderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sectionBannerTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },
  addTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E7D3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  addTopButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm + 2,
    height: 40,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  costCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8DF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EDE8DF',
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowNumberPill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EBDCC8',
  },
  rowNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  vendorPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    minHeight: 38,
    paddingVertical: 4,
  },
  vendorPickerBtnEmpty: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFCF5',
  },
  vendorPickerText: {
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  vendorPickerPlaceholder: {
    color: '#9E7D3B',
    fontWeight: 'normal',
  },
  deleteRowBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descInputWrapper: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  descInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    minHeight: 38,
  },
  numbersGridRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  numInputBox: {
    flex: 1,
  },
  numericTextInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.textPrimary,
    fontWeight: '600',
    paddingVertical: 0,
  },
  totalDisplayBox: {
    flex: 1.2,
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  totalValue: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: Colors.primary,
    height: 36,
    lineHeight: 36,
  },
  saveRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
    justifyContent: 'center',
  },
  saveRowBtnSaved: {
    backgroundColor: '#2b8a3e',
  },
  saveRowBtnDisabled: {
    opacity: 0.6,
  },
  saveRowBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
  },
  addBottomRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5EE',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    gap: 6,
  },
  addBottomRowBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
