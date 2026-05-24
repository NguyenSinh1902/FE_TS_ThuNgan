import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  ActivityIndicator, StyleSheet, RefreshControl, Modal, Pressable
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DatePicker from 'react-native-date-picker';
import { Bell } from 'lucide-react-native';
import invoiceApi from '../../../api/invoiceApi';
import InvoiceHistoryModal from './InvoiceHistoryModal';

const HistoryTab = ({ onShowNoti }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTime, setSelectedTime] = useState('ALL');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedTime === 'RANGE' && startDate && endDate) {
        const formatYMD = (d) => {
          const m = d.getMonth() + 1;
          const day = d.getDate();
          return `${d.getFullYear()}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
        };
        response = await invoiceApi.filterByDateRange(formatYMD(startDate), formatYMD(endDate));
      } else {
        response = await invoiceApi.getAll();
      }

      if (response && Array.isArray(response)) {
        const sorted = response.sort((a, b) => new Date(b.thoiGianTao) - new Date(a.thoiGianTao));
        setInvoices(sorted);
      } else if (response && response.data) {
        const sorted = response.data.sort((a, b) => new Date(b.thoiGianTao) - new Date(a.thoiGianTao));
        setInvoices(sorted);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApplyFilter = () => {
    setShowFilterModal(false);
    fetchInvoices();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return { bg: '#FEF3C7', color: '#B45309', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE': return { bg: '#DBEAFE', color: '#1E40AF', label: 'Đang pha chế' };
      case 'CHO_LAY_MON': return { bg: '#CCFBF1', color: '#0F766E', label: 'Chờ lấy món' };
      case 'DANG_PHUC_VU': return { bg: '#DCFCE7', color: '#166534', label: 'Đang phục vụ' };
      case 'CHO_THANH_TOAN': return { bg: '#FFEDD5', color: '#9A3412', label: 'Chờ thanh toán' };
      case 'DA_THANH_TOAN': return { bg: '#F3E8FF', color: '#6B21A8', label: 'Đã thanh toán' };
      case 'HOAN_TAT': return { bg: '#D1FAE5', color: '#065F46', label: 'Hoàn tất' };
      case 'DA_HUY': return { bg: '#FEE2E2', color: '#991B1B', label: 'Đã hủy' };
      default: return { bg: '#F1F5F9', color: '#475569', label: status };
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.idHoaDon.toString().includes(searchQuery) || 
      (inv.tenKhachHang && inv.tenKhachHang.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.danhSachTenBan && inv.danhSachTenBan.join(', ').toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || inv.trangThai === selectedStatus;

    let matchesTime = true;
    if (selectedTime === 'TODAY') {
      const orderDate = new Date(inv.thoiGianTao);
      const today = new Date();
      matchesTime = orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  const renderInvoiceRow = ({ item }) => {
    const status = getStatusStyle(item.trangThai);
    const date = new Date(item.thoiGianTao);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;

    return (
      <TouchableOpacity style={styles.orderRow} onPress={() => setSelectedInvoiceId(item.idHoaDon)}>
        <View style={{ width: 80 }}><Text style={[styles.cellText, styles.orderIdText]}>#{item.idHoaDon}</Text></View>
        <View style={{ width: 140 }}><Text style={styles.cellText}>{timeStr}</Text></View>
        <View style={{ flex: 1 }}><Text style={styles.cellText} numberOfLines={1}>{item.loaiDonHang === 'MANG_VE' ? '🛍️ Mang về' : `🪑 ${item.danhSachTenBan?.join(', ') || 'Tại bàn'}`}</Text></View>
        <View style={{ flex: 1.5 }}><Text style={styles.cellText} numberOfLines={1}>{item.tenKhachHang || '👤 Khách vãng lai'}</Text></View>
        <View style={{ flex: 1.2 }}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={{ width: 120, alignItems: 'flex-end' }}>
          <Text style={[styles.cellText, styles.priceText]}>{Number(item.tongThanhToan || 0).toLocaleString()}đ</Text>
        </View>
        <View style={{ width: 60, alignItems: 'flex-end' }}>
           <View style={styles.actionIcon}>
              <Text style={{color: '#8BA367', fontWeight: '900'}}>→</Text>
           </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lịch sử hóa đơn</Text>
          <Text style={styles.subtitle}>Danh sách toàn bộ giao dịch tại cửa hàng</Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.searchBox}>
            <Text style={{fontSize: 18}}>🔍</Text>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Tìm mã đơn, tên bàn, khách hàng..." 
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={[styles.filterBtn, { width: 48, paddingHorizontal: 0, justifyContent: 'center' }]} onPress={() => setShowFilterModal(true)}>
             <View style={{ gap: 3, alignItems: 'center' }}>
                <View style={{ width: 16, height: 2, backgroundColor: '#475569', borderRadius: 1 }} />
                <View style={{ width: 10, height: 2, backgroundColor: '#475569', borderRadius: 1, alignSelf: 'center' }} />
                <View style={{ width: 4, height: 2, backgroundColor: '#475569', borderRadius: 1, alignSelf: 'center' }} />
              </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, { width: 48, paddingHorizontal: 0, justifyContent: 'center' }]} onPress={onShowNoti}>
             <Bell size={20} color="#FF9800" strokeWidth={1.5} />
             <View style={{
                position: 'absolute', top: 10, right: 10, width: 8, height: 8,
                backgroundColor: '#EF4444', borderRadius: 4,
                borderWidth: 1.5, borderColor: '#FFFFFF'
             }} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <View style={{ width: 80 }}><Text style={styles.headerCell}>Mã đơn</Text></View>
          <View style={{ width: 140 }}><Text style={styles.headerCell}>Thời gian</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.headerCell}>Loại đơn / Bàn</Text></View>
          <View style={{ flex: 1.5 }}><Text style={styles.headerCell}>Khách hàng</Text></View>
          <View style={{ flex: 1.2 }}><Text style={styles.headerCell}>Trạng thái</Text></View>
          <View style={{ width: 120, alignItems: 'flex-end' }}><Text style={styles.headerCell}>Tổng tiền</Text></View>
          <View style={{ width: 60 }}><Text style={styles.headerCell}></Text></View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#8BA367" />
            <Text style={{marginTop: 12, color: '#64748B'}}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <FlatList 
            data={filteredInvoices}
            keyExtractor={item => item.idHoaDon.toString()}
            renderItem={renderInvoiceRow}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8BA367']} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 60 }}>📂</Text>
                <Text style={styles.emptyTitle}>Không tìm thấy hóa đơn nào</Text>
                <Text style={styles.emptySubtitle}>Dữ liệu lịch sử hiện tại đang trống hoặc không khớp từ khóa tìm kiếm</Text>
              </View>
            }
          />
        )}
      </View>

      <InvoiceHistoryModal 
        isVisible={!!selectedInvoiceId} 
        invoiceId={selectedInvoiceId} 
        onClose={() => setSelectedInvoiceId(null)} 
      />

      <Modal visible={showFilterModal} transparent={true} animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowFilterModal(false)}>
          <Pressable style={{ width: 400, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }} onPress={e => e.stopPropagation()}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 20 }}>Lọc hóa đơn</Text>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>Thời gian</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Pressable
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedTime === 'ALL' ? '#10B981' : '#E2E8F0', backgroundColor: selectedTime === 'ALL' ? '#F0FDF4' : '#FFFFFF', alignItems: 'center' }}
                onPress={() => setSelectedTime('ALL')}
              >
                <Text style={{ color: selectedTime === 'ALL' ? '#047857' : '#475569', fontWeight: '600' }}>Tất cả</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedTime === 'TODAY' ? '#10B981' : '#E2E8F0', backgroundColor: selectedTime === 'TODAY' ? '#F0FDF4' : '#FFFFFF', alignItems: 'center' }}
                onPress={() => setSelectedTime('TODAY')}
              >
                <Text style={{ color: selectedTime === 'TODAY' ? '#047857' : '#475569', fontWeight: '600' }}>Hôm nay</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1.5, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedTime === 'RANGE' ? '#10B981' : '#E2E8F0', backgroundColor: selectedTime === 'RANGE' ? '#F0FDF4' : '#FFFFFF', alignItems: 'center' }}
                onPress={() => {
                  setSelectedTime('RANGE');
                  setOpenStartDatePicker(true);
                }}
              >
                <Text style={{ color: selectedTime === 'RANGE' ? '#047857' : '#475569', fontWeight: '600' }}>Khoảng ngày</Text>
              </Pressable>
            </View>

            {selectedTime === 'RANGE' && startDate && endDate && (
              <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, color: '#475569' }}>
                  Từ: <Text style={{ fontWeight: '600', color: '#1E293B' }}>{startDate.toLocaleDateString('vi-VN')}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: '#475569' }}>
                  Đến: <Text style={{ fontWeight: '600', color: '#1E293B' }}>{endDate.toLocaleDateString('vi-VN')}</Text>
                </Text>
                <Pressable onPress={() => setOpenStartDatePicker(true)}>
                  <Text style={{ fontSize: 13, color: '#10B981', fontWeight: '600' }}>Sửa</Text>
                </Pressable>
              </View>
            )}

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 10 }}>Trạng thái</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              <Pressable
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: selectedStatus === 'ALL' ? '#10B981' : '#E2E8F0', backgroundColor: selectedStatus === 'ALL' ? '#F0FDF4' : '#FFFFFF' }}
                onPress={() => setSelectedStatus('ALL')}
              >
                <Text style={{ color: selectedStatus === 'ALL' ? '#047857' : '#475569', fontSize: 13, fontWeight: '500' }}>Tất cả</Text>
              </Pressable>
              {['CHO_XAC_NHAN', 'DANG_PHA_CHE', 'CHO_LAY_MON', 'DANG_PHUC_VU', 'CHO_THANH_TOAN', 'DA_THANH_TOAN', 'HOAN_TAT', 'DA_HUY'].map(status => {
                const style = getStatusStyle(status);
                const isSelected = selectedStatus === status;
                return (
                  <Pressable
                    key={status}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: isSelected ? '#10B981' : '#E2E8F0', backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF' }}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text style={{ color: isSelected ? '#047857' : '#475569', fontSize: 13, fontWeight: '500' }}>{style.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={{ width: '100%', padding: 14, backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center' }}
              onPress={handleApplyFilter}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Áp dụng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <DatePicker
        modal
        open={openStartDatePicker}
        date={startDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenStartDatePicker(false);
          setStartDate(date);
          setOpenEndDatePicker(true);
        }}
        onCancel={() => {
          setOpenStartDatePicker(false);
        }}
      />
      <DatePicker
        modal
        open={openEndDatePicker}
        date={endDate || startDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenEndDatePicker(false);
          setEndDate(date);
        }}
        onCancel={() => {
          setOpenEndDatePicker(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1B2A15',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 350,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 10,
    fontSize: 15,
    color: '#1E293B',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  filterBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  tableCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cellText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
  orderIdText: {
    color: '#8BA367',
    fontWeight: '800',
  },
  priceText: {
    color: '#1E293B',
    fontWeight: '900',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 400,
  },
});

export default HistoryTab;
