import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 16) / 2; // horizontal padding 16*2, gap 16.

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBg: {
    flex: 1,
  },
  // --- Header ---
  headerContainer: {
    width: '100%',
    height: Platform.OS === 'ios' ? 140 : 120, // Tăng thêm height để nới rộng header
    position: 'absolute',
    top: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerDecorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.08,
  },
  leaf1: { position: 'absolute', left: 52, top: 0, transform: [{ rotate: '12deg' }] },
  leaf2: { position: 'absolute', left: 193, top: 133, transform: [{ rotate: '-45deg' }] },
  leaf3: { position: 'absolute', left: 243, top: -48, transform: [{ rotate: '-12deg' }] },
  leafText: { fontSize: 80, color: '#0A0A0A' },
  headerContent: {
    width: width - 32,
    height: 48,
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 60 : 40, // Đẩy avatar và thông tin xuống
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 11,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarInitials: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  roleText: {
    color: 'rgba(208, 250, 229, 0.80)',
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '300',
  },
  nameText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  notiBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FB2C36',
    borderWidth: 2,
    borderColor: '#006045',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  // --- Main Tab Bar ---
  topTabBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 115 : 95, // Đẩy Tab bar xuống khớp với header mới
    width: '100%',
    alignItems: 'center',
    zIndex: 20,
  },
  topTabBar: {
    width: width - 20,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  topTabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTabBtnActive: {
    backgroundColor: 'rgba(193.70, 193.70, 193.70, 0.53)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.40)',
  },
  topTabText: {
    color: 'rgba(208, 250, 229, 0.90)',
    fontSize: 14,
    fontWeight: '600',
  },
  topTabTextActive: {
    color: 'white',
  },

  // --- List ---
  listContent: {
    paddingTop: Platform.OS === 'ios' ? 190 : 170, // Đẩy danh sách xuống để không bị che
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  sectionTitleWrap: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1E2939',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  sectionSubtitle: {
    color: '#4A5565',
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // --- Table Card ---
  tableCard: {
    width: CARD_WIDTH,
    height: 160.5,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  cardDecorBL: {
    position: 'absolute',
    left: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderTopRightRadius: 80,
  },
  cardDecorTR: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 80,
    height: 80,
    borderBottomLeftRadius: 100,
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableName: {
    color: '#1E2939',
    fontSize: 18,
    fontWeight: '700',
  },
  badgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 33554400,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.45,
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  capacityText: {
    color: '#364153',
    fontSize: 14,
    fontWeight: '500',
  },
  capacityIcon: {
    width: 16,
    height: 16,
    opacity: 0.7,
  },
  cardBottomWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.40)',
    paddingTop: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLabel: {
    color: '#4A5565',
    fontSize: 9,
    fontWeight: '300',
    letterSpacing: 0.22,
  },
  amountValue: {
    color: '#1E2939',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyStatusText: {
    color: '#99A1AF',
    fontSize: 12,
    fontWeight: '300',
    paddingTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  timeWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: {
    color: '#4A5565',
    fontSize: 12,
    fontWeight: '300',
  },

  // --- Takeaway Card ---
  takeawayCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // --- Bottom Nav ---
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 25,
    width: '100%',
    alignItems: 'center',
  },
  bottomNavContainer: {
    width: width - 30,
    height: 55,
    backgroundColor: '#EAF5E2',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  bottomNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 41,
    borderRadius: 30,
    paddingHorizontal: 16,
    gap: 8,
  },
  bottomNavBtnActive: {
    backgroundColor: '#D9D9D9',
  },
  bottomNavText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '500',
  },
});
