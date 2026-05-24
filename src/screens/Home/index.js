import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Users, Clock, Bell, Grid, FileText, BarChart2, Settings, User, Search, Sliders, Coffee } from 'lucide-react-native';
import tableApi from '../../api/tableApi';
import invoiceApi from '../../api/invoiceApi';
import staffApi from '../../api/staffApi';
import reservationApi from '../../api/reservationApi';
import safeAsyncStorage from '../../utils/storage';
import { listenToFirebase } from '../../utils/firebaseListener';
import TakeawayTab from './TakeawayTab';
import UserProfileModal from './components/UserProfileModal';
import FilterModal from './components/FilterModal';
import NotificationModal, { pushNotification } from './components/NotificationModal';
import CashierToast from '../../components/CashierToast';
import MenuTab from './components/MenuTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import styles from './Home.styles';
import { Alert } from 'react-native';
import HistoryTab from './components/HistoryTab';
import CustomAlert from '../../components/CustomAlert';

const getTableTheme = (status, invoiceStatus) => {
  let hasOuterGlow = false;
  let glowColor = 'transparent';
  let badgeProps = null;

  if (invoiceStatus) {
    if (invoiceStatus === 'CHO_THANH_TOAN') {
      hasOuterGlow = true; glowColor = '#FF3D00'; // Đỏ cam cực rực rỡ
      badgeProps = { label: 'Chờ thanh toán', bg: 'rgba(255,87,34, 0.15)', text: '#D84315' };
    }
    else if (invoiceStatus === 'CHO_LAY_MON') {
      hasOuterGlow = true; glowColor = '#FF3D00';
      badgeProps = { label: 'Chờ lấy món', bg: 'rgba(76,175,80, 0.15)', text: '#1B5E20' };
    }
    else if (invoiceStatus === 'DA_THANH_TOAN') {
      badgeProps = { label: 'Đã thanh toán', bg: 'rgba(129,199,132, 0.25)', text: '#2E7D32' };
    }
    else if (invoiceStatus === 'DANG_PHA_CHE') {
      badgeProps = { label: 'Đang pha chế', bg: 'rgba(66,165,245, 0.15)', text: '#1565C0' };
    }
    else if (invoiceStatus === 'CHO_XAC_NHAN') {
      badgeProps = { label: 'Chờ xác nhận', bg: 'rgba(59,130,246, 0.15)', text: '#1E3A8A' };
    }
    else if (invoiceStatus === 'DANG_PHUC_VU') {
      badgeProps = { label: 'Đang phục vụ', bg: 'rgba(139,195,74,0.15)', text: '#558B2F', border: 'rgba(139,195,74,0.5)' };
    }
    else if (invoiceStatus === 'HOAN_TAT') {
      badgeProps = { label: 'Hoàn tất', bg: 'rgba(158,158,158,0.15)', text: '#616161', border: 'rgba(158,158,158,0.4)' };
    }
    else if (invoiceStatus === 'DA_HUY') {
      badgeProps = { label: 'Đã hủy', bg: 'rgba(158,158,158,0.1)', text: '#616161', border: 'rgba(158,158,158,0.3)' };
    }
  }

  // Linear Gradients arrays cực dịu, màu bàn có khách đổi sang vàng nhạt, chữ màu đỏ theo yêu cầu
  if (status === 'RESERVED') return { gradient: ['#E0F2F1', '#B3E5FC'], border: '#B3E5FC', text: '#D32F2F', hasOuterGlow, glowColor, badgeProps };
  if (status === 'OCCUPIED') return { gradient: ['#FFFFFF', '#FFF3E0'], border: '#FFE0B2', text: '#D32F2F', hasOuterGlow, glowColor, badgeProps };
  return { gradient: ['#FFFFFF', '#ECEFF1'], border: '#CFD8DC', text: '#94A3B8', hasOuterGlow, glowColor, badgeProps };
};

