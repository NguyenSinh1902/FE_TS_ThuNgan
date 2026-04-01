import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import invoiceApi from '../../api/invoiceApi';
import styles from './TakeawayTab.styles';

const getStatusConfig = (status) => {
  switch(status) {
    case 'CONFIRMING': return {
      borderColor: '#3B82F6',
      badgeBg: '#DBEAFE',
      badgeTextCol: '#2563EB',
      badgeText: 'Chờ xác nhận',
      primaryBtnBg: '#3B82F6',
      primaryBtnText: 'Xác nhận'
    };
    case 'PREPARING': return {
      borderColor: 'rgba(139, 163, 103, 0.30)',
      badgeBg: 'rgba(139, 163, 103, 0.10)',
      badgeTextCol: '#8BA367',
      badgeText: 'Đang pha chế',
      primaryBtnBg: '#FF6900',
      primaryBtnText: 'Xong món'
    };
    case 'WAIT_PICKUP': return {
      borderColor: '#FF8904',
      badgeBg: '#FFEDD4',
      badgeTextCol: '#F54900',
      badgeText: 'Chờ lấy món',
      primaryBtnBg: '#FE9A00',
      primaryBtnText: 'Đã giao'
    };
    case 'WAIT_PAY': return {
      borderColor: '#FFB900',
      badgeBg: '#FEF3C6',
      badgeTextCol: '#E17100',
      badgeText: 'Chờ thanh toán',
      primaryBtnBg: '#8BA367',
      primaryBtnText: 'Thanh toán'
    };
    case 'PAID': return {
      borderColor: 'rgba(139, 163, 103, 0.40)',
      badgeBg: 'rgba(139, 163, 103, 0.12)',
      badgeTextCol: '#5A8040',
      badgeText: 'Đã thanh toán',
      primaryBtnBg: '#5A8040',
      primaryBtnText: '✅ Hoàn tất'
    };
    case 'DONE': return {
      borderColor: '#D1D5DB',
      badgeBg: '#F3F4F6',
      badgeTextCol: '#6B7280',
      badgeText: 'Hoàn tất',
      primaryBtnBg: '#64748B',
      primaryBtnText: '🧾 Xem HĐ'
    };
    case 'CANCELLED': return {
      borderColor: '#FECACA',
      badgeBg: '#FFE2E2',
      badgeTextCol: '#E7000B',
      badgeText: 'Đã hủy',
      primaryBtnBg: '#9CA3AF',
      primaryBtnText: '🗑️ Đã hủy'
    };
    default: return {
      borderColor: '#ccc',
      badgeBg: '#eee',
      badgeTextCol: '#333',
      badgeText: 'Không rõ',
      primaryBtnBg: '#8BA367',
      primaryBtnText: 'Thao tác'
    };
  }
};

const TakeawayTab = ({ onNavigate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getInvoicesByType('MANG_VE');
      const apiData = Array.isArray(res) ? res : [];
      
      const mapped = apiData.map(inv => {
        let internalStatus = 'PREPARING';
        switch (inv.trangThai) {
          case 'CHO_XAC_NHAN':   internalStatus = 'CONFIRMING';  break;
          case 'DANG_PHA_CHE':   internalStatus = 'PREPARING';   break;
          case 'CHO_LAY_MON':    internalStatus = 'WAIT_PICKUP'; break;
          case 'DANG_PHUC_VU':   internalStatus = 'WAIT_PICKUP'; break;
          case 'CHO_THANH_TOAN': internalStatus = 'WAIT_PAY';    break;
          case 'DA_THANH_TOAN':  internalStatus = 'PAID';        break;
          case 'HOAN_TAT':       internalStatus = 'DONE';        break;
          case 'DA_HUY':         internalStatus = 'CANCELLED';   break;
          default:               internalStatus = 'PREPARING';
        }

        const totalItems = inv.danhSachChiTiet ? inv.danhSachChiTiet.reduce((sum, item) => sum + item.soLuong, 0) : 0;
        const mins = Math.floor((new Date() - new Date(inv.thoiGianTao)) / 60000);
        
        return {
          id: inv.idHoaDon.toString(),
          orderId: `#TO00${inv.idHoaDon}`,
          customerName: inv.tenKhachHang || 'Khách vãng lai',
          waitTime: mins > 0 ? `${mins} phút` : 'Vừa xong',
          items: `${totalItems} món`,
          status: internalStatus,
          originalStatus: inv.trangThai
        };
      });
      setData(mapped);
    } catch (error) {
      console.error('Fetch Takeaway failed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderCard = ({ item }) => {
    const config = getStatusConfig(item.status);

    return (
      <View style={[styles.card, { borderColor: config.borderColor }]}>
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderId}>{item.orderId}</Text>
              <Text style={styles.customerName}>{item.customerName}</Text>
            </View>
            <View style={styles.statusBadgeWrap}>
              {/* Optional indicator icon can go here */}
              <View style={[styles.statusBadge, { backgroundColor: config.badgeBg }]}>
                <Text style={[styles.statusText, { color: config.badgeTextCol }]}>{config.badgeText}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardMiddle}>
            <View style={styles.timeRow}>
              <View style={styles.clockIconWrap}>
                 <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#4A5565' }} />
                 <View style={{ width: 1.5, height: 5, backgroundColor: '#4A5565', position: 'absolute', top: 3 }} />
                 <View style={{ width: 4, height: 1.5, backgroundColor: '#4A5565', position: 'absolute', top: 7, left: 7 }} />
              </View>
              <Text style={styles.infoText}>{item.waitTime}</Text>
            </View>
            <Text style={styles.infoText}>{item.items}</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: config.primaryBtnBg }]}
              onPress={() => {}}
            >
              <Text style={styles.actionBtnText}>{config.primaryBtnText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#8BA367' }]}
              onPress={() => onNavigate('OrderDetails', { invoiceId: item.id, orderId: item.orderId })}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                 <Path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.actionBtnText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* List */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007A55" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007A55']} />
          }
          ListHeaderComponent={
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E2939', marginBottom: 16 }}>
              Đơn hàng mang về
            </Text>
          }
        />
      )}
    </View>
  );
};

export default TakeawayTab;
