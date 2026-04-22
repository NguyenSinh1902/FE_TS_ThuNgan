import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F0F2F5',
  },

  // SIDEBAR
  sidebar: {
    backgroundColor: '#F0FDF4',
    paddingTop: 45, // Đẩy content xuống để né status bar nhưng vẫn giữ nền xanh tràn lên trên
    paddingBottom: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 20,
  },
  sidebarHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
    padding: 12,
    borderRadius: 15,
    marginBottom: 24,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appTitleWrapper: { flex: 1 },
  appTitle: { fontSize: 14, fontWeight: '900', color: '#1B5E20' }, // Thu nhỏ xíu để hết bị ẩn
  appSubtitle: { fontSize: 12, color: '#4CAF50' },

  sidebarBody: {
    flex: 1,
    borderRadius: 30,
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 8,
    overflow: 'hidden', // Yêu cầu để bọc Gradient
    position: 'relative',
  },
  sidebarGradientInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  navIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFFFFF', marginRight: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  navText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  sidebarFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C8E6C9',
    padding: 12,
    borderRadius: 15,
    marginTop: 24,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF', marginRight: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  userName: { fontSize: 15, fontWeight: '800', color: '#1B5E20' },
  shiftText: { fontSize: 12, color: '#4CAF50', fontWeight: '600', marginTop: 2 },

  // MAIN CONTENT & HEADER
  mainContent: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    position: 'relative',
    overflow: 'hidden',
  },

  watermark1: { position: 'absolute', top: '10%', left: '5%', fontSize: 130, opacity: 0.05, transform: [{ rotate: '-20deg' }] },
  watermark2: { position: 'absolute', bottom: '15%', right: '8%', fontSize: 160, opacity: 0.06, transform: [{ rotate: '15deg' }] },
  watermark3: { position: 'absolute', top: '40%', right: '-5%', fontSize: 180, opacity: 0.04, transform: [{ rotate: '45deg' }] },
  watermark4: { position: 'absolute', top: '30%', left: '30%', fontSize: 100, opacity: 0.05, transform: [{ rotate: '-45deg' }] },

  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 45,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 10,
  },

  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 100, // Hoàn toàn bo tròn
    height: 44,
    width: 280, // Dài ra theo yêu cầu
    padding: 4,
  },
  segmentBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 100 },
  segmentBtnActiveWrapper: { flex: 1, borderRadius: 100 },
  segmentBtnActive: {
    flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  segmentText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  segmentTextActive: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  statusDotRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    flex: 1, // Tràn ra giữa
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dotText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', height: 44,
    paddingHorizontal: 16, borderRadius: 22,
    width: 240, borderWidth: 1, borderColor: '#E2E8F0',
  },
  searchText: { color: '#94A3B8', marginLeft: 8, fontSize: 14 },
  iconBtnSquare: {
    width: 44, height: 44, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F5E9', // Xanh Matcha cực nhạt
  },

  // TABLE GRID
  listContent: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: 24,
    marginBottom: 24,
  },

  cardWrapper: {
    flex: 1,
    maxWidth: '23%',
    minHeight: 140,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    // Bóng đổ mượt mà xám nhạt
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardGradientContent: {
    flex: 1,
    padding: 20,
    borderRadius: 19, // Lọt lòng border
    justifyContent: 'center',
    // Bỏ overflow hidden để hiển thị được viền khuyết
  },

  ticketCutoutLeft: {
    position: 'absolute',
    left: -12,
    top: '48%',
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F0F2F5', // Nền Body
    borderRightWidth: 1.5,
    zIndex: 10,
  },
  ticketCutoutRight: {
    position: 'absolute',
    right: -12,
    top: '48%',
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F0F2F5', // Nền Body
    borderLeftWidth: 1.5,
    zIndex: 10,
  },
  ticketLine: {
    height: 1, borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderStyle: 'dashed',
    marginVertical: 14,
  },

  // Icon báo hiệu góc phải lòi ra
  floatingBellWrap: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: '#8BA367', // Matcha đậm
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  cardRow1: {
    flexDirection: 'row', // Chuyển tag lên cùng hàng với tên bàn
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  tableNameTicket: {
    fontSize: 18, // Thu nhỏ để cùng màu tiền và cùng hàng tag như yêu cầu
    fontWeight: '900',
  },
  // Glassmorphism Tag
  invoiceTagWrapObj: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  invoiceTagTextObj: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },

  cardRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRow2Text: {
    fontSize: 13,
    fontWeight: '800', // Khách và đồng hồ đậm hơn
    color: '#1E293B',
    marginLeft: 6,
  },
  timeTextObj: {
    fontSize: 13,
    fontWeight: '800', // Đậm và rõ hơn
    color: '#1E293B',
    marginLeft: 6,
    fontVariant: ['tabular-nums'], // Số thẳng cột đẹp
  },

  cardRow3: {
    marginTop: 12,
  },
  amountTextObj: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D32F2F', // Đỏ đô cực nổi
  },
});
