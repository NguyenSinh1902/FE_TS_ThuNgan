import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Clock } from 'lucide-react-native';
import invoiceApi from '../../api/invoiceApi';
import { listenToFirebase } from '../../utils/firebaseListener';
import styles from './TakeawayTab.styles';

// ── Đồng hồ đếm thời gian ────────────────────────────────────────────
const DurationTimer = React.memo(({ startTime }) => {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const update = () => {
      const diff = Math.max(0, Date.now() - start);
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setDuration(`${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return <Text style={styles.timeTextObj}>{duration}</Text>;
});

// ── Cấu hình màu/label theo trạng thái ───────────────────────────────
const getStatusConfig = (status) => {
  switch (status) {
    case 'CHO_XAC_NHAN':
      return { borderTop: '#94A3B8', badgeBg: '#F1F5F9', badgeColor: '#64748B',   dot: '#94A3B8', label: 'Chờ xác nhận',   gradient: ['#FFFFFF', '#F8FAFC'] };
    case 'DANG_PHA_CHE':
      return { borderTop: '#3B82F6', badgeBg: '#EFF6FF', badgeColor: '#3B82F6',   dot: '#3B82F6', label: 'Đang pha chế',   gradient: ['#FFFFFF', '#EFF6FF'] };
    case 'CHO_LAY_MON':
      return { borderTop: '#0D9488', badgeBg: '#F0FDFA', badgeColor: '#0D9488',   dot: '#0D9488', label: 'Chờ lấy món',    gradient: ['#FFFFFF', '#F0FDFA'] };
    case 'CHO_THANH_TOAN':
      return { borderTop: '#F59E0B', badgeBg: '#FFF7ED', badgeColor: '#EA580C',   dot: '#EA580C', label: 'Chờ thanh toán', gradient: ['#FFFFFF', '#FFF7ED'] };
    case 'DA_THANH_TOAN':
      return { borderTop: '#10B981', badgeBg: '#ECFDF5', badgeColor: '#059669',   dot: '#059669', label: 'Đã thanh toán',  gradient: ['#FFFFFF', '#ECFDF5'] };
    case 'DA_HUY':
      return { borderTop: '#9E9E9E', badgeBg: '#F1F5F9', badgeColor: '#9E9E9E',   dot: '#9E9E9E', label: 'Đã hủy',         gradient: ['#FFFFFF', '#F1F5F9'] };
    default:
      return { borderTop: '#CBD5E1', badgeBg: '#F1F5F9', badgeColor: '#94A3B8',   dot: '#CBD5E1', label: status || 'Không rõ', gradient: ['#FFFFFF', '#F8FAFC'] };
  }
};

// ── Card mang về ──────────────────────────────────────────────────────
const TakeawayCard = React.memo(({ item, onNavigate }) => {
  const cfg = getStatusConfig(item.trangThai);
  const invoiceNum = item.maHoaDon || `#${item.idHoaDon}`;
  const isWaitingPayment = item.trangThai === 'CHO_THANH_TOAN';

  // Tóm tắt món
  const itemSummary = item.danhSachChiTiet?.length > 0
    ? item.danhSachChiTiet.map(d => `${d.soLuong}x ${d.tenSanPham}`).join(', ')
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.cardWrapper,
        { borderTopColor: cfg.borderTop },
        isWaitingPayment && {
          borderColor: '#F59E0B',
          borderWidth: 2,
          shadowColor: '#F59E0B',
          shadowOpacity: 0.55,
          shadowRadius: 18,
          elevation: 14,
        },
      ]}
      onPress={() =>
        onNavigate('OrderDetails', {
          invoiceId: item.idHoaDon,
          tableName: `Mang về ${invoiceNum}`,
        })
      }
    >
      <LinearGradient
        colors={cfg.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradientContent}
      >
        {/* ── Hàng 1: Mã đơn ←→ Đồng hồ ── */}
        <View style={styles.headerRowObj}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.orderIdText} numberOfLines={1}>
              Đơn {invoiceNum}
            </Text>
            {/* Badge trạng thái ngay dưới mã đơn */}
            <View style={[styles.statusTag, { backgroundColor: cfg.badgeBg }]}>
              <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
              <Text style={[styles.statusText, { color: cfg.badgeColor }]}>
                {cfg.label}
              </Text>
            </View>
          </View>

          <View style={styles.timeWrap}>
            <Clock size={13} color="#94A3B8" strokeWidth={2} />
            <DurationTimer startTime={item.thoiGianTao} />
          </View>
        </View>

        {/* ── Hàng 2: Tóm tắt món ── */}
        {itemSummary && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailsText} numberOfLines={1}>
              📦 {itemSummary}
            </Text>
          </View>
        )}

        {/* ── Hàng Footer: Khách hàng ←→ Tổng tiền ── */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.customerLabel}>Khách hàng</Text>
            <Text style={styles.customerText} numberOfLines={1}>
              👤 {item.tenKhachHang || 'Khách tại quầy'}
            </Text>
          </View>
          <View>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.amountText} numberOfLines={1}>
              {Number(item.tongThanhToan).toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// ── Main Tab ──────────────────────────────────────────────────────────
const TakeawayTab = ({ onNavigate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastSnapshotRef = useRef(null);

  const fetchData = async (isRefresh = false) => {
    try {
      const res = await invoiceApi.getInvoicesByType('MANG_VE');
      if (Array.isArray(res)) {
        setData(res.filter(item => item.trangThai !== 'HOAN_TAT'));
      }
    } catch (error) {
      console.error('Fetch takeaway failed:', error);
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const orderListener = listenToFirebase('orders', firebaseOrders => {
      if (!firebaseOrders || typeof firebaseOrders !== 'object') return;
      const orderList = Object.values(firebaseOrders).filter(
        o => o !== null && o?.idHoaDon != null,
      );
      const snapshot = orderList
        .map(o => `${o.idHoaDon}:${o.trangThai}:${o.tongThanhToan}:${o.lastUpdate || ''}`)
        .sort()
        .join('|');

      if (lastSnapshotRef.current === null) {
        lastSnapshotRef.current = snapshot;
        return;
      }
      if (snapshot === lastSnapshotRef.current) return;
      lastSnapshotRef.current = snapshot;

      setTimeout(() => fetchData(true), 800);
    });

    return () => orderListener.stop();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      {/* Watermark nền */}
      <View style={styles.watermarkListWrap}>
        <Text style={styles.watermarkDelivery}>🛵</Text>
        <Text style={styles.watermarkBag}>🛍️</Text>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#49934F" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.idHoaDon.toString()}
          renderItem={({ item }) => (
            <TakeawayCard item={item} onNavigate={onNavigate} />
          )}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#49934F']}
            />
          }
        />
      )}
    </View>
  );
};

export default TakeawayTab;
