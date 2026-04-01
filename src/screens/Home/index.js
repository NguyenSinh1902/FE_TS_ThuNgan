import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import tableApi from '../../api/tableApi';
import invoiceApi from '../../api/invoiceApi';
import styles from './Home.styles';
import TakeawayTab from './TakeawayTab';

const { width } = Dimensions.get('window');


const Home = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('AT_TABLE');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both table structure and active At_Table invoices concurrently
      const [tableRes, invoiceRes] = await Promise.all([
        tableApi.getTables(),
        invoiceApi.getInvoicesByType('TAI_BAN')
      ]);
      
      if (tableRes) {
        const invoices = Array.isArray(invoiceRes) ? invoiceRes : [];

        const mappedTables = tableRes.map(t => {
          let status = 'AVAILABLE';
          let invoiceData = null;

          if (t.tinhTrangBan === 'CO_KHACH') {
            status = 'OCCUPIED';
            invoiceData = invoices.find(inv => inv.danhSachTenBan?.includes(t.tenBan));
            
            if (invoiceData && (invoiceData.trangThai === 'CHO_THANH_TOAN' || invoiceData.trangThai === 'DA_THANH_TOAN' || invoiceData.trangThai === 'HOAN_TAT')) {
              status = 'WAIT_PAY';
            }
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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getTableStyleParams = (status) => {
    switch (status) {
      case 'OCCUPIED':
        return {
          bg: 'rgba(0, 188, 125, 0.40)',
          border: 'rgba(0, 212, 146, 0.50)',
          badgeBg: 'rgba(0, 188, 125, 0.30)',
          badgeTextCol: '#007A55',
          badgeLabel: 'PHỤC VỤ',
        };
      case 'WAIT_PAY':
        return {
          bg: 'rgba(255, 185, 0, 0.40)',
          border: 'rgba(255, 185, 0, 0.60)',
          badgeBg: 'rgba(254, 154, 0, 0.30)',
          badgeTextCol: '#BB4D00',
          badgeLabel: 'THANH TOÁN',
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.40)',
          border: 'rgba(255, 255, 255, 0.50)',
          badgeBg: 'rgba(153, 161, 175, 0.20)',
          badgeTextCol: '#4A5565',
          badgeLabel: 'TRỐNG',
        };
    }
  };

  const TableCard = ({ item }) => {
    const s = getTableStyleParams(item.status);
    const isAvailable = item.status === 'AVAILABLE';

    return (
      <TouchableOpacity 
        style={[styles.tableCard, { backgroundColor: s.bg, borderColor: s.border }]}
        onPress={() => {
          if (item.invoice) {
            onNavigate('OrderDetails', { invoiceId: item.invoice.idHoaDon, tableName: item.name });
          }
        }}
      >
        {/* Decorations inside Card */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.20)', 'transparent']}
          start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.cardDecorTR}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.cardDecorBL}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.tableName}>{item.name}</Text>
            <View style={[styles.badgeWrap, { backgroundColor: s.badgeBg, borderColor: s.border }]}>
              <Text style={[styles.badgeText, { color: s.badgeTextCol }]}>{s.badgeLabel}</Text>
            </View>
          </View>

          <View style={styles.cardMiddle}>
            {/* Simple icon representation */}
            <View style={styles.capacityIcon}>
               <View style={{ width: 10, height: 5, borderWidth: 1, borderColor: isAvailable ? '#6A7282' : '#364153', position: 'absolute', top: 8, left: 1 }} />
               <View style={{ width: 6, height: 6, borderWidth: 1, borderColor: isAvailable ? '#6A7282' : '#364153', position: 'absolute', top: 2, left: 3 }} />
            </View>
            <Text style={[styles.capacityText, isAvailable && { color: '#6A7282', fontWeight: '300' }]}>
              {isAvailable ? `Sức chứa: ${item.capacity} người` : `${Math.floor(Math.random() * item.capacity) + 1}/${item.capacity} người`}
            </Text>
          </View>

          <View style={styles.cardBottomWrap}>
            {isAvailable ? (
              <Text style={styles.emptyStatusText}>Sẵn sàng phục vụ</Text>
            ) : (
              <>
                <View>
                  <Text style={styles.amountLabel}>Tạm tính</Text>
                  <Text style={styles.amountValue}>
                    {item.invoice ? `${Number(item.invoice.tongThanhToan).toLocaleString('vi-VN')}đ` : '0đ'}
                  </Text>
                </View>
                <View style={styles.timeWrap}>
                  <Text style={styles.timeText}>
                    {item.invoice ? `${Math.floor((new Date() - new Date(item.invoice.thoiGianTao)) / 60000)}p` : '0p'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient colors={['#FFF8F0', '#F5F5F5', '#E8F5E0']} style={styles.gradientBg}>
        
        {/* Absolute Header (Matches Figma) */}
        <LinearGradient colors={['#006045', '#007A55', '#00786F']} style={styles.headerContainer}>
              <View style={styles.headerDecorContainer}>
                 <Text style={[styles.leafText, styles.leaf1]}>🍃</Text>
                 <Text style={[styles.leafText, styles.leaf2]}>🍃</Text>
                 <Text style={[styles.leafText, styles.leaf3]}>🍃</Text>
              </View>
              <View style={styles.headerContent}>
                 <View style={styles.userInfoRow}>
                    <LinearGradient colors={['#FFB900', '#FF6900']} style={styles.avatarWrap}>
                       <Text style={styles.avatarInitials}>N</Text>
                    </LinearGradient>
                    <View>
                       <Text style={styles.nameText}>Nguyễn Minh Anh</Text>
                       <Text style={styles.roleText}>Ca sáng - 08:00 đến 16:00</Text>
                    </View>
                 </View>
                 <TouchableOpacity style={styles.notiBtn}>
                    <View style={{ width: 14, height: 16, borderWidth: 1, borderColor: 'white', borderRadius: 4 }} />
                    <View style={styles.notiBadge}>
                      <Text style={styles.notiBadgeText}>3</Text>
                    </View>
                 </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Floating Tab Bar (Matches Figma) */}
            <View style={styles.topTabBarContainer}>
               <View style={styles.topTabBar}>
                  <TouchableOpacity 
                    style={[styles.topTabBtn, activeTab === 'AT_TABLE' && styles.topTabBtnActive]}
                    onPress={() => setActiveTab('AT_TABLE')}
                  >
                    <Text style={[styles.topTabText, activeTab === 'AT_TABLE' && styles.topTabTextActive]}>Tại bàn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.topTabBtn, activeTab === 'TAKEAWAY' && styles.topTabBtnActive]}
                    onPress={() => setActiveTab('TAKEAWAY')}
                  >
                    <Text style={[styles.topTabText, activeTab === 'TAKEAWAY' && styles.topTabTextActive]}>Mang về</Text>
                  </TouchableOpacity>
               </View>
            </View>

            {activeTab === 'AT_TABLE' ? (
              <>
                {loading && !refreshing ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007A55" />
                  </View>
                ) : (
                  <FlatList
                    data={tables}
                    keyExtractor={item => item.id}
                    renderItem={TableCard}
                    numColumns={2}
                    key={activeTab} 
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007A55']} />
                    }
                    ListHeaderComponent={
                      <View style={styles.sectionTitleWrap}>
                        <Text style={styles.sectionTitle}>Danh sách bàn</Text>
                        <Text style={styles.sectionSubtitle}>
                          {`${tables.filter(t => t.status === 'OCCUPIED').length} bàn đang phục vụ • ${tables.filter(t => t.status === 'WAIT_PAY').length} bàn chờ thanh toán`}
                        </Text>
                      </View>
                    }
                  />
                )}
              </>
            ) : (
              <TakeawayTab onNavigate={onNavigate} />
            )}

        {/* Bottom Navigation (Matches Figma) */}
        <View style={styles.bottomNavWrapper}>
           <View style={styles.bottomNavContainer}>
              <TouchableOpacity style={[styles.bottomNavBtn, styles.bottomNavBtnActive]}>
                 <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <Path d="M9 11L12 14L22 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 </Svg>
                 <Text style={styles.bottomNavText}>Đơn Hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomNavBtn} onPress={() => onNavigate('Report')}>
                 <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <Path d="M18 20V10M12 20V4M6 20V14" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                 </Svg>
                 <Text style={styles.bottomNavText}>Báo Cáo</Text>
              </TouchableOpacity>
           </View>
        </View>

      </LinearGradient>
    </View>
  );
};

export default Home;
