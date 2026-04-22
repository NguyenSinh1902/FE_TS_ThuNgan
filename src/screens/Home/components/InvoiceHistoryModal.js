import React, { useState, useEffect } from 'react';
import { 
  View, Text, Modal, TouchableOpacity, ScrollView, 
  ActivityIndicator, useWindowDimensions, StyleSheet, Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import invoiceApi from '../../../api/invoiceApi';

const InvoiceHistoryModal = ({ isVisible, invoiceId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  useEffect(() => {
    if (isVisible && invoiceId) {
      fetchInvoiceDetail();
    }
  }, [isVisible, invoiceId]);

  const fetchInvoiceDetail = async () => {
    setLoading(true);
    try {
      const response = await invoiceApi.getInvoiceDetails(invoiceId);
      setInvoice(response);
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      'CHO_XAC_NHAN': 'Chờ xác nhận',
      'DANG_PHA_CHE': 'Đang pha chế',
      'CHO_LAY_MON': 'Chờ lấy món',
      'DANG_PHUC_VU': 'Đang phục vụ',
      'CHO_THANH_TOAN': 'Chờ thanh toán',
      'DA_THANH_TOAN': 'Đã thanh toán',
      'HOAN_TAT': 'Hoàn tất',
      'DA_HUY': 'Đã hủy',
    };
    return map[status] || status;
  };

  const formatTime = (isoString) => {
    if (!isoString) return '---';
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatPrice = (p) => {
    if (p === null || p === undefined || isNaN(p)) return '0đ';
    return Number(p).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, { width: isTablet ? '60%' : '92%' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Chi tiết hóa đơn #{invoiceId}</Text>
              <Text style={styles.headerSubtitle}>Mã giao dịch hệ thống • {invoice?.trangThai ? getStatusLabel(invoice.trangThai) : '---'}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8BA367" />
              <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
          ) : invoice ? (
            <View style={{flex: 1, flexDirection: 'row'}}>
               {/* Left Column - Details */}
               <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1.2, borderRightWidth: 1, borderColor: '#F1F5F9' }} contentContainerStyle={styles.scrollContent}>
                  
                  {/* Summary Info Cards */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Loại đơn hàng</Text>
                      <Text style={styles.infoValue}>{invoice.loaiDonHang === 'MANG_VE' ? '🛍️ Mang về' : `🪑 Tại bàn (${invoice.danhSachTenBan?.join(', ') || '---'})`}</Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Nhân viên lập</Text>
                      <Text style={styles.infoValue}>{invoice.tenNhanVien || '---'}</Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Khách hàng</Text>
                      <Text style={styles.infoValue}>{invoice.tenKhachHang || 'Khách vãng lai'}</Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Phương thức</Text>
                      <Text style={styles.infoValue}>{invoice.phuongThucThanhToan === 'TIEN_MAT' ? '💵 Tiền mặt' : invoice.phuongThucThanhToan === 'CHUYEN_KHOAN' ? '📱 Chuyển khoản' : '---'}</Text>
                    </View>
                  </View>

                  {/* Items Table */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                    <View style={styles.itemsHeader}>
                       <Text style={[styles.itemHeaderText, { flex: 2 }]}>Tên sản phẩm</Text>
                       <Text style={[styles.itemHeaderText, { flex: 0.5, textAlign: 'center' }]}>SL</Text>
                       <Text style={[styles.itemHeaderText, { flex: 1, textAlign: 'right' }]}>Thành tiền</Text>
                    </View>
                    {invoice.danhSachChiTiet?.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <View style={{ flex: 2 }}>
                          <Text style={styles.itemName}>{item.tenSanPham}</Text>
                          <Text style={styles.itemSub}>{item.tenKichCo}</Text>
                          {item.tuyChonJson && (
                            <Text style={styles.itemOptions}>
                              {Object.values(JSON.parse(item.tuyChonJson)).filter(v => v).join(' • ')}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.itemQty, { flex: 0.5 }]}>x{item.soLuong}</Text>
                        <Text style={[styles.itemPrice, { flex: 1 }]}>{formatPrice(item.thanhTien)}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Timestamps */}
                  <View style={styles.timestampSection}>
                    <View style={styles.timeRow}><Text style={styles.timeLabel}>Thời gian tạo:</Text><Text style={styles.timeValue}>{formatTime(invoice.thoiGianTao)}</Text></View>
                    {invoice.thoiGianThanhToan && (
                      <View style={styles.timeRow}><Text style={styles.timeLabel}>Thời gian thanh toán:</Text><Text style={styles.timeValue}>{formatTime(invoice.thoiGianThanhToan)}</Text></View>
                    )}
                  </View>
               </ScrollView>

               {/* Right Column - Receipt Preview */}
               <View style={{ flex: 0.8, backgroundColor: '#F8FAFC', padding: 20 }}>
                  <Text style={styles.sectionTitle}>Bản xem trước hóa đơn</Text>
                  
                  <View style={styles.receiptPaper}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.receiptBrand}>MATCHTEA COFFEE</Text>
                      <Text style={styles.receiptSubBrand}>Biên lai thanh toán điện tử</Text>
                      
                      <View style={styles.receiptDivider} />
                      
                      <View style={styles.receiptSummary}>
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>Tiền hàng</Text>
                          <Text style={styles.totalValue}>{formatPrice(invoice.tongTienHang)}</Text>
                        </View>
                        
                        {invoice.giamGiaKhuyenMai > 0 && (
                          <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Khuyến mãi ({invoice.maKhuyenMai})</Text>
                            <Text style={[styles.totalValue, {color: '#8BA367'}]}>-{formatPrice(invoice.giamGiaKhuyenMai)}</Text>
                          </View>
                        )}
                        
                        {invoice.diemSuDung > 0 && (
                          <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Dùng điểm</Text>
                            <Text style={[styles.totalValue, {color: '#8BA367'}]}>-{formatPrice(invoice.diemSuDung * 1000)}</Text>
                          </View>
                        )}

                        {invoice.danhSachThuePhi?.map((t, i) => (
                          <View key={i} style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t.tenThuePhi}</Text>
                            <Text style={styles.totalValue}>+{formatPrice(t.soTienQuyDoi)}</Text>
                          </View>
                        ))}

                        <View style={[styles.totalRow, {marginTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12}]}>
                          <Text style={[styles.totalLabel, {fontWeight: '900', color: '#1E293B'}]}>TỔNG CỘNG</Text>
                          <Text style={[styles.totalValue, {fontSize: 20, color: '#1E293B', fontWeight: '900'}]}>{formatPrice(invoice.tongThanhToan)}</Text>
                        </View>
                      </View>

                      <View style={styles.receiptQR}>
                        <Image 
                          source={require('../../../assets/images/qr_pay.png')}
                          style={{ width: 120, height: 120 }}
                          resizeMode="contain"
                        />
                        <Text style={styles.receiptFooter}>Quét để kiểm tra giao dịch</Text>
                      </View>
                    </ScrollView>
                  </View>

                  <TouchableOpacity style={styles.printBtn}>
                    <Text style={styles.printBtnText}>🖨️ In lại hóa đơn</Text>
                  </TouchableOpacity>
               </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 20,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  itemHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  itemOptions: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemQty: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8BA367',
    textAlign: 'right',
  },
  receiptPaper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  receiptBrand: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  receiptSubBrand: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  receiptDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  receiptQR: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  receiptFooter: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    fontStyle: 'italic',
  },
  timestampSection: {
    gap: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  printBtn: {
    height: 56,
    backgroundColor: '#8BA367',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8BA367',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  printBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default InvoiceHistoryModal;
