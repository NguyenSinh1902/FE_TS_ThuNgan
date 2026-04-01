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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    gap: 16,
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Summary Area
  summaryCard: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#8BA367',
    marginBottom: 6,
  },
  summaryOrderId: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // Payment Methods
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'transparent', // Explicitly transparent
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
    gap: 16,
  },
  methodCardActive: {
    backgroundColor: 'rgba(139, 163, 103, 0.15)',
    borderColor: '#8BA367',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(153, 161, 175, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxActive: {
    backgroundColor: '#8BA367',
  },
  methodInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  methodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    backgroundColor: 'transparent',
  },
  methodDesc: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    backgroundColor: 'transparent',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    borderColor: '#8BA367',
    backgroundColor: '#FFFFFF',
  },

  // QR Transfer Styles
  qrCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    marginHorizontal: 30,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  bankInfoContainer: {
    alignItems: 'center',
    gap: 4,
  },
  bankRow: {
    flexDirection: 'row',
    gap: 4,
  },
  bankLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  bankValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  transferNote: {
    backgroundColor: 'rgba(139, 163, 103, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 16,
  },
  transferNoteText: {
    fontSize: 14,
    color: '#8BA367',
    fontWeight: '600',
  },
  qrHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  qrHintText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Actions
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
  },
  exportBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8BA367',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  exportBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8BA367',
  },
  confirmBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8BA367',
    shadowColor: '#8BA367',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
