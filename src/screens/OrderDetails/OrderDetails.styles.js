import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBg: {
    flex: 1,
  },
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginLeft: -10, // Adjust for back button centering
  },
  editBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Progress Stepper
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'relative',
    marginBottom: 30,
  },
  stepperLine: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepperLineActive: {
    position: 'absolute',
    top: 20,
    left: 40,
    width: '25%', // Adjust based on current step
    height: 2,
    backgroundColor: '#8BA367',
    zIndex: 2,
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 10,
    width: 60,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepCircleActive: {
    backgroundColor: '#8BA367',
  },
  stepText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#8BA367',
    fontWeight: '600',
  },

  // Order Info Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderTitleLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderIdText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusBadge: {
    backgroundColor: 'rgba(139, 163, 103, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#8BA367',
    fontSize: 12,
    fontWeight: '500',
  },

  // Item List
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  itemEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  qtyBadge: {
    backgroundColor: 'rgba(139, 163, 103, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qtyText: {
    color: '#8BA367',
    fontSize: 12,
    fontWeight: '600',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemDetails: {
    fontSize: 13,
    color: '#64748B',
  },
  itemPriceSection: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Member Section
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  memberTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    color: '#94A3B8',
    fontSize: 15,
  },
  searchBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#8BA367',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Total Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 16,
    color: '#64748B',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    color: '#1E293B',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8BA367',
  },

  // Footer Button
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  payBtn: {
    height: 56,
    backgroundColor: '#8BA367',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8BA367',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusList: {
    padding: 16,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 16,
  },
  statusItemActive: {
    backgroundColor: 'rgba(139, 163, 103, 0.05)',
    borderColor: 'rgba(139, 163, 103, 0.3)',
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabelContainer: {
    flex: 1,
  },
  statusLabelMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusLabelSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 163, 103, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCloseBtn: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Member Search & Details
  memberCard: {
    backgroundColor: 'rgba(139, 163, 103, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 163, 103, 0.2)',
  },
  memberInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberRankText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  pointsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8BA367',
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8BA367',
    borderRadius: 3,
  },
  pointsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 163, 103, 0.1)',
  },
  pointsInputLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  pointsInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1E293B',
  },

  // Vouchers
  voucherSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 12,
  },
  voucherScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    gap: 12,
  },
  voucherCard: {
    width: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  voucherCardSelected: {
    backgroundColor: 'rgba(139, 163, 103, 0.05)',
    borderColor: '#8BA367',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  voucherSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#8BA367',
    borderColor: '#8BA367',
  },

  // Tax & Fees
  feeSection: {
    marginTop: 20,
    gap: 12,
  },
  feeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feeChipActive: {
    backgroundColor: '#8BA367',
    borderColor: '#8BA367',
  },
  feeChipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  feeChipTextActive: {
    color: '#FFFFFF',
  },
});
