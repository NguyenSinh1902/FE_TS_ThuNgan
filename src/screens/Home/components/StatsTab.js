import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Award, Clock, ArrowRight, User, MapPin, History } from 'lucide-react-native';
import statsApi from '../../../api/statsApi';
import invoiceApi from '../../../api/invoiceApi';

const { width } = Dimensions.get('window');

const StatsTab = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, invoicesRes] = await Promise.all([
        statsApi.getDashboardData(),
        invoiceApi.getAll()
      ]);

      setData(statsRes);
      
      // Lấy 5 đơn hàng gần nhất
      if (Array.isArray(invoicesRes)) {
        const sorted = invoicesRes.sort((a, b) => new Date(b.thoiGianTao) - new Date(a.thoiGianTao));
        setRecentOrders(sorted.slice(0, 5));
      }
    } catch (err) {
      console.log('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A924C" />
        <Text style={styles.loadingText}>Đang tổng hợp dữ liệu...</Text>
      </View>
    );
  }

  const renderStatCard = (title, value, percentage, icon, colors, isCurrency = false) => (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          {icon}
        </View>
        <View style={[styles.trendBadge, { backgroundColor: percentage >= 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,0,0.1)' }]}>
          {percentage >= 0 ? <TrendingUp size={12} color="#FFF" /> : <TrendingDown size={12} color="#FF6B6B" />}
          <Text style={styles.trendText}>{Math.abs(percentage).toFixed(1)}%</Text>
        </View>
      </View>
      <Text style={styles.cardValue}>
        {isCurrency ? Number(value).toLocaleString('vi-VN') + 'đ' : value}
      </Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Row 1: Quick Stats */}
        <View style={styles.row}>
          <View style={styles.col3}>
            {renderStatCard('Doanh thu hôm nay', data.doanhThuHomNay, data.phanTramTangTruongDoanhThu, <DollarSign color="#FFF" size={20} />, ['#4A924C', '#2D5A27'], true)}
          </View>
          <View style={styles.col3}>
            {renderStatCard('Số lượng đơn hàng', data.soDonHang, data.phanTramTangTruongDonHang, <ShoppingBag color="#FFF" size={20} />, ['#3B82F6', '#1E40AF'])}
          </View>
          <View style={styles.col3}>
            <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}><Award color="#FFF" size={20} /></View>
                <View style={styles.bestSellerBadge}><Text style={styles.bestSellerTag}>#1</Text></View>
              </View>
              <Text style={styles.cardValue} numberOfLines={1}>{data.monBanChayNhat}</Text>
              <Text style={styles.cardTitle}>Món bán chạy nhất</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.mainLayout}>
          {/* Left Column: Charts & Lists */}
          <View style={styles.leftCol}>
            
            {/* Chart: Peak Hours */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color="#475569" />
                <Text style={styles.sectionTitle}>Giờ cao điểm trong ngày</Text>
              </View>
              <View style={styles.chartArea}>
                {data.peakHours.map((item, idx) => {
                  const maxOrders = Math.max(...data.peakHours.map(h => h.orders)) || 1;
                  const heightPercent = (item.orders / maxOrders) * 100;
                  return (
                    <View key={idx} style={styles.chartCol}>
                      <View style={styles.barWrap}>
                        <View style={[styles.bar, { height: `${heightPercent}%`, backgroundColor: heightPercent > 80 ? '#4A924C' : '#CBD5E1' }]} />
                        {item.orders > 0 && <Text style={styles.barValue}>{item.orders}</Text>}
                      </View>
                      <Text style={styles.barLabel}>{item.hour.split(':')[0]}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Top 5 Best Sellers */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Award size={18} color="#475569" />
                <Text style={styles.sectionTitle}>Top 5 Sản phẩm bán chạy</Text>
              </View>
              {data.top5BanChay.map((item, idx) => (
                <View key={idx} style={styles.productItem}>
                  <View style={styles.rankBadge}><Text style={styles.rankText}>{idx + 1}</Text></View>
                  <Text style={styles.productName}>{item.tenSanPham}</Text>
                  <View style={styles.productProgressWrap}>
                    <View style={[styles.progressBar, { width: `${(item.soLuong / data.top5BanChay[0].soLuong) * 100}%` }]} />
                  </View>
                  <Text style={styles.productQty}>{item.soLuong} món</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right Column: Recent Activity */}
          <View style={styles.rightCol}>
            
            {/* Recent Orders */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <History size={18} color="#4A924C" />
                <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
              </View>
              {recentOrders.map((order, idx) => (
                <View key={idx} style={styles.orderItem}>
                  <View style={styles.orderIcon}>
                    {order.loaiDonHang === 'TAI_BAN' ? <MapPin size={14} color="#64748B" /> : <ShoppingBag size={14} color="#64748B" />}
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderID}>#{order.idHoaDon} - {order.danhSachTenBan?.join(', ') || 'Mang về'}</Text>
                    <Text style={styles.orderTime}>{new Date(order.thoiGianTao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={styles.orderPrice}>{Number(order.tongThanhToan).toLocaleString('vi-VN')}đ</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.viewMoreBtn}>
                <Text style={styles.viewMoreText}>Xem tất cả</Text>
                <ArrowRight size={14} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {/* Order Sources Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Nguồn đơn hàng</Text>
              <View style={styles.sourceList}>
                {data.orderSources.map((source, idx) => (
                  <View key={idx} style={styles.sourceItem}>
                    <View style={styles.sourceHeader}>
                      <Text style={styles.sourceLabel}>{source.label}</Text>
                      <Text style={styles.sourcePercent}>{source.percentage}%</Text>
                    </View>
                    <View style={styles.sourceBarBase}>
                      <View style={[styles.sourceBarFill, { width: `${source.percentage}%`, backgroundColor: idx === 0 ? '#4A924C' : '#3B82F6' }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
  },
  scrollContent: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -12,
    marginBottom: 24,
  },
  col3: {
    flex: 1,
    paddingHorizontal: 12,
  },
  statCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  bestSellerBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestSellerTag: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  mainLayout: {
    flexDirection: 'row',
    gap: 24,
  },
  leftCol: {
    flex: 2,
  },
  rightCol: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  chartArea: {
    height: 180,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  barWrap: {
    flex: 1,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
    position: 'relative',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barValue: {
    position: 'absolute',
    top: -20,
    width: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  barLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  productName: {
    flex: 2,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  productProgressWrap: {
    flex: 2,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A924C',
  },
  productQty: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'right',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderID: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  orderTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A924C',
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  viewMoreText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 14,
  },
  sourceList: {
    marginTop: 10,
  },
  sourceItem: {
    marginBottom: 16,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  sourcePercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  sourceBarBase: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceBarFill: {
    height: '100%',
  },
});

export default StatsTab;
