import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 24,
  },

  // ── CARD ─────────────────────────────────────────────────
  cardWrapper: {
    flex: 1,
    maxWidth: '32%',
    minWidth: '32%',
    height: 180,
    borderRadius: 20,
    borderTopWidth: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    // shadow mặc định
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 7,
  },
  cardGradientContent: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  // ── ROW 1: Mã đơn + Đồng hồ ─────────────────────────────
  headerRowObj: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  timeWrap: {
    alignItems: 'flex-end',
  },
  timeTextObj: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // ── STATUS BADGE (dot + text) ────────────────────────────
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── ROW 2: Tóm tắt món (dòng phân cách nhẹ) ─────────────
  detailsRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  detailsText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },

  // ── ROW FOOTER: Khách hàng + Tổng tiền ──────────────────
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  customerLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  customerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  totalLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
    marginBottom: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
    textAlign: 'right',
  },

  // ── Watermark nền ────────────────────────────────────────
  watermarkListWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    zIndex: -1,
    pointerEvents: 'none',
  },
  watermarkDelivery: {
    position: 'absolute',
    top: 50,
    left: 100,
    fontSize: 160,
    transform: [{ rotate: '-20deg' }],
  },
  watermarkBag: {
    position: 'absolute',
    bottom: 100,
    right: 80,
    fontSize: 200,
    transform: [{ rotate: '15deg' }],
  },
});