const DurationTimer = React.memo(({ startTime }) => {
  const [stamp, setStamp] = useState(Date.now());

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => setStamp(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return <Text style={styles.timeTextObj}>00:00:00</Text>;

  let diff = Math.floor((stamp - new Date(startTime).getTime()) / 1000);
  if (diff < 0) diff = 0;

  const h = Math.floor(diff / 3600).toString().padStart(2, '0');
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
  const s = (diff % 60).toString().padStart(2, '0');

  return <Text style={styles.timeTextObj}>{h}:{m}:{s}</Text>;
});

const TableCard = React.memo(({ item, onNavigate }) => {
  const theme = useMemo(() => getTableTheme(item.status, item.invoice?.trangThai), [item.status, item.invoice?.trangThai]);

  let wrapperStyle = { borderColor: theme.border };
  if (theme.hasOuterGlow) {
    wrapperStyle = {
      ...wrapperStyle,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.8,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 0 },
      elevation: 20
    };
  }

  return (
    <View style={[styles.cardWrapper, wrapperStyle]}>
      {/* Background Gradient */}
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradientContent}>

        {/* Row 1 / Bố cục Tag dọc */}
        <View style={styles.cardRow1}>
          <Text style={[styles.tableNameTicket, { color: theme.text }]}>{item.name}</Text>
          {theme.badgeProps && (
            <View style={[styles.invoiceTagWrapObj, { backgroundColor: theme.badgeProps.bg }]}>
              <Text style={[styles.invoiceTagTextObj, { color: theme.badgeProps.text }]}>{theme.badgeProps.label}</Text>
            </View>
          )}
        </View>

        {/* Nét đứt ngăn cách */}
        <View style={styles.ticketLine} />

        {/* Ticket Cutouts đè lên viền trong lõi LinearGradient */}
        <View style={[styles.ticketCutoutLeft, { borderColor: theme.border }]} />
        <View style={[styles.ticketCutoutRight, { borderColor: theme.border }]} />

        {/* Row 2 - Cặp Icon Đối Xứng Khách và Đồng Hồ */}
        <View style={styles.cardRow2}>
          <View style={styles.timeWrap}>
            <Users size={16} color="#1E293B" strokeWidth={2.5} />
            <Text style={styles.cardRow2Text}>
              {item.status === 'AVAILABLE' ? `0 Khách` : `${item.reservation?.soLuongNguoi || 1} Khách`}
            </Text>
          </View>
          <View style={styles.timeWrap}>
            <Clock size={16} color="#1E293B" strokeWidth={2.5} />
            {item.status === 'RESERVED' && item.reservation?.thoiGianDat ? (
              <Text style={styles.timeTextObj}>
                {item.reservation.thoiGianDat.split('T')[1]?.substring(0, 5) || '00:00'}
              </Text>
            ) : (
              <DurationTimer startTime={item.invoice ? item.invoice.thoiGianTao : null} />
            )}
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.cardRow3}>
          <Text style={[styles.amountTextObj, item.status === 'AVAILABLE' ? { color: '#94A3B8' } : {}]}>
            Tạm tính: {item.invoice ? Number(item.invoice.tongThanhToan).toLocaleString('vi-VN') : '0'}đ
          </Text>
        </View>
      </LinearGradient>

      {/* Floating Bell Icon lòi ra góc phải báo hiệu Outer Glow active */}
      {theme.hasOuterGlow && (
        <View style={[styles.floatingBellWrap, { backgroundColor: theme.glowColor }]}>
          <Bell size={14} color="#FFFFFF" strokeWidth={2} />
        </View>
      )}

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={0.6} delayPressIn={0}
        onPress={() => {
          if (item.invoice) onNavigate('OrderDetails', { invoiceId: item.invoice.idHoaDon, tableName: item.name });
        }}
      />
    </View>
  );
});

