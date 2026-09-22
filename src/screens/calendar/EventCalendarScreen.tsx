import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import {
  CalendarIcon,
  LocationIcon,
  UserOutlineIcon,
  PhoneIcon,
  FileTextIcon,
  EditIcon,
  SearchIcon,
  TentativeOrdersIcon,
  ConfirmedOrdersIcon,
  CalculatorIcon,
} from '../../components/common/Icons';
import { Colors, Typography, Spacing } from '../../constants';
import {
  useGetEventQuotationHeadersQuery,
  useGetViewDataQuery,
  useGetFunctionCostingQuery,
  EventQuotationHeaderItem,
  FunctionCostingItem,
} from '../../api/bookingApi';

interface ShortageItem {
  id: string;
  item: string;
  qtyIn: string;
  qtyOut: string;
  shortage: string;
}

interface CostingItem {
  id: string;
  vendor: string;
  description: string;
  qty: string;
  rate: string;
  total: string;
}

interface EventCalendarScreenProps {
  eventData?: any;
  filterStatus?: '1' | '2' | 'ALL';
  onBack: () => void;
  onHome: () => void;
  onEditEvent?: (event: EventQuotationHeaderItem | any) => void;
  onNavigateToCosting?: (event: EventQuotationHeaderItem | any) => void;
}

