import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ShoppingBag, Clock } from 'lucide-react-native';
import invoiceApi from '../../api/invoiceApi';
import styles from './TakeawayTab.styles';

const DurationTimer = React.memo(({ startTime, isRed }) => {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, now - start);
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setDuration(`${hours}:${mins}:${secs}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <Text style={[styles.timeTextObj, isRed && { color: '#D32F2F' }]}>{duration}</Text>;
});

const TakeawayTab = ({ onNavigate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await invoiceApi.getInvoicesByType('MANG_VE');
      if (Array.isArray(res)) {
        // Chỉ ẩn khi đơn đã Hoàn tất
        const filtered = res.filter(item => item.trangThai !== 'HOAN_TAT');
        setData(filtered);
      }
    } catch (error) {
      console.error('Fetch takeaway failed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getBadgeConfig = (status) => {
    if (status === 'CHO_THANH_TOAN') return { label: 'Chờ thanh toán', bg: '#FF3D00', text: '#FFFFFF', border: '#FF3D00' };
    if (status === 'CHO_LAY_MON') return { label: 'Chờ lên món', bg: '#FF9800', text: '#FFFFFF', border: '#FF9800' };
    if (status === 'DANG_PHA_CHE') return { label: 'Đang pha chế', bg: '#2196F3', text: '#FFFFFF', border: '#2196F3' };
    if (status === 'CHO_XAC_NHAN') return { label: 'Chờ xác nhận', bg: '#FFFFFF', text: '#1E293B', border: '#94A3B8' };
    if (status === 'DA_THANH_TOAN') return { label: 'Đã thanh toán', bg: '#4CAF50', text: '#FFFFFF', border: '#388E3C' };
    if (status === 'DA_HUY') return { label: 'Đã hủy', bg: '#9E9E9E', text: '#FFFFFF', border: '#9E9E9E' };
    return { label: status || 'Không rõ', bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
  };

  const renderCard = ({ item }) => {
    const isReady = item.trangThai === 'CHO_LAY_MON';
    const invoiceNum = item.maHoaDon || `#${item.idHoaDon}`;
    const badge = getBadgeConfig(item.trangThai);

    // Viền + Đổ bóng theo màu Trạng thái
    const cardGlowStyle = {
      shadowColor: badge.border,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    };
    const cardBorderStyle = {
      borderColor: badge.border,
      borderWidth: 2,
    };

    return (
      <View style={[styles.cardWrapper, cardGlowStyle]}>
        <LinearGradient colors={['#E8F5E9', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cardGradientContent, cardBorderStyle]}>

          {/* Hàng 1: ID Đơn + Tag inline (Gọn gàng) */}
          <View style={styles.headerRowObj}>
            <Text style={styles.orderIdText} numberOfLines={1}>Đơn {invoiceNum}</Text>
            <View style={[styles.badgeInline, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeTextInline, { color: badge.text }]}>{badge.label}</Text>
            </View>
          </View>

          {/* Hàng 1.5: Tên khách hàng (Nằm gọn dưới ID) */}
          <View style={styles.customerRowObj}>
            <Text style={styles.customerText} numberOfLines={1}>
              {item.tenKhachHang ? item.tenKhachHang : 'Khách tại quầy'}
            </Text>
            {item.soDienThoai ? <Text style={styles.phoneText}>{item.soDienThoai}</Text> : null}
          </View>

          {/* Hàng 2: Tạm tính */}
          <View style={styles.row2}>
            <Text style={styles.amountTextLabel}>Tạm tính: </Text>
            <Text style={styles.amountText}>{Number(item.tongThanhToan).toLocaleString('vi-VN')}đ</Text>
          </View>

          {/* Hàng 3: Đáy góc trái (Túi) & phải (Đồng hồ) đối trọng nhau */}
          <View style={styles.row4}>
            <View style={styles.infoWrap}>
              <ShoppingBag size={18} color="#1E293B" strokeWidth={2} />
              <Text style={styles.infoText}>Mang về</Text>
            </View>
            <View style={styles.infoWrap}>
              <Clock size={16} color={isReady ? '#D32F2F' : '#1E293B'} strokeWidth={2} />
              <DurationTimer startTime={item.thoiGianTao} isRed={isReady} />
            </View>
          </View>

          {/* Action chạm toàn thẻ */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={0.6}
            delayPressIn={0}
            onPress={() => onNavigate('OrderDetails', { invoiceId: item.idHoaDon, tableName: `Mang về ${invoiceNum}` })}
          />
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
          renderItem={renderCard}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#49934F']} />}
        />
      )}
    </View>
  );
};

export default TakeawayTab;
