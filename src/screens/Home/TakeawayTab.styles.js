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
    marginBottom: 20,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '32%',
    minWidth: '32%',
    borderRadius: 20,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  cardGradientContent: {
    flex: 1,
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  headerRowObj: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeInline: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeTextInline: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  customerRowObj: {
    marginBottom: 16,
  },
  customerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  phoneText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  orderIdText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },

  row2: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 16,
  },
  amountTextLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 6,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D32F2F',
  },

  row4: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  timeTextObj: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    fontVariant: ['tabular-nums'],
  },

  watermarkListWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    zIndex: -1,
    pointerEvents: 'none',
  },
  watermarkDelivery: { position: 'absolute', top: 50, left: 100, fontSize: 160, transform: [{ rotate: '-20deg' }] },
  watermarkBag: { position: 'absolute', bottom: 100, right: 80, fontSize: 200, transform: [{ rotate: '15deg' }] },
});
