import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import customerApi from '../../../api/customerApi';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(width * 0.48, 520);

// ─── Icons ────────────────────────────────────────────────────
const SearchIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke="#94A3B8" strokeWidth="2" />
    <Path d="M21 21L16.65 16.65" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FilterIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6" x2="21" y2="6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <Line x1="7" y1="12" x2="17" y2="12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <Line x1="11" y1="18" x2="13" y2="18" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ArrowIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19M12 5L19 12L12 19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="#8BA367" strokeWidth="2" />
    <Path d="M12 7V12L15 15" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = ({ color = '#475569' }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Order History Sub-Modal ────────────────────────────────────
const HistoryModal = ({ visible, onClose, orders }) => (
  <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
    <View style={s.historyOverlay}>
      <View style={s.historyCard}>
        <View style={s.historyHeader}>
          <Text style={s.historyTitle}>📋 Lịch sử mua hàng</Text>
          <TouchableOpacity style={s.closeBtnInner} onPress={onClose}>
            <CloseIcon />
          </TouchableOpacity>
        </View>
        {orders.length === 0 ? (
          <View style={s.historyEmpty}>
            <Text style={s.historyEmptyText}>Chưa có đơn hàng nào</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={s.historySep} />}
            renderItem={({ item }) => (
              <View style={s.historyItem}>
                <View>
                  <Text style={s.historyOrderId}>#{item.idHoaDon || item.id}</Text>
                  <Text style={s.historyDate}>{item.ngayTao || item.createdAt || ''}</Text>
                </View>
                <Text style={s.historyAmount}>
                  {(item.tongTien || 0).toLocaleString('vi-VN')}đ
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  </Modal>
);

// ─── Main Component ─────────────────────────────────────────────
const MemberModal = ({ visible, onClose, onApplyMember, onRegisterNew, initialMember, initialPoints }) => {
  const [phone, setPhone] = useState('');
  const [foundMember, setFoundMember] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [pointsToUse, setPointsToUse] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (visible) {
      setFoundMember(initialMember || null);
      setPhone(initialMember ? (initialMember.soDienThoai || '') : '');
      setPointsToUse(initialPoints ? String(initialPoints) : '');
      setNotFound(false);
      setShowHistory(false);
      setHistory([]);
    }
  }, [visible, initialMember, initialPoints]);

  // Clear member when user changes phone
  const handlePhoneChange = useCallback((text) => {
    setPhone(text);
    if (foundMember) {
      setFoundMember(null);
      setNotFound(false);
      setPointsToUse('');
    }
  }, [foundMember]);

  const handleClear = useCallback(() => {
    setPhone('');
    setFoundMember(null);
    setNotFound(false);
    setPointsToUse('');
  }, []);

  const handleSearch = useCallback(async () => {
    const trimmed = phone.trim();
    if (trimmed.length < 6) return;
    setSearching(true);
    setFoundMember(null);
    setNotFound(false);
    try {
      const result = await customerApi.searchByPhone(trimmed);
      if (result) {
        setFoundMember(result);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }, [phone]);

  const handleViewHistory = useCallback(async () => {
    if (!foundMember) return;
    setLoadingHistory(true);
    try {
      // Try to fetch orders by customer id if API supports it
      const res = await customerApi.getById(foundMember.idKhachHang || foundMember.id);
      setHistory(res?.hoaDons || res?.orders || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
      setShowHistory(true);
    }
  }, [foundMember]);

  const handleDone = useCallback(() => {
    const pointsNum = parseInt(pointsToUse) || 0;
    if (foundMember && pointsNum > (foundMember.diemTichLuy || 0)) {
      // Logic safety: don't call parent if invalid
      return;
    }
    onApplyMember(foundMember, pointsNum);
    onClose();
  }, [foundMember, pointsToUse, onApplyMember, onClose]);

  const handleRegister = useCallback(() => {
    onClose();
    onRegisterNew(phone.trim());
  }, [phone, onClose, onRegisterNew]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* ── Dark overlay ── */}
      <View style={s.overlay} />

      <KeyboardAvoidingView
        style={s.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={0}
      >
        <View style={s.card}>

          {/* ── Close button ── */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <View style={s.closeBtnInner}>
              <CloseIcon />
            </View>
          </TouchableOpacity>

          {/* ── Header ── */}
          <Text style={s.title}>Khách hàng & Tích điểm</Text>
          <Text style={s.subtitle}>Định danh để áp dụng thẻ thành viên và hoàn điểm</Text>

          {/* ── Search Row: pill input + detached square button ── */}
          <View style={s.searchRow}>
            {/* Standalone capsule input */}
            <View style={s.searchPill}>
              <TextInput
                style={s.searchInput}
                placeholder="Tìm kiếm SDT..."
                placeholderTextColor="#A8B5C8"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>

            {/* Detached square search button */}
            <TouchableOpacity
              style={s.searchSquareBtn}
              onPress={handleSearch}
              disabled={searching}
              activeOpacity={0.75}
            >
              {searching
                ? <ActivityIndicator color="#8BA367" size="small" />
                : <SearchIcon />
              }
            </TouchableOpacity>
          </View>

          {/* "Xóa khách" button — shows when member selected */}
          {foundMember && (
            <TouchableOpacity style={s.clearBtn} onPress={handleClear}>
              <Text style={s.clearBtnText}>✕  Xóa khách</Text>
            </TouchableOpacity>
          )}

          {/* ── Member Card ── */}
          {foundMember && (
            <LinearGradient
              colors={['#4A7C3F', '#2D5A27', '#1B3B14']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.memberCard}
            >
              {/* Decor circles */}
              <View style={s.cardDecorCircle1} />
              <View style={s.cardDecorCircle2} />

              {/* ── Row 1: Avatar + Name + Phone ── */}
              <View style={s.memberTopRow}>
                <View style={s.memberAvatarWrap}>
                  <Text style={s.memberAvatarText}>
                    {foundMember.hoTen?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={s.memberNameBlock}>
                  <Text style={s.memberName}>{foundMember.hoTen}</Text>
                  <Text style={s.memberPhone}>{foundMember.soDienThoai || phone}</Text>
                </View>
                {/* Status badge top-right */}
                <View style={s.memberStatusBadge}>
                  <Text style={s.memberStatusText}>
                    {foundMember.trangThai === 'DANG_HOAT_DONG' ? '● Hoạt động' : foundMember.trangThai}
                  </Text>
                </View>
              </View>

              {/* Separator */}
              <View style={s.cardDivider} />

              {/* ── Row 2: Stats ── */}
              <View style={s.memberStatsRow}>
                <View style={s.memberStat}>
                  <Text style={s.memberStatLabel}>Hạng</Text>
                  <View style={s.memberBadge}>
                    <Text style={s.memberBadgeText}>🏅 {foundMember.hangThanhVien || 'MỚI'}</Text>
                  </View>
                </View>
                <View style={s.memberStatDivider} />
                <View style={s.memberStat}>
                  <Text style={s.memberStatLabel}>Điểm hiện tại</Text>
                  <Text style={s.memberStatValue}>{(foundMember.diemTichLuy || 0).toLocaleString('vi-VN')}</Text>
                </View>
                <View style={s.memberStatDivider} />
                <View style={s.memberStat}>
                  <Text style={s.memberStatLabel}>Tổng đã tích</Text>
                  <Text style={s.memberStatValue}>{(foundMember.tongDiemDaTichLuy || 0).toLocaleString('vi-VN')}</Text>
                </View>
              </View>

              {/* ── Row 3: Points input + "Xem chi tiết" link ── */}
              <View style={s.cardBottomRow}>
                <View style={s.pointsInputRow}>
                  <Text style={[
                    s.pointsInputLabel,
                    foundMember && (parseInt(pointsToUse) || 0) > (foundMember.diemTichLuy || 0) && { color: '#FCA5A5' }
                  ]}>
                    {foundMember && (parseInt(pointsToUse) || 0) > (foundMember.diemTichLuy || 0) 
                      ? '⚠ Vượt quá điểm!' 
                      : 'Dùng điểm (1đ=1.000đ):'
                    }
                  </Text>
                  <TextInput
                    style={[
                      s.pointsInput,
                      foundMember && (parseInt(pointsToUse) || 0) > (foundMember.diemTichLuy || 0) && s.pointsInputError
                    ]}
                    value={pointsToUse}
                    onChangeText={setPointsToUse}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <TouchableOpacity style={s.detailBtn} onPress={handleViewHistory} disabled={loadingHistory}>
                  {loadingHistory
                    ? <ActivityIndicator color="#8BA367" size="small" />
                    : <Text style={s.detailBtnText}>Xem chi tiết →</Text>
                  }
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}


          {/* ── Not Found ── */}
          {notFound && !foundMember && (
            <View style={s.notFoundBox}>
              <Text style={s.notFoundTitle}>Chưa có thành viên?</Text>
              <Text style={s.notFoundSub}>
                Số điện thoại này chưa được đăng ký trong hệ thống.
              </Text>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#8BA367', '#5C7A42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.registerBtn}
                >
                  <Text style={s.registerBtnText}>+ Đăng ký thành viên mới</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Done button ── */}
          <TouchableOpacity 
            onPress={handleDone} 
            activeOpacity={0.85} 
            style={{ marginTop: 16 }}
            disabled={foundMember && (parseInt(pointsToUse) || 0) > (foundMember.diemTichLuy || 0)}
          >
            <LinearGradient
              colors={
                foundMember 
                  ? (parseInt(pointsToUse) || 0) > (foundMember.diemTichLuy || 0)
                    ? ['#94A3B8', '#64748B'] // Cleaner disabled gradient
                    : ['#4A7C3F', '#2D5A27', '#1B3B14'] 
                  : ['#1E293B', '#334155']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.doneBtn}
            >
              <Text style={s.doneBtnText}>
                {foundMember ? '✓  Áp dụng thành viên' : 'Hoàn tất'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── History sub-modal ── */}
      <HistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        orders={history}
      />
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 18, 30, 0.6)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: MODAL_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },

  // Close
  closeBtn: { position: 'absolute', top: 18, right: 18, zIndex: 10 },
  closeBtnInner: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },

  // Header
  title: {
    fontSize: 24, fontWeight: '800',
    color: '#1B2A15',
    textAlign: 'center',
    marginBottom: 6, marginTop: 4,
  },
  subtitle: {
    fontSize: 13, color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },

  // Search — pill input + detached square button
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  searchPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B2A15',
    paddingVertical: 14,
  },
  searchSquareBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },

  // Clear button
  clearBtn: {
    alignSelf: 'flex-end',
    borderWidth: 1, borderColor: '#FCA5A5',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    marginBottom: 14,
  },
  clearBtnText: {
    fontSize: 12, fontWeight: '600',
    color: '#DC2626',
  },

  // Member Card — redesigned
  memberCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#1B3B14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardDecorCircle1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -30,
  },
  cardDecorCircle2: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 80,
  },

  // Row 1: Avatar + Name
  memberTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14,
  },
  memberAvatarWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  memberAvatarText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  memberNameBlock: { flex: 1 },
  memberName: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  memberPhone: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  memberStatusBadge: {
    backgroundColor: 'rgba(134,239,172,0.2)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(134,239,172,0.4)',
  },
  memberStatusText: { fontSize: 10, fontWeight: '700', color: '#86EFAC' },

  // Divider
  cardDivider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 14,
  },

  // Row 2: Stats
  memberStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  memberStat: { flex: 1, alignItems: 'center' },
  memberStatDivider: {
    width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  memberStatLabel: {
    fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  memberStatValue: {
    fontSize: 18, fontWeight: '800', color: '#FFFFFF',
  },
  memberBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  memberBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // Row 3: Points input + detail link
  cardBottomRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
  },
  pointsInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pointsInputLabel: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', flex: 1,
  },
  pointsInput: {
    width: 80, height: 42,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    fontSize: 17, fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 0, // Fix vertical alignment on some android versions
  },
  pointsInputError: {
    borderColor: '#FCA5A5',
    backgroundColor: 'rgba(252,165,165,0.1)',
  },
  detailBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  detailBtnText: {
    fontSize: 12, fontWeight: '700', color: '#FFFFFF',
  },

  // Not Found
  notFoundBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20, padding: 20,
    marginBottom: 4,
    borderWidth: 1, borderColor: '#FDE68A',
    alignItems: 'center',
  },
  notFoundTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#92400E', marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 13, color: '#B45309',
    textAlign: 'center', marginBottom: 16, lineHeight: 18,
  },
  registerBtn: {
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  registerBtnText: {
    fontSize: 15, fontWeight: '700', color: '#FFFFFF',
  },

  // Done
  doneBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4,
  },

  // History sub-modal
  historyOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(10,18,30,0.4)',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1, shadowRadius: 20,
    elevation: 20,
  },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18, fontWeight: '800', color: '#1B2A15',
  },
  historyEmpty: {
    paddingVertical: 40, alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 15, color: '#94A3B8',
  },
  historySep: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6 },
  historyItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  historyOrderId: {
    fontSize: 15, fontWeight: '700', color: '#1E293B',
  },
  historyDate: {
    fontSize: 12, color: '#94A3B8', marginTop: 2,
  },
  historyAmount: {
    fontSize: 16, fontWeight: '800', color: '#8BA367',
  },
});

export default MemberModal;