const Home = ({ onNavigate }) => {
  const [activeMenu, setActiveMenu] = useState('DASHBOARD');
  const [activeTab, setActiveTab] = useState('AT_TABLE');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const [activeToast, setActiveToast] = useState(null);

  // Ref giữ state mới nhất để dùng trong Firebase callback (tránh stale closure)
  const tablesRef = useRef([]);
  const notifiedOrdersRef = useRef(new Set());

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotiModal, setShowNotiModal] = useState(false);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const sidebarWidth = useRef(new Animated.Value(240)).current;

  const toggleSidebar = () => {
    const isExpanding = !isSidebarExpanded;
    setIsSidebarExpanded(isExpanding);
    Animated.timing(sidebarWidth, {
      toValue: isExpanding ? 240 : 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    fetchData();
    fetchUserProfile();

    // Lắng nghe FCM từ App.js — dùng đúng title/body BE gửi, không tự tạo
    const fcmListener = DeviceEventEmitter.addListener('FCM_MESSAGE', (remoteMessage) => {
      const title = remoteMessage.notification?.title || 'Thông báo';
      const body = remoteMessage.notification?.body || '';

      // Map type dựa trên emoji/từ khóa BE gửi lên (khớp chính xác với BE code)
      let type = 'info';
      if (title.includes('🚨') || title.includes('HỦY')) type = 'cancelled';
      else if (title.includes('💵') || title.includes('thanh toán')) type = 'payment';
      else if (title.includes('✅') || title.includes('hoàn tất')) type = 'completed';
      else if (title.includes('📅') || title.includes('đặt lịch')) type = 'reservation';
      else if (title.includes('🏃') || title.includes('đã đến')) type = 'reservation';
      else if (title.includes('🔄') || title.includes('Chuyển bàn')) type = 'info';
      else if (title.includes('✨') || title.includes('Mở bàn')) type = 'info';
      else if (title.includes('➕') || title.includes('Gộp')) type = 'info';

      setActiveToast({ id: `fcm_${Date.now()}`, type, message: body, duration: 8000 });
      pushNotification({ title, message: body, type });

      // Reload data sau 1.5s để UI đồng bộ với BE
      setTimeout(() => fetchData(true), 1500);
    });

    // ─── Firebase Realtime Listeners ───

    // Snapshot cuối của orders để phát hiện thay đổi tongThanhToan/lastUpdate
    let lastOrdersSnapshot = null;

    // 1. Node /tables: chỉ cập nhật trạng thái bàn khi STATUS thực sự đổi
    // Không trigger fetchData liên tục — tránh race condition với orders listener
    let prevTableStatuses = {};
    const tableListener = listenToFirebase('tables', firebaseTables => {
      if (!firebaseTables || typeof firebaseTables !== 'object') return;
      const fbList = Object.values(firebaseTables).filter(t => t !== null && t?.idBan != null);

      // Chỉ track thay đổi để update UI, KHÔNG tự tạo thông báo (FCM lo phần đó)
      let hasStatusChange = false;
      fbList.forEach(fb => {
        const prevStatus = prevTableStatuses[fb.idBan];
        if (prevStatus !== undefined && prevStatus !== fb.tinhTrang) {
          hasStatusChange = true;
        }
        if (prevStatus !== fb.tinhTrang) {
          prevTableStatuses[fb.idBan] = fb.tinhTrang;
        }
      });

      // Chỉ cập nhật state khi có bàn đổi status thực sự
      if (hasStatusChange) {
        setTables(prevTables => {
          const next = prevTables.map(t => {
            const fb = fbList.find(f => f.idBan == t.id);
            if (!fb) return t;
            let newStatus = t.status;
            if (fb.tinhTrang === 'TRONG') newStatus = 'AVAILABLE';
            else if (fb.tinhTrang === 'CO_KHACH') newStatus = 'OCCUPIED';
            else if (fb.tinhTrang === 'DA_DAT') newStatus = 'RESERVED';
            if (newStatus === t.status) return t;
            // Bàn vừa giải phóng → xóa invoice
            return newStatus === 'AVAILABLE'
              ? { ...t, status: newStatus, invoice: null }
              : { ...t, status: newStatus };
          });
          tablesRef.current = next;
          return next;
        });

        // Khi có bàn đổi trạng thái → fetch lại toàn bộ (đặt bàn, giải phóng bàn)
        setTimeout(() => fetchData(true), 800);
      }
    });

    // 2. Node /orders: phát hiện thay đổi đơn hàng → fetch data mới + toast
    const STATUS_RANK = {
      CHO_XAC_NHAN: 0, DANG_PHA_CHE: 1, CHO_LAY_MON: 2,
      DANG_PHUC_VU: 3, CHO_THANH_TOAN: 4, DA_THANH_TOAN: 5,
      HOAN_TAT: 6, DA_HUY: 6,
    };
    const shouldUpdate = (localStatus, fbStatus) => {
      const lr = STATUS_RANK[localStatus] ?? -1;
      const fr = STATUS_RANK[fbStatus] ?? -1;
      return fr >= lr;
    };

    const orderListener = listenToFirebase('orders', firebaseOrders => {
      if (!firebaseOrders || typeof firebaseOrders !== 'object') return;
      const orderUpdates = Object.values(firebaseOrders).filter(o => o !== null && o?.idHoaDon != null);

      // Tạo snapshot tổng để phát hiện bất kỳ thay đổi nào (tongThanhToan, trangThai, lastUpdate)
      const currentSnapshot = orderUpdates
        .map(o => `${o.idHoaDon}:${o.tongThanhToan}:${o.trangThai}:${o.lastUpdate || ''}`)
        .sort()
        .join('|');

      const isFirstPoll = lastOrdersSnapshot === null;
      const hasOrderChange = !isFirstPoll && currentSnapshot !== lastOrdersSnapshot;
      lastOrdersSnapshot = currentSnapshot;

      if (isFirstPoll) return; // Lần đầu: chỉ ghi snapshot, không làm gì

      if (!hasOrderChange) return; // Không thay đổi → bỏ qua

      // === CÓ THAY ĐỔI === (chỉ sync data + UI, FCM lo phần thông báo)

      // Cập nhật trực tiếp tongThanhToan/trangThai vào local state (nhanh, không cần gọi API)
      setTables(prevTables => {
        let changed = false;
        const next = prevTables.map(t => {
          if (!t.invoice) return t;
          const fbOrder = orderUpdates.find(o => o.idHoaDon == t.invoice.idHoaDon);
          if (!fbOrder) return t;
          if (!shouldUpdate(t.invoice.trangThai, fbOrder.trangThai)) return t;
          if (
            fbOrder.trangThai === t.invoice.trangThai &&
            Number(fbOrder.tongThanhToan) === Number(t.invoice.tongThanhToan)
          ) return t;
          changed = true;
          return { ...t, invoice: { ...t.invoice, trangThai: fbOrder.trangThai, tongThanhToan: fbOrder.tongThanhToan } };
        });
        if (changed) tablesRef.current = next;
        return changed ? next : prevTables;
      });

      // Sau 1.5s, gọi API để đảm bảo danhSachChiTiet và các field khác cũng được sync
      setTimeout(() => fetchData(true), 1500);
    });

    return () => {
      tableListener.stop();
      orderListener.stop();
      fcmListener.remove();
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = await safeAsyncStorage.getItem('userId');
      if (userId) {
        const profile = await staffApi.getProfile(userId);
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Fetch profile failed:', error);
    }
  };

  const handleLogout = async () => {
    setAlert({
      visible: true,
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất không?',
      type: 'warning',
      buttons: [
        { text: 'Hủy', onPress: () => setAlert({ visible: false, title: '', message: '', type: 'info', buttons: [] }) },
        { 
          text: 'Đăng xuất', 
          onPress: async () => {
            setAlert({ visible: false, title: '', message: '', type: 'info', buttons: [] });
            await safeAsyncStorage.removeItem('token');
            await safeAsyncStorage.removeItem('userId');
            onNavigate('Start', { reset: true });
          }
        }
      ]
    });
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const [tableRes, invoiceRes, reservationRes] = await Promise.all([
        tableApi.getTables(),
        invoiceApi.getInvoicesByType('TAI_BAN'),
        reservationApi.getActiveReservations()
      ]);

      if (tableRes) {
        const invoices = Array.isArray(invoiceRes) ? invoiceRes : [];
        const reservations = Array.isArray(reservationRes) ? reservationRes : [];
        const mappedTables = tableRes.map(t => {
          let status = 'AVAILABLE';
          if (t.tinhTrangBan === 'CO_KHACH') status = 'OCCUPIED';
          else if (t.tinhTrangBan === 'DA_DAT') status = 'RESERVED';

          let invoiceData = null;
          let activeReservation = null;
          if (status === 'OCCUPIED' || status === 'RESERVED') {
            activeReservation = reservations.find(r => r.danhSachBan?.some(b => b.tenBan === t.tenBan));
            if (activeReservation) {
              invoiceData = invoices.find(inv =>
                inv.idPhieuDat === activeReservation.idPhieuDat &&
                inv.trangThai !== 'HOAN_TAT' &&
                inv.trangThai !== 'DA_HUY'
              );
            }
          }

          return {
            id: t.idBan.toString(),
            name: t.tenBan,
            status: status,
            capacity: t.sucChua,
            invoice: invoiceData,
            reservation: activeReservation
          };
        });
        setTables(mappedTables);
        tablesRef.current = mappedTables;
      }
    } catch (error) {
      console.error('Fetch data failed:', error);
    } finally {
      if (!isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const filteredTables = useMemo(() => {
    let result = tables;
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }
    if (searchQuery) {
      result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [tables, statusFilter, searchQuery]);

  const hour = new Date().getHours();
  let shiftText = '';
  if (hour >= 6 && hour < 12) shiftText = '06:00 - 12:00: Ca Sáng';
  else if (hour >= 12 && hour < 18) shiftText = '12:00 - 18:00: Ca Chiều';
  else shiftText = '18:00 - 23:00: Ca Tối';

  const Sidebar = () => (
    <Animated.View style={[styles.sidebar, { width: sidebarWidth, flex: undefined }]}>
      <TouchableOpacity activeOpacity={0.7} delayPressIn={0} style={styles.sidebarHeaderBtn} onPress={toggleSidebar}>
        <View style={styles.logoCircle}><Text style={{ fontSize: 18 }}>🍵</Text></View>
        {isSidebarExpanded && (
          <View style={styles.appTitleWrapper}>
            <Text style={styles.appTitle} numberOfLines={1}>MatchTea Cashier</Text>
            <Text style={styles.appSubtitle} numberOfLines={1}>App Thu ngân</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={[styles.sidebarBody, !isSidebarExpanded && { alignItems: 'center', paddingHorizontal: 10 }]}>
        <LinearGradient colors={['#A5D6A7', '#689F38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sidebarGradientInner} />
        {[
          { id: 'DASHBOARD', IconComponent: Grid, title: 'Dashboard' },
          { id: 'HISTORY', IconComponent: FileText, title: 'Lịch sử HĐ' },
          { id: 'MENU', IconComponent: Coffee, title: 'Thực đơn' },
          { id: 'STATS', IconComponent: BarChart2, title: 'Thống kê' },
          { id: 'SETTINGS', IconComponent: Settings, title: 'Cài đặt' }
        ].map((menu) => (
          <TouchableOpacity
            key={menu.id}
            activeOpacity={0.7} delayPressIn={0}
            style={[styles.navItem, activeMenu === menu.id && styles.navItemActive]}
            onPress={() => setActiveMenu(menu.id)}
          >
            <View style={[styles.navIconCircle, !isSidebarExpanded && { marginRight: 0 }]}>
              <menu.IconComponent size={18} color="#8BA367" strokeWidth={2} />
            </View>
            {isSidebarExpanded && <Text style={styles.navText} numberOfLines={1}>{menu.title}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        activeOpacity={0.7} 
        delayPressIn={0} 
        style={[styles.sidebarFooterBtn, !isSidebarExpanded && { justifyContent: 'center', padding: 8 }]}
        onPress={() => setIsProfileVisible(true)}
      >
        <View style={[styles.userAvatar, !isSidebarExpanded && { marginRight: 0 }, { overflow: 'hidden' }]}>
          {currentUser?.avatar || currentUser?.hinhAnh ? (
            <Image 
              source={{ uri: currentUser.avatar || currentUser.hinhAnh }} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={require('../../assets/images/user_avatar.png')} 
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
        </View>
        {isSidebarExpanded && (
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{currentUser?.hoTen || 'Đang tải...'}</Text>
            <Text style={styles.shiftText} numberOfLines={1}>{currentUser?.vaiTro === 'THU_NGAN' ? 'Thu ngân' : (currentUser?.vaiTro || shiftText)}</Text>
          </View>
        )}
      </TouchableOpacity>

      <UserProfileModal 
        isVisible={isProfileVisible}
        onClose={() => setIsProfileVisible(false)}
        user={currentUser}
        onLogout={handleLogout}
        onUpdate={setCurrentUser}
      />
    </Animated.View>
  );

  const TopHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.segmentControl}>
        <TouchableOpacity
          activeOpacity={0.8} delayPressIn={0}
          style={activeTab === 'AT_TABLE' ? styles.segmentBtnActiveWrapper : styles.segmentBtn}
          onPress={() => setActiveTab('AT_TABLE')}
        >
          {activeTab === 'AT_TABLE' ? (
            <LinearGradient colors={['#A5D6A7', '#689F38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.segmentBtnActive}>
              <Text style={styles.segmentTextActive}>Tại bàn</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.segmentText}>Tại bàn</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8} delayPressIn={0}
          style={activeTab === 'TAKEAWAY' ? styles.segmentBtnActiveWrapper : styles.segmentBtn}
          onPress={() => setActiveTab('TAKEAWAY')}
        >
          {activeTab === 'TAKEAWAY' ? (
            <LinearGradient colors={['#A5D6A7', '#689F38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.segmentBtnActive}>
              <Text style={styles.segmentTextActive}>Mang về</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.segmentText}>Mang về</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Central Dotted Tool Indicators */}
      {activeTab === 'AT_TABLE' && (
        <View style={styles.statusDotRowWrap}>
          <View style={styles.statusDotRow}>
            <View style={[styles.dot, { backgroundColor: '#FFFFFF', borderColor: '#CFD8DC' }]} />
            <Text style={styles.dotText}>Trống</Text>
          </View>
          <View style={styles.statusDotRow}>
            <View style={[styles.dot, { backgroundColor: '#B3E5FC', borderColor: '#81D4FA' }]} />
            <Text style={styles.dotText}>Đã Đặt</Text>
          </View>
          <View style={styles.statusDotRow}>
            <View style={[styles.dot, { backgroundColor: '#FFE082', borderColor: '#FFAB91' }]} />
            <Text style={styles.dotText}>Có Khách</Text>
          </View>
        </View>
      )}

      <View style={styles.headerRight}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" strokeWidth={2} />
          <TextInput 
            style={[styles.searchText, { flex: 1, height: 40, padding: 0 }]}
            placeholder="Tìm kiếm bàn..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.iconBtnSquare} onPress={() => setShowFilterModal(true)}>
          <Sliders size={20} color="#64748B" strokeWidth={1.5} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtnSquare} onPress={() => setShowNotiModal(true)}>
          <Bell size={20} color="#FF9800" strokeWidth={1.5} />
          {/* Notification Badge */}
          <View style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            backgroundColor: '#EF4444', borderRadius: 4,
            borderWidth: 1.5, borderColor: '#FFFFFF'
          }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <Sidebar />
      <View style={styles.mainContent}>
        <Text style={styles.watermark1}>🍃</Text>
        <Text style={styles.watermark2}>🍵</Text>
        <Text style={styles.watermark3}>✨</Text>
        <Text style={styles.watermark4}>🍂</Text>

        {activeMenu === 'DASHBOARD' ? (
          <>
            <TopHeader />
            {activeTab === 'TAKEAWAY' ? (
              <TakeawayTab onNavigate={onNavigate} />
            ) : loading && !refreshing ? (
              <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color="#8BA367" /></View>
            ) : (
              <FlatList
                data={filteredTables}
                renderItem={({ item }) => <TableCard item={item} onNavigate={onNavigate} />}
                keyExtractor={t => t.id}
                numColumns={4}
                key={'4-columns'}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#8BA367']}
                  />
                }
              />
            )}
          </>
        ) : activeMenu === 'HISTORY' ? (
          <HistoryTab onShowNoti={() => setShowNotiModal(true)} />
        ) : activeMenu === 'MENU' ? (
          <MenuTab />
        ) : activeMenu === 'STATS' ? (
          <StatsTab onChangeMenu={setActiveMenu} />
        ) : activeMenu === 'SETTINGS' ? (
          <SettingsTab user={currentUser} onLogout={handleLogout} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, color: '#94A3B8', fontWeight: '800' }}>
              Tính năng {activeMenu} đang được phát triển
            </Text>
          </View>
        )}
      </View>
      
      <FilterModal 
        isVisible={showFilterModal} 
        onClose={() => setShowFilterModal(false)} 
        currentFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />
      <NotificationModal 
        isVisible={showNotiModal} 
        onClose={() => setShowNotiModal(false)} 
      />

      <CustomAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
      <CashierToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />
    </View>
  );
};

export default Home;