export const EventCalendarScreen: React.FC<EventCalendarScreenProps> = ({
  eventData,
  filterStatus = 'ALL',
  onBack,
  onHome,
  onEditEvent,
  onNavigateToCosting,
}) => {
  // Live Data Query
  const {
    data: headerResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetEventQuotationHeadersQuery();
  const apiEvents: EventQuotationHeaderItem[] = headerResponse?.data || [];

  const [activeTab, setActiveTab] = useState<'ALL' | '1' | '2'>(filterStatus);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    setActiveTab(filterStatus);
  }, [filterStatus]);

  // Selected event for detail view (shortage / costing) - null by default so no event is auto-opened
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const selectedOrderNo = selectedEvent?.order_no || selectedEvent?.trans_no;
  const { data: viewDataResult, isFetching: isViewDataFetching } =
    useGetViewDataQuery(
      { trans_no: selectedOrderNo, type: '32' },
      { skip: !selectedOrderNo },
    );
  console.log("viewDataResult", viewDataResult);
  const detailItems = viewDataResult?.data_detail || [];

  const selectedFCode =
    selectedEvent?.function_code ||
    selectedEvent?.f_code ||
    selectedEvent?.order_no;
  const { data: costingResult, isFetching: isCostingFetching } =
    useGetFunctionCostingQuery(selectedFCode, { skip: !selectedFCode });
  const eventCostingItems: FunctionCostingItem[] = costingResult?.data || [];

  const totalEventExpense = eventCostingItems.reduce((acc, cItem) => {
    const q = parseFloat(cItem.quantity) || 0;
    const r = parseFloat(cItem.rates) || 0;
    return acc + q * r;
  }, 0);

  const [shortageItems, setShortageItems] = useState<ShortageItem[]>([]);
  const [costingItems, setCostingItems] = useState<CostingItem[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQtyIn, setNewItemQtyIn] = useState('');
  const [newItemQtyOut, setNewItemQtyOut] = useState('');

  const [isAddCostingModalOpen, setIsAddCostingModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newRate, setNewRate] = useState('');

  // Filter events by tab and search
  const filteredEvents = apiEvents.filter(item => {
    const matchesTab =
      activeTab === 'ALL' || String(item.event_status) === activeTab;

    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.venue || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.function_code || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.contact_no || '').includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  const handleAddShortageItem = () => {
    if (!newItemName) return;
    const qIn = parseInt(newItemQtyIn, 10) || 0;
    const qOut = parseInt(newItemQtyOut, 10) || 0;
    const calcShortage = Math.max(0, qOut - qIn).toString();

    setShortageItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        item: newItemName,
        qtyIn: newItemQtyIn || '0',
        qtyOut: newItemQtyOut || '0',
        shortage: calcShortage,
      },
    ]);
    setNewItemName('');
    setNewItemQtyIn('');
    setNewItemQtyOut('');
    setIsAddModalOpen(false);
  };

  const handleRemoveShortageItem = (id: string) => {
    setShortageItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddCostingItem = () => {
    if (!newVendor) return;
    const q = parseFloat(newQty) || 0;
    const r = parseFloat(newRate) || 0;
    const itemTotal = q * r;
    const formattedTotal =
      itemTotal > 0
        ? itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })
        : '0.00';

    setCostingItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        vendor: newVendor,
        description: newDescription,
        qty: newQty || '0',
        rate: newRate || '0',
        total: formattedTotal,
      },
    ]);
    setNewVendor('');
    setNewDescription('');
    setNewQty('');
    setNewRate('');
    setIsAddCostingModalOpen(false);
  };

  const handleRemoveCostingItem = (id: string) => {
    setCostingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditClick = (event: any) => {
    if (onEditEvent) {
      onEditEvent(event);
    }
  };

  // Header Title based on filter
  const getHeaderTitle = () => {
    if (activeTab === '1') return 'Tentative Orders';
    if (activeTab === '2') return 'Confirmed Orders';
    return 'Event Calendar';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title={getHeaderTitle()}
        onBackPress={onBack}
        onHomePress={onHome}
        rightElement={
          selectedEvent && (
            <TouchableOpacity
              onPress={() => handleEditClick(selectedEvent)}
              activeOpacity={0.7}
            >
              <EditIcon size={20} color={Colors.primary} />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Status Filter Tabs */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'ALL' && styles.tabButtonActive,
            ]}
            onPress={() => {
              setActiveTab('ALL');
              setSelectedEvent(null);
            }}
            activeOpacity={0.8}
          >
            <CalendarIcon
              size={14}
              color={activeTab === 'ALL' ? '#FFFFFF' : Colors.primary}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'ALL' && styles.tabButtonTextActive,
              ]}
            >
              All ({apiEvents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === '1' && styles.tabButtonActive,
            ]}
            onPress={() => {
              setActiveTab('1');
              setSelectedEvent(null);
            }}
            activeOpacity={0.8}
          >
            <TentativeOrdersIcon
              size={14}
              color={activeTab === '1' ? '#FFFFFF' : Colors.primary}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === '1' && styles.tabButtonTextActive,
              ]}
            >
              Tentative (
              {apiEvents.filter(e => String(e.event_status) === '1').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === '2' && styles.tabButtonActive,
            ]}
            onPress={() => {
              setActiveTab('2');
              setSelectedEvent(null);
            }}
            activeOpacity={0.8}
          >
            <ConfirmedOrdersIcon
              size={14}
              color={activeTab === '2' ? '#FFFFFF' : Colors.primary}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === '2' && styles.tabButtonTextActive,
              ]}
            >
              Confirmed (
              {apiEvents.filter(e => String(e.event_status) === '2').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, venue, code or contact..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Live Events List */}
        <View style={styles.eventsListContainer}>
          <Text style={styles.sectionHeadingText}>
            {getHeaderTitle()} ({filteredEvents.length})
          </Text>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                Loading live events from server...
              </Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No events found for the selected filter.
              </Text>
            </View>
          ) : (
            filteredEvents.map(item => {
              const isConfirmed = String(item.event_status) === '2';
              const isSelected = selectedEvent?.order_no === item.order_no;

              return (
                <View
                  key={item.order_no}
                  style={[
                    styles.eventCard,
                    isSelected && styles.eventCardSelected,
                    {
                      borderLeftColor: isConfirmed
                        ? '#28a745'
                        : Colors.accentGold,
                    },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardOrderNo}>#{item.order_no}</Text>
                      <Text style={styles.cardCode}>{item.function_code}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isConfirmed
                          ? styles.statusBadgeConfirmed
                          : styles.statusBadgeTentative,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isConfirmed
                            ? styles.statusTextConfirmed
                            : styles.statusTextTentative,
                        ]}
                      >
                        {item.event_status_name ||
                          (isConfirmed ? 'Confirmed' : 'Tentative')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardContentBody}>
                    <Text style={styles.cardCustomerName}>{item.name}</Text>
                    <View style={styles.infoLine}>
                      <PhoneIcon size={12} color={Colors.textSecondary} />
                      <Text style={styles.infoLineText}>
                        {item.contact_no || 'No contact'}
                      </Text>
                    </View>
                    <View style={styles.infoLine}>
                      <CalendarIcon size={12} color={Colors.textSecondary} />
                      <Text style={styles.infoLineText}>
                        {item.function_date} {item.time ? `• ${item.time}` : ''}
                      </Text>
                    </View>
                    <View style={styles.infoLine}>
                      <LocationIcon size={12} color={Colors.textSecondary} />
                      <Text style={styles.infoLineText}>
                        {item.venue || 'No venue specified'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFinancialRow}>
                    <View>
                      <Text style={styles.financeLabel}>Total</Text>
                      <Text style={styles.financeValue}>
                        Rs. {Number(item.total || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.financeLabel}>Advance</Text>
                      <Text style={[styles.financeValue, { color: '#28a745' }]}>
                        Rs. {Number(item.advance || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.financeLabel}>Discount</Text>
                      <Text style={styles.financeValue}>
                        Rs. {Number(item.discount1 || 0).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Breakdown Section when View Breakdown is clicked */}
                  {isSelected && (
                    <View
                      style={{
                        marginTop: Spacing.md,
                        paddingTop: Spacing.sm,
                        borderTopWidth: 1,
                        borderTopColor: Colors.borderLight,
                      }}
                    >
                      {/* Additional Details Grid */}
                      <View style={styles.detailsGrid}>
                        <View style={styles.gridCell}>
                          <View style={styles.cellHeaderRow}>
                            <UserOutlineIcon size={14} color={Colors.primary} />
                            <Text style={styles.cellLabel}>Guest Count</Text>
                          </View>
                          <Text style={styles.cellValue}>{item.guest || '-'}</Text>
                        </View>

                        <View style={styles.gridCell}>
                          <View style={styles.cellHeaderRow}>
                            <UserOutlineIcon size={14} color={Colors.primary} />
                            <Text style={styles.cellLabel}>Salesman</Text>
                          </View>
                          <Text style={styles.cellValue}>
                            {item.salesman_name || '-'}
                          </Text>
                        </View>

                        {item.comments ? (
                          <View style={[styles.gridCell, { width: '100%' }]}>
                            <View style={styles.cellHeaderRow}>
                              <FileTextIcon size={14} color={Colors.primary} />
                              <Text style={styles.cellLabel}>Special Notes</Text>
                            </View>
                            <Text style={styles.cellValue}>{item.comments}</Text>
                          </View>
                        ) : null}
                      </View>

                      {/* Items Breakdown Table from view_data.php */}
                      <View style={{ marginTop: Spacing.sm }}>
                        <View style={styles.breakdownHeaderBar}>
                          <Text style={styles.breakdownTitle}>
                            EVENT REQUIREMENTS / ITEMS ({detailItems.length})
                          </Text>
                        </View>

                        {isViewDataFetching ? (
                          <View style={{ padding: Spacing.md, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                          </View>
                        ) : detailItems.length === 0 ? (
                          <Text
                            style={{
                              fontSize: Typography.fontSize.xs,
                              color: Colors.textMuted,
                              padding: Spacing.md,
                              textAlign: 'center',
                            }}
                          >
                            No item details found for this quotation.
                          </Text>
                        ) : (
                          <View style={styles.tableContainer}>
                            <View style={styles.tableHeaderRow}>
                              <Text style={[styles.tableHeadCell, { flex: 2 }]}>
                                Item Detail
                              </Text>
                              <Text
                                style={[
                                  styles.tableHeadCell,
                                  { flex: 0.8, textAlign: 'center' },
                                ]}
                              >
                                Qty
                              </Text>
                              <Text
                                style={[
                                  styles.tableHeadCell,
                                  { flex: 1, textAlign: 'right' },
                                ]}
                              >
                                Rate
                              </Text>
                              <Text
                                style={[
                                  styles.tableHeadCell,
                                  { flex: 1.2, textAlign: 'right' },
                                ]}
                              >
                                Total
                              </Text>
                            </View>
                            {detailItems.map((dItem, idx) => {
                              const rowQty = parseFloat(dItem.quantity) || 0;
                              const rowRate = parseFloat(dItem.unit_price) || 0;
                              const rowTotal = rowQty * rowRate;
                              return (
                                <View
                                  key={dItem.id || idx}
                                  style={styles.tableBodyRow}
                                >
                                  <View style={{ flex: 2 }}>
                                    <Text
                                      style={[
                                        styles.tableBodyCell,
                                        { fontWeight: 'bold' },
                                      ]}
                                    >
                                      {dItem.description}
                                    </Text>
                                    {dItem.stock_id ? (
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          color: Colors.textMuted,
                                        }}
                                      >
                                        ID: {dItem.stock_id}
                                      </Text>
                                    ) : null}
                                  </View>
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      { flex: 0.8, textAlign: 'center' },
                                    ]}
                                  >
                                    {dItem.quantity}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      { flex: 1, textAlign: 'right' },
                                    ]}
                                  >
                                    {dItem.unit_price}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      {
                                        flex: 1.2,
                                        textAlign: 'right',
                                        fontWeight: 'bold',
                                        color: Colors.primary,
                                      },
                                    ]}
                                  >
                                    {Math.round(rowTotal).toLocaleString()}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        )}

                        {/* Costing / Vendor Expense Section */}
                        <View style={[styles.breakdownHeaderBar, { marginTop: Spacing.md }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <CalculatorIcon size={14} color={Colors.primary} />
                            <Text style={styles.breakdownHeaderTitle}>
                              COSTING & VENDOR EXPENSES ({eventCostingItems.length})
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.addCostingLink}
                            onPress={() => onNavigateToCosting?.(item)}
                          >
                            <Text style={styles.addCostingLinkText}>+ Manage Cost</Text>
                          </TouchableOpacity>
                        </View>

                        {isCostingFetching ? (
                          <View style={styles.detailLoadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.detailLoadingText}>
                              Loading costing records...
                            </Text>
                          </View>
                        ) : eventCostingItems.length === 0 ? (
                          <View style={styles.detailEmptyContainer}>
                            <Text style={styles.detailEmptyText}>
                              No costing records found for this event.
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.tableCard}>
                            <View style={[styles.tableHeaderRow, { backgroundColor: '#F0ECE1' }]}>
                              <Text style={[styles.tableHeadCell, { flex: 1.5 }]}>
                                Vendor
                              </Text>
                              <Text style={[styles.tableHeadCell, { flex: 2 }]}>
                                Description
                              </Text>
                              <Text
                                style={[
                                  styles.tableHeadCell,
                                  { flex: 0.8, textAlign: 'center' },
                                ]}
                              >
                                Qty
                              </Text>
                              <Text
                                style={[
                                  styles.tableHeadCell,
                                  { flex: 1, textAlign: 'right' },
                                ]}
                              >
                                Rate
                              </Text>
                              <Text
                                style={[
                                  styles.tableHeadCell,
                                  { flex: 1.2, textAlign: 'right' },
                                ]}
                              >
                                Total
                              </Text>
                            </View>
                            {eventCostingItems.map((cItem, cIdx) => {
                              const cQty = parseFloat(cItem.quantity) || 0;
                              const cRate = parseFloat(cItem.rates) || 0;
                              const cTotal = cQty * cRate;
                              return (
                                <View
                                  key={cItem.id || cIdx}
                                  style={styles.tableBodyRow}
                                >
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      { flex: 1.5, fontWeight: 'bold' },
                                    ]}
                                    numberOfLines={2}
                                  >
                                    {cItem.supplier || `Supplier #${cItem.supplier_id}`}
                                  </Text>
                                  <Text
                                    style={[styles.tableBodyCell, { flex: 2 }]}
                                    numberOfLines={2}
                                  >
                                    {cItem.description || '-'}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      { flex: 0.8, textAlign: 'center' },
                                    ]}
                                  >
                                    {cItem.quantity}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      { flex: 1, textAlign: 'right' },
                                    ]}
                                  >
                                    {cItem.rates}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.tableBodyCell,
                                      {
                                        flex: 1.2,
                                        textAlign: 'right',
                                        fontWeight: 'bold',
                                        color: '#1a365d',
                                      },
                                    ]}
                                  >
                                    {Math.round(cTotal).toLocaleString()}
                                  </Text>
                                </View>
                              );
                            })}
                            <View style={styles.costingSummaryFooter}>
                              <Text style={styles.costingSummaryLabel}>
                                Total Event Expense:
                              </Text>
                              <Text style={styles.costingSummaryValue}>
                                Rs. {Math.round(totalEventExpense).toLocaleString()}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.viewDetailBtn,
                        isSelected && { backgroundColor: Colors.primary },
                      ]}
                      onPress={() => setSelectedEvent(isSelected ? null : item)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.viewDetailBtnText,
                          isSelected && { color: '#FFFFFF' },
                        ]}
                      >
                        {isSelected ? 'Hide Breakdown' : 'View Breakdown'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.costingCardBtn}
                      onPress={() => onNavigateToCosting?.(item)}
                      activeOpacity={0.8}
                    >
                      <CalculatorIcon size={14} color="#FFFFFF" />
                      <Text style={styles.costingCardBtnText}>Event Cost</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editCardBtn}
                      onPress={() => handleEditClick(item)}
                      activeOpacity={0.8}
                    >
                      <EditIcon size={14} color="#FFFFFF" />
                      <Text style={styles.editCardBtnText}>Update Order</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Shortage Item Modal */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsAddModalOpen(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Add Return / Shortage Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Item Name"
              placeholderTextColor={Colors.textMuted}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <View style={styles.modalTwoCol}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.modalInputLabel}>Qty In</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={newItemQtyIn}
                  onChangeText={setNewItemQtyIn}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.modalInputLabel}>Qty Out</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={newItemQtyOut}
                  onChangeText={setNewItemQtyOut}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleAddShortageItem}
            >
              <Text style={styles.modalSubmitButtonText}>Add Item</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Costing Item Modal */}
      <Modal
        visible={isAddCostingModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddCostingModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsAddCostingModalOpen(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Add Costing Item</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Vendor Name"
              placeholderTextColor={Colors.textMuted}
              value={newVendor}
              onChangeText={setNewVendor}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Product Description"
              placeholderTextColor={Colors.textMuted}
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View style={styles.modalTwoCol}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.modalInputLabel}>Qty</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={newQty}
                  onChangeText={setNewQty}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.modalInputLabel}>Rate</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={newRate}
                  onChangeText={setNewRate}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSubmitButton}
              onPress={handleAddCostingItem}
            >
              <Text style={styles.modalSubmitButtonText}>Add Costing Item</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0EBE5',
    borderRadius: Spacing.borderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Spacing.borderRadius.sm,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: Typography.fontWeight.bold,
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
  sectionHeadingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  loadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  emptyBox: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  eventsListContainer: {
    marginBottom: Spacing.lg,
  },
  eventCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF5F5',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardOrderNo: {
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
    color: Colors.textMuted,
  },
  cardCode: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeTentative: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeConfirmed: {
    backgroundColor: '#DEF7EC',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextTentative: {
    color: '#92400E',
  },
  statusTextConfirmed: {
    color: '#03543F',
  },
  cardContentBody: {
    marginVertical: 4,
  },
  cardCustomerName: {
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoLineText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  cardFinancialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAF8F5',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  financeLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  financeValue: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  viewDetailBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  viewDetailBtnText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  costingCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E7D3B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  costingCardBtnText: {
    fontSize: Typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  editCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  editCardBtnText: {
    fontSize: Typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryCard: {
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
  fCodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fCodeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fCodeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  fCodeValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  editOrderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e7e34',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  editOrderPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dividerLine: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '50%',
    marginBottom: Spacing.md,
    paddingRight: Spacing.xs,
  },
  cellHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cellLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  cellValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  closeDetailButton: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  closeDetailButtonText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: '600',
    color: Colors.primary,
  },
  shortageCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  shortageHeaderBar: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shortageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortageTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginLeft: Spacing.xs,
  },
  addShortageButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addShortageButtonText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: -2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F5EBE8',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  tableHeadCell: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableBodyCell: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  shortageHighlightText: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accentRed,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FAF8F5',
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.borderRadius.sm,
    height: 44,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm + 1,
    marginBottom: Spacing.md,
  },
  modalInputLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalTwoCol: {
    flexDirection: 'row',
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: Spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalSubmitButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  breakdownHeaderBar: {
    backgroundColor: '#F5EFE6',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.borderRadius.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownHeaderTitle: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  breakdownTitle: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  addCostingLink: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EBDCC8',
  },
  addCostingLinkText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  costingSummaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
  },
  costingSummaryLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  costingSummaryValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  detailLoadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailLoadingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  detailEmptyContainer: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailEmptyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
});
