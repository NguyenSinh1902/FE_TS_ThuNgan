import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1E2939',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notiIconWrap: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FB2C36',
    position: 'absolute',
    top: 0,
    right: -2,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8BA367',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  tabToggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#ECECF0',
    borderRadius: 24,
    padding: 6,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    height: 43,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  tabBtnActive: {
    backgroundColor: '#8BA367',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  tabTextActive: {
    color: 'white',
  },
  listContent: {
    paddingTop: Platform.OS === 'ios' ? 190 : 170, // Đẩy xuống bằng với Tab 'Tại bàn'
    paddingHorizontal: 16,
    paddingBottom: 110, 
  },
  card: {
    height: 188,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
  },
  cardInner: {
    flex: 1,
    padding: 22,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: 28,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    lineHeight: 20,
  },
  statusBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 33554400,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clockIconWrap: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A5565',
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});
