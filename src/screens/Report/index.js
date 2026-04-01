import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import invoiceApi from '../../api/invoiceApi';

const formatPrice = (p) => {
  const n = Number(p || 0);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return n.toLocaleString('vi-VN');
};
const formatPriceFull = (p) => Number(p || 0).toLocaleString('vi-VN') + 'đ';

const orderTypeIcon = (loai) => loai === 'MANG_VE' ? '📦' : '🪑';
const orderTypeColor = (loai) => loai === 'MANG_VE' ? '#2B7FFF' : '#8BA367';
const orderTypeBg = (loai) => loai === 'MANG_VE' ? 'rgba(43,127,255,0.15)' : 'rgba(139,163,103,0.15)';

const Report = ({ onNavigate, params }) => {
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = params?.user || { hoTen: 'Nhân viên', caLam: 'Ca sáng - 08:00 đến 16:00' };
  const initials = user.hoTen?.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase() || 'NV';
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableOrders, takeawayOrders] = await Promise.all([
        invoiceApi.getInvoicesByType('TAI_BAN'),
        invoiceApi.getInvoicesByType('MANG_VE'),
      ]);
      const all = [
        ...(Array.isArray(tableOrders) ? tableOrders : []),
        ...(Array.isArray(takeawayOrders) ? takeawayOrders : []),
      ].sort((a, b) => new Date(b.thoiGianTao) - new Date(a.thoiGianTao));
      setAllInvoices(all);
    } catch (err) {
      console.error('Fetch report failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Computed stats
  const doneOrders = allInvoices.filter(inv => inv.trangThai === 'HOAN_TAT' || inv.trangThai === 'DA_THANH_TOAN');
  const tongDoanhThu = doneOrders.reduce((sum, inv) => sum + (inv.tongThanhToan || 0), 0);
  const tongDon = doneOrders.length;
  const donTaiBan = doneOrders.filter(inv => inv.loaiDonHang === 'TAI_BAN').length;
  const donMangVe = doneOrders.filter(inv => inv.loaiDonHang === 'MANG_VE').length;
  const tbDon = tongDon > 0 ? tongDoanhThu / tongDon : 0;
  const recentOrders = allInvoices.slice(0, 8);

  const statusLabel = (s) => {
    const map = {
      CHO_XAC_NHAN: { text: 'Chờ xác nhận', color: '#2B7FFF' },
      DANG_PHA_CHE: { text: 'Đang pha chế', color: '#8BA367' },
      CHO_LAY_MON: { text: 'Chờ lấy món', color: '#F54900' },
      CHO_THANH_TOAN: { text: 'Chờ TT', color: '#E17100' },
      DA_THANH_TOAN: { text: 'Đã thanh toán', color: '#5A8040' },
      HOAN_TAT: { text: 'Hoàn tất', color: '#009966' },
      DA_HUY: { text: 'Đã hủy', color: '#E7000B' },
    };
    return map[s] || { text: s, color: '#6B7280' };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F0' }}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FFF8F0', '#F5F5F5', '#E8F5E0']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#8BA367']} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 46, paddingBottom: 8, gap: 12 }}>
            <TouchableOpacity onPress={() => onNavigate('Home')} style={{ width: 40, height: 40, justifyContent: 'center' }}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: '500', color: '#1E2939', flex: 1 }}>Báo Cáo & Thống Kê</Text>
          </View>

          {/* User Card */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 14 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(139,163,103,0.3)' }}>
              <LinearGradient colors={['#8BA367', '#A8C589']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '500' }}>{initials}</Text>
              </LinearGradient>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, color: '#0A0A0A', fontWeight: '400' }}>{user.hoTen}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#4A5565" strokeWidth="1.5" />
                  <Path d="M8 2V6M16 2V6M3 10H21" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round" />
                </Svg>
                <Text style={{ fontSize: 13, color: '#4A5565' }}>{today}</Text>
                <Text style={{ color: '#4A5565' }}>•</Text>
                <Text style={{ fontSize: 13, color: '#4A5565' }}>{user.caLam || '08:00 - 16:00'}</Text>
              </View>
            </View>
          </View>

          {/* Stat Cards Row */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
            {/* Doanh thu ca */}
            <LinearGradient
              colors={['rgba(139,163,103,0.10)', 'rgba(139,163,103,0.05)']}
              style={{ flex: 1, borderRadius: 20, padding: 16 }}
            >
              <View style={{ width: 36, height: 36, backgroundColor: undefined, borderRadius: 12, marginBottom: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <LinearGradient colors={['#8BA367', '#A8C589']} style={{ width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 }}>💰</Text>
                </LinearGradient>
              </View>
              <Text style={{ fontSize: 13, color: '#4A5565', marginBottom: 4 }}>Doanh thu ca</Text>
              {loading
                ? <ActivityIndicator color="#8BA367" />
                : <Text style={{ fontSize: 22, fontWeight: '600', color: '#8BA367' }}>{formatPrice(tongDoanhThu)}đ</Text>
              }
            </LinearGradient>

            {/* Tổng đơn hàng */}
            <LinearGradient
              colors={['rgba(43,127,255,0.10)', 'rgba(43,127,255,0.05)']}
              style={{ flex: 1, borderRadius: 20, padding: 16 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 12, marginBottom: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <LinearGradient colors={['#2B7FFF', '#155DFC']} style={{ width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 }}>📋</Text>
                </LinearGradient>
              </View>
              <Text style={{ fontSize: 13, color: '#4A5565', marginBottom: 4 }}>Tổng đơn hàng</Text>
              {loading
                ? <ActivityIndicator color="#2B7FFF" />
                : <Text style={{ fontSize: 22, fontWeight: '600', color: '#2B7FFF' }}>{tongDon}</Text>
              }
            </LinearGradient>
          </View>

          {/* Recent Orders */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '500', color: '#0A0A0A' }}>Đơn hàng gần đây</Text>
              <View style={{ backgroundColor: 'rgba(139,163,103,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ fontSize: 13, color: '#8BA367' }}>{recentOrders.length} đơn</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator color="#8BA367" size="large" style={{ marginTop: 20 }} />
            ) : (
              recentOrders.map((inv) => {
                const time = new Date(inv.thoiGianTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const location = inv.loaiDonHang === 'TAI_BAN'
                  ? (inv.danhSachTenBan?.[0] || 'Tại bàn')
                  : `#TO${String(inv.idHoaDon).padStart(4, '0')}`;
                const status = statusLabel(inv.trangThai);
                return (
                  <TouchableOpacity
                    key={inv.idHoaDon}
                    onPress={() => onNavigate('OrderDetails', { invoiceId: inv.idHoaDon })}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 14,
                      paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10,
                      borderWidth: 1, borderColor: 'rgba(243,244,246,0.5)',
                    }}
                  >
                    {/* Icon */}
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: orderTypeBg(inv.loaiDonHang), justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 18 }}>{orderTypeIcon(inv.loaiDonHang)}</Text>
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#0A0A0A' }}>
                          #{String(inv.idHoaDon).padStart(4, '0')}
                        </Text>
                        <View style={{ backgroundColor: 'rgba(243,244,246,0.85)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 11, color: '#4A5565' }}>{location}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <Circle cx="12" cy="12" r="9" stroke="#6A7282" strokeWidth="1.5" />
                          <Path d="M12 7V12L15 14" stroke="#6A7282" strokeWidth="1.5" strokeLinecap="round" />
                        </Svg>
                        <Text style={{ fontSize: 11, color: '#6A7282' }}>{time}</Text>
                      </View>
                    </View>

                    {/* Amount & status */}
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: '#8BA367' }}>
                        {formatPriceFull(inv.tongThanhToan)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.color }} />
                        <Text style={{ fontSize: 11, color: status.color }}>{status.text}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Stats Detail */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 17, fontWeight: '500', color: '#0A0A0A', marginBottom: 12 }}>Thống kê chi tiết</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'Đơn tại bàn', value: donTaiBan, color: '#8BA367', bg: 'rgba(139,163,103,0.08)' },
                { label: 'Đơn mang về', value: donMangVe, color: '#2B7FFF', bg: 'rgba(43,127,255,0.08)' },
                { label: 'TB/đơn', value: formatPrice(tbDon), color: '#FE9A00', bg: 'rgba(254,154,0,0.08)' },
                { label: 'Giờ làm việc', value: '8h', color: '#00BC7D', bg: 'rgba(0,188,125,0.08)' },
              ].map((s, i) => (
                <View key={i} style={{ width: '47%', borderRadius: 14, padding: 16, backgroundColor: s.bg, alignItems: 'center', gap: 4 }}>
                  {loading && i < 3 ? (
                    <ActivityIndicator color={s.color} />
                  ) : (
                    <Text style={{ fontSize: 22, fontWeight: '600', color: s.color }}>{s.value}</Text>
                  )}
                  <Text style={{ fontSize: 12, color: '#4A5565' }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Report;
