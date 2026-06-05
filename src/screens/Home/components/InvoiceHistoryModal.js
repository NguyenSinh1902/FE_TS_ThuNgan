import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, Modal, TouchableOpacity, ScrollView, 
  ActivityIndicator, useWindowDimensions, StyleSheet, Image, Alert, TextInput
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import invoiceApi from '../../../api/invoiceApi';
import refundApi from '../../../api/refundApi';
import { listenToFirebase } from '../../../utils/firebaseListener';
import CustomAlert from '../../../components/CustomAlert';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';

const InvoiceHistoryModal = ({ isVisible, invoiceId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [vietQRData, setVietQRData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [activeRefund, setActiveRefund] = useState(null);
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const refundListenerRef = useRef(null);

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'info', buttons = null) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      buttons: buttons || [{ text: 'OK', onPress: () => setCustomAlert(prev => ({ ...prev, visible: false })) }]
    });
  };

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;
  const receiptRef = useRef();

  useEffect(() => {
    return () => {
      if (refundListenerRef.current) refundListenerRef.current.stop();
    };
  }, []);

  const startRefundListener = (idPhieu) => {
    if (refundListenerRef.current) refundListenerRef.current.stop();
    refundListenerRef.current = listenToFirebase(`refund_orders/${idPhieu}`, (data) => {
      if (data && data.trangThai) {
        setActiveRefund(prev => prev ? { ...prev, trangThai: data.trangThai } : data);
        if (data.trangThai === 'DA_DUYET') {
          showCustomAlert('Hoàn tiền đã duyệt!', 'Admin đã duyệt hoàn tiền, vui lòng trả tiền cho khách!', 'success');
        } else if (data.trangThai === 'TU_CHOI') {
          showCustomAlert('Từ chối', 'Admin đã từ chối yêu cầu hoàn tiền này.', 'error');
          if (refundListenerRef.current) refundListenerRef.current.stop();
        }
      }
    });
  };

  const handleOpenRefundModal = () => {
    setRefundReason('');
    setRefundAmount(invoice?.tongThanhToan?.toString() || '');
    setShowRefundModal(true);
  };

  const handleSubmitRefund = async () => {
    if (!refundReason.trim()) {
      showCustomAlert('Lỗi', 'Vui lòng nhập lý do hoàn tiền.', 'warning');
      return;
    }
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      showCustomAlert('Lỗi', 'Số tiền hoàn không hợp lệ.', 'warning');
      return;
    }
    
    try {
      setSubmittingRefund(true);
      const res = await refundApi.createRefundRequest({
        idHoaDon: invoiceId,
        soTienHoan: amount,
        lyDo: refundReason
      });
      setActiveRefund(res);
      setShowRefundModal(false);
      startRefundListener(res.idPhieuHoanTra || res.idPhieu);
      showCustomAlert('Thành công', 'Đã gửi yêu cầu hoàn tiền, vui lòng chờ Admin duyệt.', 'success');
    } catch (err) {
      console.error('Submit refund error', err);
      showCustomAlert('Lỗi', 'Không thể tạo yêu cầu hoàn tiền. Vui lòng thử lại sau.', 'error');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleCompleteRefund = async () => {
    try {
      await refundApi.completeRefund(activeRefund.idPhieuHoanTra || activeRefund.idPhieu);
      setActiveRefund(prev => ({ ...prev, trangThai: 'HOAN_THANH' }));
      showCustomAlert('Thành công', 'Đã hoàn tất quy trình hoàn tiền.', 'success');
      setInvoice(prev => ({...prev, trangThai: 'HOAN_TIEN'}));
      if (refundListenerRef.current) refundListenerRef.current.stop();
    } catch (err) {
      console.error('Complete refund error', err);
      showCustomAlert('Lỗi', 'Không thể hoàn thành phiếu hoàn tiền', 'error');
    }
  };

  const handleReprintInvoice = async () => {
    let uri;
    try {
      uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1.0,
      });
    } catch (err) {
      console.log('Capture error', err);
      Alert.alert('Lỗi', 'Không thể tạo file ảnh hóa đơn');
      return;
    }

    try {
      await Share.open({
        url: uri,
        title: `Hóa đơn ${invoiceId}`,
        message: 'Hóa đơn mua hàng tại MatchTea Coffee',
      });
      setShowReceiptModal(false);
    } catch (err) {
      console.log('Share error or user cancelled', err);
      setShowReceiptModal(false);
    }
  };

  useEffect(() => {
    if (isVisible && invoiceId) {
      setInvoice(null);
      setVietQRData(null);
      setFetchError(null);
      setActiveRefund(null);
      if (refundListenerRef.current) refundListenerRef.current.stop();
      fetchInvoiceDetail();
    } else if (!isVisible) {
      if (refundListenerRef.current) refundListenerRef.current.stop();
    }
  }, [isVisible, invoiceId]);

  const fetchInvoiceDetail = async () => {
    setLoading(true);
    try {
      const response = await invoiceApi.getInvoiceDetails(invoiceId);
      setInvoice(response);
      
      if (response && response.trangThai !== 'DA_HUY') {
        try {
          const qrRes = await invoiceApi.getVietQR(invoiceId);
          setVietQRData(qrRes);
        } catch (err) {
          console.error('Error fetching VietQR:', err);
        }

        try {
          const refundsRes = await refundApi.getAll();
          if (Array.isArray(refundsRes)) {
            const targetId = response.idHoaDon || invoiceId;
            const active = refundsRes.find(r => 
              (r.idHoaDon === targetId || r.hoaDon?.idHoaDon === targetId) && 
              r.trangThai !== 'HOAN_THANH' && r.trangThai !== 'TU_CHOI'
            );
            if (active) {
               setActiveRefund(active);
               startRefundListener(active.idPhieuHoanTra || active.idPhieu);
            }
          }
        } catch (err) {
          console.error('Error fetching refunds:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      setFetchError(error.message || 'Không thể lấy dữ liệu đơn hàng này');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      'CHO_XAC_NHAN': { label: 'Chờ xác nhận', bg: '#F3F4F6', color: '#4A5565' },
      'DANG_PHA_CHE': { label: 'Đang pha chế', bg: 'rgba(139, 163, 103, 0.1)', color: '#8BA367' },
      'CHO_LAY_MON': { label: 'Chờ lấy món', bg: '#FFEDD4', color: '#F54900' },
      'DANG_PHUC_VU': { label: 'Đang phục vụ', bg: '#E0F2FE', color: '#0284C7' },
      'CHO_THANH_TOAN': { label: 'Chờ thanh toán', bg: '#FEF3C6', color: '#E17100' },
      'DA_THANH_TOAN': { label: 'Đã thanh toán', bg: 'rgba(139, 163, 103, 0.2)', color: '#8BA367' },
      'HOAN_TAT': { label: 'Hoàn tất', bg: 'rgba(139, 163, 103, 0.2)', color: '#8BA367' },
      'DA_HUY': { label: 'Đã hủy', bg: '#FFE2E2', color: '#E7000B' },
    };
    return map[status] || { label: status, bg: '#F3F4F6', color: '#4A5565' };
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
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.modalContainer, { width: isTablet ? '60%' : '92%' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Chi tiết hóa đơn #{invoiceId}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.headerSubtitle, { marginTop: 0, marginRight: 8 }]}>Mã giao dịch hệ thống •</Text>
                {invoice?.trangThai ? (
                  <View style={{ backgroundColor: getStatusConfig(invoice.trangThai).bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: getStatusConfig(invoice.trangThai).color }}>
                      {getStatusConfig(invoice.trangThai).label}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.headerSubtitle, { marginTop: 0 }]}>---</Text>
                )}
              </View>
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
          ) : fetchError ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 16, color: '#E7000B', fontWeight: 'bold'}}>{fetchError}</Text>
              <Text style={{marginTop: 8, color: '#64748B'}}>Có thể đơn hàng này đã bị xóa hoặc API lỗi.</Text>
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
                      <Text style={styles.infoLabel}>Thu ngân</Text>
                      <Text style={styles.infoValue}>{invoice.tenThuNgan || '---'}</Text>
                    </View>
                    {invoice.tenPhucVu && (
                      <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Phục vụ</Text>
                        <Text style={styles.infoValue}>{invoice.tenPhucVu}</Text>
                      </View>
                    )}
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
                          {item.danhSachTopping && item.danhSachTopping.length > 0 && (
                            <Text style={styles.itemOptions}>
                              + {item.danhSachTopping.map(t => `${t.tenSanPham || t.tenTopping}${t.soLuong > 1 ? ` (x${t.soLuong})` : ''}`).join(', ')}
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

                  {/* Refund Actions */}
                  {(invoice.trangThai === 'DA_THANH_TOAN' || invoice.trangThai === 'HOAN_TAT') && (
                    <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 }}>
                      {!activeRefund ? (
                        <TouchableOpacity style={[styles.payBtnPopup, { backgroundColor: '#F59E0B' }]} onPress={handleOpenRefundModal}>
                          <Text style={styles.payBtnTextPopup}>↩ Yêu cầu hoàn tiền</Text>
                        </TouchableOpacity>
                      ) : activeRefund.trangThai === 'CHO_DUYET' ? (
                        <View style={{ backgroundColor: '#FEF3C6', padding: 16, borderRadius: 12, alignItems: 'center' }}>
                          <ActivityIndicator color="#E17100" />
                          <Text style={{ color: '#E17100', fontWeight: '700', marginTop: 8 }}>Đang chờ Admin duyệt hoàn tiền...</Text>
                        </View>
                      ) : activeRefund.trangThai === 'DA_DUYET' ? (
                        <View style={{ backgroundColor: '#E0F2FE', padding: 16, borderRadius: 12, alignItems: 'center' }}>
                          <Text style={{ color: '#0284C7', fontWeight: '700', marginBottom: 12 }}>Admin đã duyệt! Vui lòng trả tiền cho khách.</Text>
                          <TouchableOpacity style={[styles.payBtnPopup, { backgroundColor: '#0284C7', width: '100%' }]} onPress={handleCompleteRefund}>
                            <Text style={styles.payBtnTextPopup}>Xác nhận đã trả tiền & Đóng phiếu</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  )}
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
                        
                        {invoice.giamGiaThanhVien > 0 && (
                          <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Thành viên</Text>
                            <Text style={[styles.totalValue, {color: '#8BA367'}]}>-{formatPrice(invoice.giamGiaThanhVien)}</Text>
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

                      {invoice.trangThai !== 'DA_HUY' && (
                        <View style={styles.receiptQR}>
                          <Image 
                            source={vietQRData?.qrImageUrl ? { uri: vietQRData.qrImageUrl } : require('../../../assets/images/qr_pay.png')}
                            style={{ width: 120, height: 120 }}
                            resizeMode="contain"
                          />
                          <Text style={styles.receiptFooter}>Quét để kiểm tra giao dịch</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  <View style={{flexDirection: 'row', gap: 12}}>
                    <TouchableOpacity style={[styles.printBtn, { flex: 1, backgroundColor: '#F1F5F9', shadowOpacity: 0, borderWidth: 1, borderColor: '#E2E8F0' }]} onPress={onClose}>
                      <Text style={[styles.printBtnText, { color: '#64748B' }]}>Đóng</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.printBtn, { flex: 2 }]} onPress={() => setShowReceiptModal(true)}>
                      <Text style={styles.printBtnText}>🖨️ Xuất lại hóa đơn</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* 📄 PHYSICAL RECEIPT MODAL */}
      <Modal visible={showReceiptModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptPaperPopup}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 600 }}>
              <View ref={receiptRef} collapsable={false} style={{ backgroundColor: '#FFF', padding: 10 }}>
                <Text style={styles.receiptBrand}>MATCHTEA COFFEE</Text>
                <Text style={styles.receiptSubBrand}>Đ/C: 888 Đường Lê Trọng Tấn, Q. Tân Phú, TP.HCM</Text>

                <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Bàn:</Text>
                  <Text style={styles.receiptValue}>{invoice?.danhSachTenBan?.join(', ') || (invoice?.loaiDonHang === 'MANG_VE' ? 'Mang về' : 'Giao hàng')}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Ngày:</Text>
                  <Text style={styles.receiptValue}>
                    {new Date(invoice?.thoiGianThanhToan || invoice?.thoiGianTao || new Date()).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Thu ngân:</Text>
                  <Text style={styles.receiptValue}>{invoice?.tenThuNgan || '---'}</Text>
                </View>

                {invoice?.tenPhucVu && (
                  <View style={[styles.receiptRow, { marginTop: 4 }]}>
                    <Text style={styles.receiptLabel}>Phục vụ:</Text>
                    <Text style={styles.receiptValue}>{invoice.tenPhucVu}</Text>
                  </View>
                )}

                {invoice?.tenKhachHang && (
                  <View style={[styles.receiptRow, { marginTop: 4 }]}>
                    <Text style={styles.receiptLabel}>Khách hàng:</Text>
                    <Text style={styles.receiptValue}>{invoice.tenKhachHang}</Text>
                  </View>
                )}

                <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

                {(invoice?.danhSachChiTiet || []).map((item, idx) => {
                  let details = item.tenKichCo || '';
                  try {
                    if (item.tuyChonJson) {
                      const opts = JSON.parse(item.tuyChonJson);
                      if (opts.da) details += ` • Đá: ${opts.da}`;
                      if (opts.duong) details += ` • Đường: ${opts.duong}`;
                    }
                  } catch (e) { }

                  const toppingNames = (item.danhSachTopping || []).map(t => `${t.tenSanPham || t.tenTopping}${t.soLuong > 1 ? ` (x${t.soLuong})` : ''}`).join(', ');

                  return (
                    <View key={idx} style={{ marginBottom: 6 }}>
                      <View style={styles.receiptRow}>
                        <Text style={styles.receiptItemName}>{item.tenSanPham}</Text>
                        <Text style={styles.receiptItemQty}>x{item.soLuong}</Text>
                        <Text style={styles.receiptItemPrice}>{formatPrice(item.thanhTien)}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#64748B' }}>{details}</Text>
                      {toppingNames.length > 0 && (
                        <Text style={{ fontSize: 11, color: '#64748B' }}>+ Topping: {toppingNames}</Text>
                      )}
                    </View>
                  );
                })}

                <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

                {/* Chi tiết thanh toán */}
                <View style={{ gap: 4 }}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptItemName}>Tiền hàng</Text>
                    <Text style={styles.receiptItemPrice}>{formatPrice(invoice?.tongTienHang)}</Text>
                  </View>

                  {invoice?.diemSuDung > 0 && (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptItemName}>Cấn trừ điểm</Text>
                      <Text style={[styles.receiptItemPrice, { color: '#8BA367' }]}>-{formatPrice(invoice.diemSuDung * 1000)}</Text>
                    </View>
                  )}

                  {invoice?.giamGiaKhuyenMai > 0 && (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptItemName}>Khuyến mãi {invoice?.maKhuyenMai ? `(${invoice.maKhuyenMai})` : ''}</Text>
                      <Text style={[styles.receiptItemPrice, { color: '#8BA367' }]}>-{formatPrice(invoice.giamGiaKhuyenMai)}</Text>
                    </View>
                  )}

                  {invoice?.giamGiaThanhVien > 0 && (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptItemName}>Giảm giá TV</Text>
                      <Text style={[styles.receiptItemPrice, { color: '#8BA367' }]}>-{formatPrice(invoice.giamGiaThanhVien)}</Text>
                    </View>
                  )}

                  {invoice?.danhSachThuePhi?.map((t, i) => (
                    <View key={i} style={styles.receiptRow}>
                      <Text style={styles.receiptItemName}>{t.tenThuePhi}</Text>
                      <Text style={styles.receiptItemPrice}>+{formatPrice(t.soTienQuyDoi)}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptTotalLabel}>TỔNG CỘNG</Text>
                  <Text style={styles.receiptTotalValue}>{formatPrice(invoice?.tongThanhToan)}</Text>
                </View>

                {invoice?.trangThai !== 'DA_HUY' && (
                  <>
                    <View style={styles.receiptQRPopup}>
                      <Image
                        source={vietQRData?.qrImageUrl ? { uri: vietQRData.qrImageUrl } : require('../../../assets/images/qr_pay.png')}
                        style={styles.receiptQRImg}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: 8, color: '#1E293B' }}>
                      {vietQRData?.nộiDungChuyenKhoan ? `Nội dung CK: ${vietQRData.nộiDungChuyenKhoan}` : 'STK: 0123456789 - MB Bank'}
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 10, color: '#64748B', marginTop: 2 }}>
                      CTK: MATCHTEA COFFEE
                    </Text>
                  </>
                )}

                <Text style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 20, fontStyle: 'italic' }}>
                  Cảm ơn quý khách. Hẹn gặp lại!
                </Text>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.payBtnPopup, { flex: 1, backgroundColor: '#4A924C' }]}
                onPress={handleReprintInvoice}
              >
                <Text style={styles.payBtnTextPopup}>LƯU & CHIA SẺ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payBtnPopup, { flex: 1, backgroundColor: '#1E293B' }]}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.payBtnTextPopup}>ĐÓNG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🧾 REFUND MODAL */}
      <Modal visible={showRefundModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.receiptModalOverlay}>
          <View style={[styles.receiptPaperPopup, { width: 450 }]}>
            <Text style={[styles.sectionTitle, { textAlign: 'center', marginBottom: 16 }]}>Yêu cầu hoàn tiền</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.receiptLabel}>Số tiền cần hoàn:</Text>
              <TextInput 
                style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 16, marginTop: 8, color: '#1E293B', fontWeight: '700' }}
                value={refundAmount}
                onChangeText={setRefundAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={styles.receiptLabel}>Lý do hoàn trả:</Text>
              <TextInput 
                style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 16, marginTop: 8, minHeight: 80, textAlignVertical: 'top', color: '#1E293B' }}
                value={refundReason}
                onChangeText={setRefundReason}
                placeholder="Ví dụ: Nước chua, nhầm size..."
                multiline
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={[styles.payBtnPopup, { flex: 1, backgroundColor: '#EF4444' }]} 
                onPress={handleSubmitRefund}
                disabled={submittingRefund}
              >
                {submittingRefund ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnTextPopup}>Gửi yêu cầu</Text>}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.payBtnPopup, { flex: 1, backgroundColor: '#F1F5F9' }]} 
                onPress={() => setShowRefundModal(false)}
                disabled={submittingRefund}
              >
                <Text style={[styles.payBtnTextPopup, { color: '#64748B' }]}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        type={customAlert.type}
        buttons={customAlert.buttons}
        onClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
      />
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
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptPaperPopup: {
    width: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '90%',
  },
  iptDashDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  receiptValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  receiptItemName: {
    fontSize: 13,
    color: '#1E293B',
    flex: 2,
  },
  receiptItemQty: {
    fontSize: 13,
    color: '#64748B',
    flex: 0.5,
    textAlign: 'center',
  },
  receiptItemPrice: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  receiptTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E293B',
  },
  receiptTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  receiptQRPopup: {
    alignItems: 'center',
    marginTop: 20,
  },
  receiptQRImg: {
    width: 120,
    height: 120,
  },
  payBtnPopup: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnTextPopup: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default InvoiceHistoryModal;
