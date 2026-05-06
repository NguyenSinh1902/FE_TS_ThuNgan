import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Users, Clock, Bell, Grid, FileText, BarChart2, Settings, User, Search, Sliders, Coffee } from 'lucide-react-native';
import tableApi from '../../api/tableApi';
import invoiceApi from '../../api/invoiceApi';
import staffApi from '../../api/staffApi';
import safeAsyncStorage from '../../utils/storage';
import TakeawayTab from './TakeawayTab';
import UserProfileModal from './components/UserProfileModal';
import FilterModal from './components/FilterModal';
import NotificationModal from './components/NotificationModal';
import MenuTab from './components/MenuTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import styles from './Home.styles';
import { Alert } from 'react-native';
import HistoryTab from './components/HistoryTab';

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
              {item.status === 'AVAILABLE' ? `0 Khách` : `4 Khách`}
            </Text>
          </View>
          <View style={styles.timeWrap}>
            <Clock size={16} color="#1E293B" strokeWidth={2.5} />
            <DurationTimer startTime={item.invoice ? item.invoice.thoiGianTao : null} />
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

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
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await safeAsyncStorage.removeItem('token');
            await safeAsyncStorage.removeItem('userId');
            onNavigate('Start', { reset: true });
          }
        }
      ]
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableRes, invoiceRes] = await Promise.all([
        tableApi.getTables(),
        invoiceApi.getInvoicesByType('TAI_BAN')
      ]);

      if (tableRes) {
        const invoices = Array.isArray(invoiceRes) ? invoiceRes : [];
        const mappedTables = tableRes.map(t => {
          let status = 'AVAILABLE';
          if (t.tinhTrangBan === 'CO_KHACH') status = 'OCCUPIED';
          else if (t.tinhTrangBan === 'DA_DAT') status = 'RESERVED';

          let invoiceData = null;
          if (status === 'OCCUPIED' || status === 'RESERVED') {
            invoiceData = invoices.find(inv => inv.danhSachTenBan?.includes(t.tenBan));
          }

          return {
            id: t.idBan.toString(),
            name: t.tenBan,
            status: status,
            capacity: t.sucChua,
            invoice: invoiceData
          };
        });
        setTables(mappedTables);
      }
    } catch (error) {
      console.error('Fetch data failed:', error);
    } finally {
      setLoading(false);
    }
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
          <Image 
            source={require('../../assets/images/user_avatar.png')} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
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
            ) : loading ? (
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
              />
            )}
          </>
        ) : activeMenu === 'HISTORY' ? (
          <HistoryTab />
        ) : activeMenu === 'MENU' ? (
          <MenuTab />
        ) : activeMenu === 'STATS' ? (
          <StatsTab />
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
    </View>
  );
};

export default Home;
