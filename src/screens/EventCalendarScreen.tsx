import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { ScreenHeader } from '../components/common/ScreenHeader';
import {
  CalendarIcon,
  LocationIcon,
  UserOutlineIcon,
  PhoneIcon,
  FileTextIcon,
  RefreshIcon,
  TrashIcon,
  PrinterIcon,
  EditIcon,
  WalletIcon,
} from '../components/common/Icons';
import { Colors, Typography, Spacing } from '../constants';

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
  onBack: () => void;
  onHome: () => void;
}

export const EventCalendarScreen: React.FC<EventCalendarScreenProps> = ({
  eventData,
  onBack,
  onHome,
}) => {
  const currentEvent = eventData || {
    fCode: 'BS-F-0001',
    dateTime: '08/01/2026 • 02:35 PM',
    venue: 'Share Faisal',
    guestCount: '200',
    contactNo: '03009296413',
    bookingManager: 'Madiha Imtiaz',
    specialNotes: 'Setup start from one day before',
  };

  const [shortageItems, setShortageItems] = useState<ShortageItem[]>([
    { id: '1', item: 'Akhtar floor', qtyIn: '0', qtyOut: '4', shortage: '1' },
    { id: '2', item: 'Ayaz Panel', qtyIn: '0', qtyOut: '0', shortage: '0' },
  ]);

  const [costingItems, setCostingItems] = useState<CostingItem[]>([
    { id: '1', vendor: 'Abid contractor', description: '', qty: '0', rate: '0', total: '0.00' },
    { id: '2', vendor: 'Ashok night', description: '', qty: '0', rate: '0', total: '0.00' },
    { id: '3', vendor: 'Select Vendor', description: '', qty: '0', rate: '0', total: '0.00' },
    { id: '4', vendor: 'Select Vendor', description: '', qty: '0', rate: '0', total: '0.00' },
    { id: '5', vendor: 'Ahsan Inspectum SMD (Screen)', description: 'sskaksha', qty: '1', rate: '1000', total: '1,000.00' },
    { id: '6', vendor: 'Abdullah Catering', description: '', qty: '0', rate: '0', total: '0.00' },
    { id: '7', vendor: 'Select Vendor', description: 'rfvrfvrfvrfvf', qty: '4', rate: '555', total: '2,220.00' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQtyIn, setNewItemQtyIn] = useState('');
  const [newItemQtyOut, setNewItemQtyOut] = useState('');

  const [isAddCostingModalOpen, setIsAddCostingModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newRate, setNewRate] = useState('');

  const handleAddShortageItem = () => {
    if (!newItemName) return;
    const qIn = parseInt(newItemQtyIn, 10) || 0;
    const qOut = parseInt(newItemQtyOut, 10) || 0;
    const calcShortage = Math.max(0, qOut - qIn).toString();

    setShortageItems((prev) => [
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
    setShortageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCostingItem = () => {
    if (!newVendor) return;
    const q = parseFloat(newQty) || 0;
    const r = parseFloat(newRate) || 0;
    const itemTotal = q * r;
    const formattedTotal = itemTotal > 0 ? itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';

    setCostingItems((prev) => [
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
    setCostingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditEvent = () => {
    Alert.alert('Edit Event', 'Event details can now be updated.');
  };

  const handleExport = () => {
    Alert.alert('Export Event', 'Event details, shortage, and costing report generated as PDF.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Event Details"
        onBackPress={onBack}
        onHomePress={onHome}
        rightElement={
          <TouchableOpacity onPress={handleEditEvent} activeOpacity={0.7}>
            <EditIcon size={20} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.fCodeHeaderRow}>
            <View style={styles.fCodeIconBox}>
              <CalendarIcon size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.fCodeLabel}>F Code</Text>
              <Text style={styles.fCodeValue}>{currentEvent.fCode}</Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.gridCell}>
              <View style={styles.cellHeaderRow}>
                <CalendarIcon size={14} color={Colors.primary} />
                <Text style={styles.cellLabel}>Date & Time</Text>
              </View>
              <Text style={styles.cellValue}>{currentEvent.dateTime}</Text>
            </View>

            <View style={styles.gridCell}>
              <View style={styles.cellHeaderRow}>
                <LocationIcon size={14} color={Colors.primary} />
                <Text style={styles.cellLabel}>Venue</Text>
              </View>
              <Text style={styles.cellValue}>{currentEvent.venue}</Text>
            </View>

            <View style={styles.gridCell}>
              <View style={styles.cellHeaderRow}>
                <UserOutlineIcon size={14} color={Colors.primary} />
                <Text style={styles.cellLabel}>Guest</Text>
              </View>
              <Text style={styles.cellValue}>{currentEvent.guestCount}</Text>
            </View>

            <View style={styles.gridCell}>
              <View style={styles.cellHeaderRow}>
                <PhoneIcon size={14} color={Colors.primary} />
                <Text style={styles.cellLabel}>Contact</Text>
              </View>
              <Text style={styles.cellValue}>{currentEvent.contactNo}</Text>
            </View>

            <View style={styles.gridCell}>
              <View style={styles.cellHeaderRow}>
                <UserOutlineIcon size={14} color={Colors.primary} />
                <Text style={styles.cellLabel}>Booking Manager</Text>
              </View>
              <Text style={styles.cellValue}>{currentEvent.bookingManager}</Text>
            </View>

            <View style={styles.gridCell}>
              <View style={styles.cellHeaderRow}>
                <FileTextIcon size={14} color={Colors.primary} />
                <Text style={styles.cellLabel}>Special Notes</Text>
              </View>
              <Text style={styles.cellValue}>{currentEvent.specialNotes}</Text>
            </View>
          </View>
        </View>

        {/* Return / Shortage Section */}
        <View style={styles.shortageCard}>
          <View style={styles.shortageHeaderBar}>
            <View style={styles.shortageTitleRow}>
              <RefreshIcon size={16} color="#FFFFFF" />
              <Text style={styles.shortageTitle}>Return / Shortage</Text>
            </View>
            <TouchableOpacity
              style={styles.addShortageButton}
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addShortageButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Shortage Table */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeadCell, { flex: 2 }]}>Item</Text>
            <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Qty In</Text>
            <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Qty Out</Text>
            <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Shortage</Text>
            <Text style={[styles.tableHeadCell, { flex: 0.8, textAlign: 'center' }]}>Action</Text>
          </View>

          {shortageItems.map((item) => {
            const hasShortage = parseInt(item.shortage, 10) > 0;
            return (
              <View key={item.id} style={styles.tableBodyRow}>
                <Text style={[styles.tableBodyCell, { flex: 2 }]}>{item.item}</Text>
                <Text style={[styles.tableBodyCell, { flex: 1, textAlign: 'center' }]}>{item.qtyIn}</Text>
                <Text style={[styles.tableBodyCell, { flex: 1, textAlign: 'center' }]}>{item.qtyOut}</Text>
                <Text
                  style={[
                    styles.tableBodyCell,
                    { flex: 1, textAlign: 'center' },
                    hasShortage && styles.shortageHighlightText,
                  ]}
                >
                  {item.shortage}
                </Text>
                <TouchableOpacity
                  style={{ flex: 0.8, alignItems: 'center' }}
                  onPress={() => handleRemoveShortageItem(item.id)}
                >
                  <TrashIcon size={16} color={Colors.accentRed} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Costing Section (Placed Right Below Return / Shortage Table) */}
        <View style={styles.shortageCard}>
          <View style={styles.shortageHeaderBar}>
            <View style={styles.shortageTitleRow}>
              <WalletIcon size={18} color="#FFFFFF" />
              <Text style={styles.shortageTitle}>Costing</Text>
            </View>
            <TouchableOpacity
              style={styles.addShortageButton}
              onPress={() => setIsAddCostingModalOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addShortageButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Costing Table */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeadCell, { flex: 1.8 }]}>Vendor</Text>
            <Text style={[styles.tableHeadCell, { flex: 2 }]}>Product Description</Text>
            <Text style={[styles.tableHeadCell, { flex: 0.8, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeadCell, { flex: 1, textAlign: 'center' }]}>Rate</Text>
            <Text style={[styles.tableHeadCell, { flex: 1.2, textAlign: 'right' }]}>Total</Text>
            <Text style={[styles.tableHeadCell, { flex: 0.8, textAlign: 'center' }]}>Action</Text>
          </View>

          {costingItems.map((item) => (
            <View key={item.id} style={styles.tableBodyRow}>
              <Text style={[styles.tableBodyCell, { flex: 1.8, fontWeight: '600' }]} numberOfLines={1}>
                {item.vendor}
              </Text>
              <Text style={[styles.tableBodyCell, { flex: 2, color: Colors.textSecondary }]} numberOfLines={1}>
                {item.description || '-'}
              </Text>
              <Text style={[styles.tableBodyCell, { flex: 0.8, textAlign: 'center' }]}>{item.qty}</Text>
              <Text style={[styles.tableBodyCell, { flex: 1, textAlign: 'center' }]}>{item.rate}</Text>
              <Text style={[styles.tableBodyCell, { flex: 1.2, textAlign: 'right', fontWeight: 'bold' }]}>
                {item.total}
              </Text>
              <TouchableOpacity
                style={{ flex: 0.8, alignItems: 'center' }}
                onPress={() => handleRemoveCostingItem(item.id)}
              >
                <TrashIcon size={16} color={Colors.accentRed} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom Export / Download Button */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          activeOpacity={0.85}
        >
          <PrinterIcon size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Export / Download</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Shortage Item Modal */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAddModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
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
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAddCostingModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
  exportButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: Spacing.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  exportButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginLeft: Spacing.xs + 2,
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
});
