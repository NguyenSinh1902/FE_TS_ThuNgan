import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Image,
  Alert
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import invoiceApi from '../../api/invoiceApi';
import promotionApi from '../../api/promotionApi';
import reservationApi from '../../api/reservationApi';
import customerApi from '../../api/customerApi';
import staffApi from '../../api/staffApi';
import safeAsyncStorage from '../../utils/storage';
import { listenToFirebase } from '../../utils/firebaseListener';
import NewMemberModal from './components/NewMemberModal';
import MemberModal from './components/MemberModal';
import styles from './OrderDetails.styles';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';



const MOCK_FEES = [
  // Replaced by API - kept only as fallback shape reference
];

const ORDER_ITEMS = [
  { id: '1', emoji: '🍵', qty: 2, name: 'Trà xanh Matcha', details: 'Size: L • Trân châu trắng, Thạch', unitPrice: 45000 },
  { id: '2', emoji: '🍑', qty: 1, name: 'Trà đào cam sả', details: 'Size: M • Thạch đào', unitPrice: 38000 },
  { id: '3', emoji: '🍵', qty: 1, name: 'Matcha latte', details: 'Size: L', unitPrice: 52000 },
];

const { width } = Dimensions.get('window');

const OrderDetails = ({ onNavigate, params }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [fees, setFees] = useState([]);

  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('CHO_XAC_NHAN');
  const [currentUser, setCurrentUser] = useState(null);

  // Customer / Membership
  const [searchPhone, setSearchPhone] = useState('');
  const [foundMember, setFoundMember] = useState(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [showModalDangKy, setShowModalDangKy] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [pointsToUse, setPointsToUse] = useState('');

  // Vouchers & Fees
  const [vouchers, setVouchers] = useState([]);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);

  // Custom Table/Modal Addons
  const [reservation, setReservation] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);

  // Payment
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [completingOrder, setCompletingOrder] = useState(false);

  // Invoice / Receipt
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [realtimeRefreshing, setRealtimeRefreshing] = useState(false); // silent refresh indicator
  
  const receiptRef = useRef();

  const handleDownloadInvoice = async () => {
    let uri;
    try {
      uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1.0,
      });
    } catch (err) {
      console.log('Capture error', err);
      handleShowToast('Không thể tạo file ảnh hóa đơn', 'warning');
      return;
    }

    try {
      await Share.open({
        url: uri,
        title: 'Hóa đơn MatchTea',
        message: 'Hóa đơn mua hàng tại MatchTea Coffee',
      });
      setShowReceiptModal(false);
      handleShowToast('Thao tác thành công!', 'success');
    } catch (err) {
      // Khi người dùng bấm In hoặc Share xong, Android đôi khi không trả về kết quả chuẩn mà ném ra exception "cancel"
      // Nên ta cứ mặc định là họ đã thao tác thành công hoặc chủ động đóng.
      setShowReceiptModal(false);
      handleShowToast('Thao tác thành công!', 'success');
    }
  };

  // Remove real-time search via useEffect - replace with manual button search

  useEffect(() => {
    if (params?.invoiceId) {
      fetchInvoiceDetail(params.invoiceId);
    } else {
      setLoading(false);
    }
    fetchFees();
    fetchVouchers();
    fetchReservation();
    fetchUserProfile();

    // ─── Firebase Realtime: theo dõi đơn này để tự động refresh khi Phục vụ thêm món ───
    if (!params?.invoiceId) return;
    const targetId = Number(params.invoiceId);
    // Snapshot lastUpdate/tongThanhToan hiện tại để so sánh
    let lastSnapshot = null;

    const orderListener = listenToFirebase('orders', firebaseOrders => {
      if (!firebaseOrders || typeof firebaseOrders !== 'object') return;
      // Tìm đơn khớp với invoiceId hiện tại
      const fbOrder = Object.values(firebaseOrders).find(
        o => o !== null && o?.idHoaDon == targetId
      );
      if (!fbOrder) return;

      // Tạo snapshot key gồm cả tongThanhToan và lastUpdate
      const snapshot = `${fbOrder.tongThanhToan}_${fbOrder.lastUpdate || ''}_${fbOrder.trangThai}`;
      if (lastSnapshot === null) {
        // Lần đầu: ghi lại snapshot, chưa refresh
        lastSnapshot = snapshot;
        return;
      }
      if (snapshot === lastSnapshot) return; // Không có thay đổi

      // Có thay đổi (thêm món, sửa món, đổi trạng thái) → refresh đầy đủ từ API
      lastSnapshot = snapshot;
      setRealtimeRefreshing(true);
      fetchInvoiceDetail(targetId).finally(() => setRealtimeRefreshing(false));
    });

    return () => orderListener.stop();
  }, [params?.invoiceId, params?.tableName]);

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

  const fetchReservation = async () => {
    try {
      const res = await reservationApi.getActiveReservations();
      if (Array.isArray(res)) {
        // MATCH: params.tableName (e.g., 'Bàn VIP 01') includes or equals the API tenBan
        const found = res.find(r => r.danhSachBan?.some(b => params?.tableName?.includes(b.tenBan)));
        if (found) {
          setReservation(found);
        }
      }
    } catch (err) {
      console.log('Failed to fetch reservations', err);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res = await promotionApi.getActive();
      setVouchers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
    }
  };

  const handleCheckVoucherCode = async () => {
    if (!voucherCode.trim()) return;
    try {
      setCheckingVoucher(true);
      const res = await promotionApi.checkCode(voucherCode.trim(), subtotal);
      setAppliedVoucher(res);
    } catch (err) {
      setAppliedVoucher(null);
      console.error('Invalid voucher code:', err);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const fetchFees = async () => {
    try {
      const res = await invoiceApi.getFees();
      const apiData = Array.isArray(res) ? res : [];
      setFees(apiData);
      // Auto-select fees that are default
      const defaultIds = apiData.filter(f => f.laMacDinh).map(f => f.idThuePhi);
      setSelectedFees(defaultIds);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
    }
  };

  const handleSearchCustomer = async () => {
    if (!searchPhone.trim()) return;
    try {
      setSearchingCustomer(true);
      setFoundMember(null);
      setShowCreateForm(false);
      const customer = await customerApi.searchByPhone(searchPhone.trim());
      if (customer) {
        setFoundMember(customer);
      } else {
        setShowCreateForm(true);
      }
    } catch (err) {
      setShowCreateForm(true);
    } finally {
      setSearchingCustomer(false);
    }
  };

  const handleCreateCustomer = async (payload) => {
    try {
      const res = await customerApi.create(payload);
      setFoundMember(res);
      // Auto use the freshly created member's points/details
    } catch (err) {
      console.error('Create customer failed:', err);
    }
  };

  const fetchInvoiceDetail = async (id) => {
    try {
      setLoading(true);
      const res = await invoiceApi.getInvoiceDetails(id);
      setInvoice(res);

      if (res?.trangThai) {
        setCurrentStatus(res.trangThai);
      }
    } catch (err) {
      console.error('Failed to fetch invoice detail', err);
    } finally {
      setLoading(false);
    }
  };

  const buildPaymentBody = () => {
    let maCode = null;
    if (appliedVoucher) {
      maCode = appliedVoucher.maCode;
    } else if (selectedVouchers.length > 0) {
      const v = vouchers.find(x => x.idKhuyenMai === selectedVouchers[0]);
      maCode = v?.maCode || null;
    }
    const extraFeeIds = selectedFees.filter(id => !fees.find(f => f.idThuePhi === id)?.laMacDinh);

    const customerId = foundMember?.idKhachHang || foundMember?.id;
    const body = {
      idKhachHang: customerId ? Number(customerId) : null,
      idKhach: customerId ? Number(customerId) : null, // Fallback for some API versions
      maCode,
      diemSuDung: parseInt(pointsToUse) || 0,
      danhSachIdThuePhi: extraFeeIds
    };
    console.log('--- Payment Body ---', body);
    return body;
  };

  const handleOpenPayment = async () => {
    if (!params?.invoiceId) return;
    setPreviewInvoice(null);
    setPaymentDone(false);
    setIsPaymentModalVisible(true);
    try {
      setLoadingPreview(true);
      const res = await invoiceApi.previewPayment(params.invoiceId, buildPaymentBody());
      setPreviewInvoice(res);
    } catch (err) {
      console.error('Preview failed:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleShowToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 1000);
  };

  const handlePrintInvoice = () => {
    setShowReceiptModal(true);
    handleShowToast(`Xuất hóa đơn ${params?.tableName || 'bàn'} thành công!`);
  };

  const handleConfirmPayment = async () => {
    if (!params?.invoiceId || !paymentMethod) return;
    try {
      setConfirmingPayment(true);
      const paymentBody = { ...buildPaymentBody(), phuongThuc: paymentMethod };
      const res = await invoiceApi.confirmPayment(params.invoiceId, paymentBody);
      setPreviewInvoice(res);
      setPaymentDone(true);
      setCurrentStatus('DA_THANH_TOAN');
    } catch (err) {
      console.error('Confirm payment failed:', err);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!params?.invoiceId) return;
    try {
      setCompletingOrder(true);
      await invoiceApi.completeOrder(params.invoiceId);
      setCurrentStatus('HOAN_TAT');
      setIsPaymentModalVisible(false);
      onNavigate('Home');
    } catch (err) {
      console.error('Complete order failed:', err);
    } finally {
      setCompletingOrder(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!params?.invoiceId) return;
    try {
      setUpdatingStatus(true);
      await invoiceApi.updateStatus(params.invoiceId, newStatus);
      setCurrentStatus(newStatus);
      setIsStatusModalVisible(false);
    } catch (err) {
      console.error('Failed to update status:', err);
      if (err.response && err.response.data && err.response.data.message) {
        handleShowToast(err.response.data.message, 'warning');
      } else {
        handleShowToast('Có lỗi xảy ra khi cập nhật trạng thái', 'warning');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      setShowCancelModal(false);
      setUpdatingStatus(true);
      await invoiceApi.cancelOrder(params.invoiceId);
      setCurrentStatus('DA_HUY');
      handleShowToast('Đã hủy đơn hàng thành công', 'success');
      setTimeout(() => onNavigate('Home'), 1500);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      if (err.response && err.response.data && err.response.data.message) {
        handleShowToast(err.response.data.message, 'warning');
      } else {
        handleShowToast('Có lỗi xảy ra khi hủy đơn hàng', 'warning');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Calculations
  const subtotal = Number(invoice?.tongTienHang || 0);

  // Calculate best voucher
  const getVoucherDiscountAmount = (v) => {
    const giaTriGiam = Number(v.giaTriGiam || 0);
    if (v.loaiKhuyenMai === 'GIAM_TIEN_MAT') {
      return giaTriGiam;
    } else if (v.loaiKhuyenMai === 'GIAM_PHAN_TRAM') {
      return (subtotal * giaTriGiam) / 100;
    }
    return 0;
  };

  const bestVoucherId = vouchers.reduce((bestId, v) => {
    const minOrder = Number(v.donToiThieu || v.giaTriDonHangToiThieu || 0);
    if (subtotal < minOrder) return bestId;
    
    const currentDiscount = getVoucherDiscountAmount(v);
    if (!bestId) return currentDiscount > 0 ? v.idKhuyenMai : null;
    
    const bestVoucher = vouchers.find(x => x.idKhuyenMai === bestId);
    const bestDiscount = getVoucherDiscountAmount(bestVoucher);
    
    return currentDiscount > bestDiscount ? v.idKhuyenMai : bestId;
  }, null);

  // Voucher discount from applied voucher (manual code) or selected list
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.loaiKhuyenMai === 'GIAM_TIEN_MAT') {
      voucherDiscount = appliedVoucher.giaTriGiam;
    } else if (appliedVoucher.loaiKhuyenMai === 'GIAM_PHAN_TRAM') {
      voucherDiscount = (subtotal * appliedVoucher.giaTriGiam) / 100;
    }
  } else {
    selectedVouchers.forEach(vId => {
      const v = vouchers.find(x => x.idKhuyenMai === vId);
      if (v) {
        if (v.loaiKhuyenMai === 'GIAM_TIEN_MAT') voucherDiscount += v.giaTriGiam;
        else if (v.loaiKhuyenMai === 'GIAM_PHAN_TRAM') voucherDiscount += (subtotal * v.giaTriGiam) / 100;
      }
    });
  }

  const pointsDiscount = (parseInt(pointsToUse) || 0) * 1000;

  // Member discount
  let memberDiscount = 0;
  if (foundMember) {
    if (foundMember.hangThanhVien === 'VANG') {
      memberDiscount = subtotal * 0.10;
    } else if (foundMember.hangThanhVien === 'BAC') {
      memberDiscount = subtotal * 0.05;
    }
  }

  // Tax calculated from real API fees
  let taxAmount = 0;
  selectedFees.forEach(fId => {
    const f = fees.find(x => x.idThuePhi === fId);
    if (f) {
      if (f.loaiGiaTri === 'PHAN_TRAM') {
        taxAmount += (subtotal - voucherDiscount - memberDiscount) * f.giaTri / 100;
      } else if (f.loaiGiaTri === 'TIEN_MAT') {
        taxAmount += f.giaTri;
      } else {
        // Fallback for old data or assumption
        taxAmount += (subtotal - voucherDiscount - memberDiscount) * f.giaTri / 100;
      }
    }
  });
  // Fallback: use invoice's tongTienThue if no fees selected
  if (selectedFees.length === 0 && invoice) {
    taxAmount = invoice.tongTienThue;
  }

  const total = Math.max(0, subtotal - voucherDiscount - pointsDiscount - memberDiscount + taxAmount);

  const toggleFee = (id) => {
    const fee = fees.find(f => f.idThuePhi === id);
    if (fee?.laMacDinh) return; // locked - cannot remove default fees
    if (selectedFees.includes(id)) setSelectedFees(selectedFees.filter(f => f !== id));
    else setSelectedFees([...selectedFees, id]);
  };

  const toggleVoucher = (id) => {
    if (selectedVouchers.includes(id)) {
      setSelectedVouchers([]);
    } else if (selectedVouchers.length === 0) {
      setSelectedVouchers([id]); // Chỉ cho chọn 1 mã khi chưa chọn mã nào
    }
  };



  const isTakeaway = invoice?.loaiDonHang === 'MANG_VE';
  const steps = [
    { label: 'Xác nhận', icon: '🕒' },
    { label: 'Pha chế', icon: '☕' },
    { label: isTakeaway ? 'Lấy món' : 'Phục vụ', icon: isTakeaway ? '🛍️' : '🍽️' },
    { label: 'Chờ T.Toán', icon: '💳' },
    { label: 'Đã T.Toán', icon: '💰' },
    { label: 'Hoàn tất', icon: '✅' },
  ];

  let currentStep = 1;
  switch (currentStatus) {
    case 'CHO_XAC_NHAN': currentStep = 1; break;
    case 'DANG_PHA_CHE': currentStep = 2; break;
    case 'CHO_LAY_MON':
    case 'DANG_PHUC_VU': currentStep = 3; break;
    case 'CHO_THANH_TOAN': currentStep = 4; break;
    case 'DA_THANH_TOAN': currentStep = 5; break;
    case 'HOAN_TAT': currentStep = 6; break;
    case 'DA_HUY': currentStep = 0; break;
    default: currentStep = 1;
  }

  const statusOptions = [
    { id: 'CHO_XAC_NHAN', label: 'Chờ xác nhận', icon: '🕒', bg: '#F3F4F6', color: '#4A5565' },
    { id: 'DANG_PHA_CHE', label: 'Đang pha chế', icon: '☕', bg: 'rgba(139, 163, 103, 0.1)', color: '#8BA367' },
    { id: 'CHO_LAY_MON', label: 'Chờ lấy món', icon: '🔔', bg: '#FFEDD4', color: '#F54900' },
    { id: 'DANG_PHUC_VU', label: 'Đang phục vụ', icon: '🍽️', bg: '#E0F2FE', color: '#0284C7' },
    { id: 'CHO_THANH_TOAN', label: 'Chờ thanh toán', icon: '💳', bg: '#FEF3C6', color: '#E17100' },
    { id: 'DA_THANH_TOAN', label: 'Đã thanh toán', icon: '💰', bg: 'rgba(139, 163, 103, 0.2)', color: '#8BA367' },
    { id: 'HOAN_TAT', label: 'Hoàn tất', icon: '✅', bg: 'rgba(139, 163, 103, 0.2)', color: '#8BA367' },
    { id: 'DA_HUY', label: 'Đã hủy', icon: '❌', bg: '#FFE2E2', color: '#E7000B' },
  ];

  const displayStatusOptions = statusOptions.filter(o => !(invoice?.loaiDonHang === 'MANG_VE' && o.id === 'DANG_PHUC_VU'));

  const formatPrice = (p) => {
    if (p === null || p === undefined || isNaN(p)) return '0đ';
    return Number(p).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.gradientBg}>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8BA367" />
            <Text style={{ marginTop: 16, color: '#4A5565' }}>Đang tải hóa đơn...</Text>
          </View>
        ) : (
          <View style={[styles.splitContainer, { paddingTop: StatusBar.currentHeight || 24 }]}>

            {/* ======================= PANE TRÁI (60%) ======================= */}
            <View style={styles.leftPane}>
              {/* HEADER TRÁI (TITLE & BACK & EDIT) */}
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backBtn}>
                  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <Path d="M15 18L9 12L15 6" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.headerSubtitle}>
                      {params?.orderId ? params.orderId : params?.tableName ? params.tableName : `#${params?.invoiceId || '001'}`}
                    </Text>
                    {realtimeRefreshing && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                        <ActivityIndicator size="small" color="#8BA367" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 11, color: '#8BA367', fontWeight: '600' }}>Đang cập nhật...</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity style={styles.editBtnLayered} onPress={() => setIsStatusModalVisible(true)}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* MODERN POS STEPPER ROW */}
              <View style={styles.stepperFullRow}>
                <LinearGradient
                  colors={['#FFFFFF', '#F1F5F9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.stepperPill}
                >
                  {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = currentStep > stepNum;
                    const isActive = currentStep === stepNum;
                    const isPending = currentStep < stepNum;

                    return (
                      <React.Fragment key={index}>
                        <View style={styles.stepNode}>
                          <View style={[
                            styles.stepCircle,
                            isCompleted && styles.stepCircleCompleted,
                            isActive && styles.stepCircleActive,
                            isPending && styles.stepCirclePending,
                          ]}>
                            {isCompleted ? (
                              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                              </Svg>
                            ) : (
                              <Text style={{ fontSize: 16 }}>{step.icon}</Text>
                            )}
                            {isActive && <View style={styles.activeGlow} />}
                          </View>
                          <Text style={[
                            styles.stepLabel,
                            isCompleted && styles.stepLabelCompleted,
                            isActive && styles.stepLabelActive,
                            isPending && styles.stepLabelPending
                          ]}>
                            {step.label}
                          </Text>
                        </View>

                        {index < steps.length - 1 && (
                          <View style={styles.stepLine}>
                            <LinearGradient
                              colors={isCompleted ? ['#8BA367', '#8BA367'] : ['#E2E8F0', '#E2E8F0']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={{ flex: 1, height: 2 }}
                            />
                          </View>
                        )}
                      </React.Fragment>
                    );
                  })}
                </LinearGradient>
              </View>

              {/* INFO CARD */}
              {reservation && (
                <View style={styles.infoCardWrapper}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F1F5F9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCard}
                  >
                    <View style={styles.infoCardHeader}>
                      <View style={styles.tableTitleWrap}>
                        <Text style={styles.tableTitle}>{params?.tableName || 'Bàn Khách'}</Text>
                        <View style={styles.tableStatusBadge}>
                          <Text style={styles.tableStatusText}>{reservation.trangThaiDat === 'DA_DEN' ? 'Đang phục vụ' : 'Đã đặt'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.customerNameRow}>
                      <Text style={styles.customerNameText}>{reservation.tenKhachHang}</Text>
                      <Text style={styles.customerPhoneText}>- {reservation.sdtKhachHang}</Text>
                    </View>
                    {invoice?.tenPhucVu && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 14, color: '#64748B' }}>🤵 Phục vụ: <Text style={{ fontWeight: '600', color: '#0F172A' }}>{invoice.tenPhucVu}</Text></Text>
                      </View>
                    )}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>👤 Số lượng: <Text style={{ fontWeight: '700' }}>{reservation.soLuongNguoi}</Text></Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>🕒 Check-in: <Text style={styles.timeHighlight}>{new Date(reservation.thoiGianDat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text></Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* PRODUCT LIST */}
              <View style={styles.productListWrapper}>
                <LinearGradient
                  colors={['#FFFFFF', '#F1F5F9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.productListGradient}
                >
                  <View style={styles.productListHeader}>
                    <Text style={styles.productListTitle}>Danh sách món đã gọi</Text>
                    <View style={styles.itemCountBadge}>
                      <Text style={styles.itemCountText}>{invoice?.danhSachChiTiet?.length || 0} món</Text>
                    </View>
                  </View>

                  <ScrollView style={styles.leftProductScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.productGrid}>
                      {(invoice?.danhSachChiTiet || []).map((item, index) => {
                        let details = item.tenKichCo || '';
                        try {
                          if (item.tuyChonJson) {
                            const opts = JSON.parse(item.tuyChonJson);
                            if (opts.da) details += ` • Đá: ${opts.da}`;
                            if (opts.duong) details += ` • Đường: ${opts.duong}`;
                          }
                        } catch (e) { }

                        const toppingNames = (item.danhSachTopping || []).map(t => t.tenTopping).join(', ');

                        return (
                          <View key={item.idChiTiet.toString()} style={styles.productCard}>
                            <View style={styles.productThumb}>
                              <Text style={{ fontSize: 32 }}>🍵</Text>
                              <View style={styles.productQtyBadge}><Text style={styles.productQtyText}>x{item.soLuong}</Text></View>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.productName} numberOfLines={2}>{item.tenSanPham}</Text>
                              <Text style={styles.productMeta} numberOfLines={2}>{details}</Text>
                              {toppingNames.length > 0 && (
                                <Text style={[styles.productMeta, { color: '#64748B' }]} numberOfLines={1}>+ Topping: {toppingNames}</Text>
                              )}
                              <Text style={styles.productPrice}>{formatPrice(item.thanhTien)}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </LinearGradient>
              </View>
            </View>

            {/* ======================= PANE PHẢI (40%) ======================= */}
            <View style={styles.rightPane}>
              <View style={styles.rightCard}>
                <Text style={styles.receiptSectionTitle}>Chức năng mở rộng</Text>
                <View style={styles.actionBtnGridVertical}>
                  <TouchableOpacity style={[styles.actionBtnLayered, foundMember && styles.actionBtnActive]} onPress={() => setShowMemberModal(true)}>
                    <View style={styles.actionBtnIconWrap}><Text style={{ fontSize: 22 }}>👤</Text></View>
                    <View style={styles.actionBtnInfo}>
                      <Text style={styles.actionBtnTitle}>Khách hàng & Tích điểm</Text>
                      <Text style={styles.actionBtnSub}>{foundMember ? `${foundMember.hoTen}` : 'Nhấn để định danh'}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtnLayered, (appliedVoucher || selectedVouchers.length > 0) && styles.actionBtnActive]} onPress={() => setShowVoucherModal(true)}>
                    <View style={styles.actionBtnIconWrap}><Text style={{ fontSize: 22 }}>🎟️</Text></View>
                    <View style={styles.actionBtnInfo}>
                      <Text style={styles.actionBtnTitle}>Mã Khuyến Mãi</Text>
                      <Text style={styles.actionBtnSub}>{(appliedVoucher || selectedVouchers.length > 0) ? `Đã áp dụng -${formatPrice(voucherDiscount)}` : 'Nhấn để áp dụng'}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtnLayered, selectedFees.length > 0 && styles.actionBtnActive]} onPress={() => setShowTaxModal(true)}>
                    <View style={styles.actionBtnIconWrap}><Text style={{ fontSize: 22 }}>📋</Text></View>
                    <View style={styles.actionBtnInfo}>
                      <Text style={styles.actionBtnTitle}>Thuế & Phụ Phí</Text>
                      <Text style={styles.actionBtnSub}>{selectedFees.length > 0 ? `Đang áp dụng ${selectedFees.length}` : 'Nhấn để áp dụng'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rightCard}>
                <Text style={styles.receiptSectionTitle}>Chi tiết thanh toán</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 140 }}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                  </View>
                  
                  {voucherDiscount > 0 && (() => {
                    const v = vouchers.find(x => selectedVouchers.includes(x.idKhuyenMai));
                    const percentageStr = (v && v.loaiKhuyenMai === 'GIAM_PHAN_TRAM') ? ` (${v.giaTriGiam}%)` : '';
                    return (
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Khuyến mãi{percentageStr}</Text>
                        <Text style={[styles.summaryValue, { color: '#059669' }]}>-{formatPrice(voucherDiscount)}</Text>
                      </View>
                    );
                  })()}

                  {memberDiscount > 0 && (() => {
                    const percentageStr = foundMember?.hangThanhVien === 'VANG' ? ' (10%)' : foundMember?.hangThanhVien === 'BAC' ? ' (5%)' : '';
                    return (
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Giảm giá thành viên{percentageStr}</Text>
                        <Text style={[styles.summaryValue, { color: '#059669' }]}>-{formatPrice(memberDiscount)}</Text>
                      </View>
                    );
                  })()}

                  {selectedFees.map(fId => {
                    const f = fees.find(x => x.idThuePhi === fId);
                    if (!f) return null;
                    
                    let amount = 0;
                    const percentageStr = f.loaiGiaTri === 'PHAN_TRAM' ? ` (${f.giaTri}%)` : '';
                    
                    if (f.loaiGiaTri === 'PHAN_TRAM') {
                      amount = (subtotal - voucherDiscount - memberDiscount) * f.giaTri / 100;
                    } else if (f.loaiGiaTri === 'TIEN_MAT') {
                      amount = f.giaTri;
                    } else {
                      amount = (subtotal - voucherDiscount - memberDiscount) * f.giaTri / 100;
                    }

                    return (
                      <View key={fId} style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>{f.tenThuePhi}{percentageStr}</Text>
                        <Text style={styles.summaryValue}>+{formatPrice(Math.round(amount))}</Text>
                      </View>
                    );
                  })}

                  {pointsDiscount > 0 && (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Cấn trừ điểm</Text>
                      <Text style={[styles.summaryValue, { color: '#059669' }]}>-{formatPrice(pointsDiscount)}</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.grandTotalItem}>
                  <Text style={styles.grandTotalLabel}>TỔNG CỘNG</Text>
                  <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
                </View>

                <View style={styles.actionBtnRow}>
                  {currentStatus !== 'HOAN_TAT' && currentStatus !== 'DA_HUY' && (
                    <TouchableOpacity
                      style={[styles.actionBtnBase, { flex: 1 }]}
                      onPress={handleCancelOrder}
                      disabled={updatingStatus}
                    >
                      <LinearGradient
                        colors={['#FCA5A5', '#E11D48']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.actionBtnInner}
                      >
                        <Text style={styles.actionBtnText}>HỦY ĐƠN</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionBtnBase, { flex: 1 }, (currentStatus === 'HOAN_TAT' || currentStatus === 'DA_HUY') && { opacity: 0.5 }]}
                    onPress={handleOpenPayment}
                    disabled={currentStatus === 'HOAN_TAT' || currentStatus === 'DA_HUY'}
                  >
                    <LinearGradient
                      colors={['#A2CB6B', '#4D7521']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.actionBtnInner}
                    >
                      <Text style={styles.actionBtnText}>XÁC NHẬN THANH TOÁN</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      <NewMemberModal
        visible={showModalDangKy}
        onClose={() => setShowModalDangKy(false)}
        onCreateCustomer={handleCreateCustomer}
        initialPhone={searchPhone}
      />

      {/* 💳 ADVANCED PAYMENT DASHBOARD MODAL */}
      <Modal visible={isPaymentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            {/* ── LEFT PANE: Bill Proforma ── */}
            <View style={styles.paymentLeftPane}>
              <Text style={styles.billSectionTitle}>Chi tiết hóa đơn</Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {/* Member Info in Bill - MOVED UP */}
                {foundMember ? (
                  <View style={{ marginBottom: 16, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 }}>
                    <Text style={[styles.billItemName, { fontWeight: '800', marginBottom: 4, color: '#1B3B14' }]}>👤 KHÁCH HÀNG THÀNH VIÊN</Text>
                    <Text style={[styles.billItemName, { fontSize: 16 }]}>{foundMember.hoTen}</Text>
                    <Text style={styles.billItemQty}>{foundMember.soDienThoai}</Text>
                  </View>
                ) : (
                  <View style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 }}>
                    <Text style={[styles.billItemName, { color: '#94A3B8' }]}>👤 Khách vãng lai</Text>
                  </View>
                )}

                {invoice?.tenPhucVu && (
                  <View style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 }}>
                    <Text style={{ fontSize: 13, color: '#64748B' }}>Phục vụ: <Text style={{ fontWeight: '600', color: '#0F172A' }}>{invoice.tenPhucVu}</Text></Text>
                  </View>
                )}

                {/* Items List */}
                <View style={{ marginBottom: 16 }}>
                  {(previewInvoice?.danhSachChiTiet || invoice?.danhSachChiTiet || []).map((item, idx) => {
                    let details = item.tenKichCo || '';
                    try {
                      if (item.tuyChonJson) {
                        const opts = JSON.parse(item.tuyChonJson);
                        if (opts.da) details += ` • Đá: ${opts.da}`;
                        if (opts.duong) details += ` • Đường: ${opts.duong}`;
                      }
                    } catch (e) { }

                    const toppingNames = (item.danhSachTopping || []).map(t => t.tenTopping).join(', ');

                    return (
                      <View key={idx} style={{ marginBottom: 8 }}>
                        <View style={styles.billItemRow}>
                          <Text style={styles.billItemName} numberOfLines={1}>{item.tenSanPham}</Text>
                          <Text style={styles.billItemQty}>x{item.soLuong}</Text>
                          <Text style={styles.billItemPrice}>{formatPrice(item.thanhTien)}</Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 4 }}>{details}</Text>
                        {toppingNames.length > 0 && (
                          <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 4 }}>+ Topping: {toppingNames}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                <View style={styles.iptDashDivider} />

                {/* Pricing Breakdown */}
                <View style={{ gap: 6 }}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tiền hàng</Text>
                    <Text style={styles.summaryValue}>{formatPrice(previewInvoice?.tongTienHang || subtotal)}</Text>
                  </View>

                  {pointsDiscount > 0 && (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Cấn trừ điểm ({pointsToUse}đ)</Text>
                      <Text style={[styles.summaryValue, { color: '#8BA367' }]}>-{formatPrice(pointsDiscount)}</Text>
                    </View>
                  )}

                  {(previewInvoice?.giamGiaKhuyenMai > 0 || voucherDiscount > 0) && (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Khuyến mãi {previewInvoice?.maKhuyenMai ? `(${previewInvoice.maKhuyenMai})` : ''}</Text>
                      <Text style={[styles.summaryValue, { color: '#8BA367' }]}>-{formatPrice(previewInvoice?.giamGiaKhuyenMai || voucherDiscount)}</Text>
                    </View>
                  )}

                  {memberDiscount > 0 && (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Giảm giá thành viên</Text>
                      <Text style={[styles.summaryValue, { color: '#8BA367' }]}>-{formatPrice(memberDiscount)}</Text>
                    </View>
                  )}

                  {previewInvoice?.danhSachThuePhi?.map((t, i) => (
                    <View key={i} style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>{t.tenThuePhi}{t.loaiGiaTri === 'PHAN_TRAM' ? ` (${t.giaTriTaiThoiDiemBan}%)` : ''}</Text>
                      <Text style={styles.summaryValue}>+{formatPrice(t.soTienQuyDoi)}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={[styles.grandTotalItem, { marginTop: 12, borderTopWidth: 2, borderTopColor: '#E2E8F0' }]}>
                <Text style={styles.grandTotalLabel}>TỔNG CỘNG</Text>
                <Text style={[styles.grandTotalValue, { fontSize: 24 }]}>{formatPrice(previewInvoice?.tongThanhToan || total)}</Text>
              </View>
            </View>

            {/* ── RIGHT PANE: Payment Controls ── */}
            <View style={styles.paymentRightPane}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Thanh toán</Text>
                  <Text style={styles.modalSubtitle}>Chọn phương thức & xác nhận</Text>
                </View>
                <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)} style={styles.closeBtn}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6L18 18" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>

              {!paymentDone ? (
                <>
                  <View style={styles.paymentMethodGrid}>
                    <TouchableOpacity
                      style={[styles.methodTab, paymentMethod === 'TIEN_MAT' && styles.methodTabActive]}
                      onPress={() => setPaymentMethod('TIEN_MAT')}
                    >
                      <Text style={{ fontSize: 24 }}>💵</Text>
                      <Text style={[styles.methodTabText, paymentMethod === 'TIEN_MAT' && styles.methodTabTextActive]}>Tiền mặt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.methodTab, paymentMethod === 'CHUYEN_KHOAN' && styles.methodTabActive]}
                      onPress={() => setPaymentMethod('CHUYEN_KHOAN')}
                    >
                      <Text style={{ fontSize: 24 }}>📱</Text>
                      <Text style={[styles.methodTabText, paymentMethod === 'CHUYEN_KHOAN' && styles.methodTabTextActive]}>Chuyển khoản</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    {paymentMethod === 'CHUYEN_KHOAN' ? (
                      <View style={styles.qrContainer}>
                        <Text style={styles.qrLabel}>QUÉT MÃ ĐỂ CHUYỂN KHOẢN</Text>

                        <View style={styles.dashboardQRImg}>
                          <Image
                            source={require('../../assets/images/qr_pay.png')}
                            style={{ width: 124, height: 124 }}
                            resizeMode="contain"
                          />
                        </View>

                        <View style={{ marginTop: 4, alignItems: 'center' }}>
                          <Text style={styles.qrInfoText}>STK: 0123456789 - MB Bank</Text>
                          <Text style={styles.qrSubInfoText}>CTK: MATCHTEA COFFEE</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.cashContainer}>
                        <View style={styles.cashIconCircle}>
                          <Text style={{ fontSize: 32 }}>💰</Text>
                        </View>
                        <Text style={[styles.modalTitle, { fontSize: 18 }]}>Xác nhận nhận tiền mặt</Text>
                        <Text style={[styles.modalSubtitle, { textAlign: 'center' }]}>Vui lòng kiểm tra kỹ số tiền từ khách hàng trước khi bấm xác nhận.</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.paymentActionRow}>
                    <TouchableOpacity style={styles.exportBillBtn} onPress={handlePrintInvoice}>
                      <Text style={styles.exportBillText}>In hóa đơn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmPayBtn}
                      onPress={handleConfirmPayment}
                      disabled={confirmingPayment || !paymentMethod}
                    >
                      <LinearGradient
                        colors={['#4A7C3F', '#1B3B14']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.confirmPayBtnInner}
                      >
                        {confirmingPayment
                          ? <ActivityIndicator color="white" />
                          : <Text style={styles.confirmPayText}>Xác nhận</Text>
                        }
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 40 }}>✅</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.modalTitle, { color: '#166534' }]}>Thanh toán hoàn tất!</Text>
                    <Text style={styles.modalSubtitle}>Đơn hàng đã được chuyển sang trạng thái Đã thanh toán.</Text>
                  </View>

                  {isTakeaway ? (
                    <TouchableOpacity
                      style={[styles.payBtn, { width: '100%', height: 60, backgroundColor: '#1B3B14' }]}
                      onPress={() => {
                        setIsPaymentModalVisible(false);
                        onNavigate('Home');
                      }}
                    >
                      <Text style={styles.payBtnText}>Hoàn tất</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.payBtn, { width: '100%', height: 60, backgroundColor: '#1B3B14' }]}
                      onPress={handleCompleteOrder}
                      disabled={completingOrder}
                    >
                      {completingOrder
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.payBtnText}>Hoàn tất & Giải phóng bàn</Text>
                      }
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal visible={isStatusModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setIsStatusModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Cập nhật trạng thái đơn hàng</Text>
                    <Text style={styles.modalSubtitle}>Chọn trạng thái mới cho đơn hàng</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsStatusModalVisible(false)} style={styles.closeBtn}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Path d="M18 6L6 18M6 6L18 18" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.statusList} showsVerticalScrollIndicator={false}>
                  {displayStatusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.statusItem, currentStatus === option.id && styles.statusItemActive]}
                      onPress={() => !updatingStatus && handleUpdateStatus(option.id)}
                    >
                      <View style={[styles.statusIconContainer, { backgroundColor: option.bg }]}>
                        <Text style={{ fontSize: 20 }}>{option.icon}</Text>
                      </View>
                      <View style={styles.statusLabelContainer}>
                        <Text style={styles.statusLabelMain}>{option.label}</Text>
                        {currentStatus === option.id && <Text style={styles.statusLabelSub}>Trạng thái hiện tại</Text>}
                      </View>
                      {currentStatus === option.id && (
                        <View style={styles.checkIcon}>
                          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <Path d="M20 6L9 17L4 12" stroke="#8BA367" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={() => setIsStatusModalVisible(false)}
                    style={styles.modalCloseBtn}
                    disabled={updatingStatus}
                  >
                    {updatingStatus
                      ? <ActivityIndicator color="#8BA367" />
                      : <Text style={styles.modalCloseBtnText}>Đóng</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <MemberModal
        visible={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        initialMember={foundMember}
        initialPoints={pointsToUse}
        onApplyMember={(member, points) => {
          setFoundMember(member);
          setPointsToUse(points ? String(points) : '');
        }}
        onRegisterNew={(phone) => {
          setSearchPhone(phone);
          setShowModalDangKy(true);
        }}
      />

      {/* Voucher Modal */}
      <Modal visible={showVoucherModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Mã Khuyến Mãi</Text>
                <Text style={styles.modalSubtitle}>Sử dụng mã giảm giá để tối ưu hóa đơn</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)} style={styles.closeBtn}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6L18 18" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchPill}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nhập mã ưu đãi..."
                  autoCapitalize="characters"
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                  onSubmitEditing={handleCheckVoucherCode}
                />
              </View>
              <TouchableOpacity style={styles.searchSquareBtn} onPress={handleCheckVoucherCode} disabled={checkingVoucher}>
                {checkingVoucher
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Circle cx="11" cy="11" r="8" stroke="#FFF" strokeWidth="2" />
                    <Path d="M21 21L16.65 16.65" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                }
              </TouchableOpacity>
            </View>

            {vouchers.length > 0 ? (
              <ScrollView style={[styles.voucherScroll, { maxHeight: 450 }]} showsVerticalScrollIndicator={false}>
                {vouchers.map(v => {
                  const isSelected = selectedVouchers.includes(v.idKhuyenMai);
                  const isAnotherSelected = selectedVouchers.length > 0 && !isSelected;
                  const minOrder = Number(v.donToiThieu || v.giaTriDonHangToiThieu || 0);
                  const isEligible = subtotal >= minOrder;
                  const expiryDate = v.ngayHetHan ? new Date(v.ngayHetHan).toLocaleDateString('vi-VN') : 'Vô thời hạn';

                  // Calculate display discount
                  let discountLabel = '';
                  const giaTriGiam = Number(v.giaTriGiam || 0);
                  if (v.loaiKhuyenMai === 'GIAM_TIEN_MAT') {
                    discountLabel = `Giảm ${formatPrice(giaTriGiam)}`;
                  } else if (v.loaiKhuyenMai === 'GIAM_PHAN_TRAM') {
                    discountLabel = `Giảm ${giaTriGiam}%`;
                  } else {
                    discountLabel = `Ưu đãi ${v.maCode}`;
                  }

                  return (
                    <TouchableOpacity
                      key={v.idKhuyenMai}
                      style={[
                        styles.voucherCard,
                        isSelected && styles.voucherCardSelected,
                        (!isEligible || isAnotherSelected) && styles.voucherCardDisabled
                      ]}
                      onPress={() => isEligible && !isAnotherSelected && toggleVoucher(v.idKhuyenMai)}
                      disabled={!isEligible || isAnotherSelected}
                    >
                      {/* Ticket Cutouts */}
                      <View style={styles.leftCutoutMask}>
                        <View style={[styles.leftCutoutCircle, isSelected && { borderColor: '#3B82F6' }]} />
                      </View>
                      <View style={styles.rightCutoutMask}>
                        <View style={[styles.rightCutoutCircle, isSelected && { borderColor: '#3B82F6' }]} />
                      </View>

                      {/* Header Part */}
                      <View style={styles.couponHeader}>
                        <Text style={[styles.couponHeaderText, !isEligible && { color: '#94A3B8' }]}>Voucher</Text>
                        <Text style={styles.couponHeaderDate}>HSD: {expiryDate}</Text>
                      </View>

                      {/* Dashed Line */}
                      <View style={styles.couponDashedLine} />

                      <View style={styles.voucherInfo}>
                        {/* Icon based on type */}
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isEligible ? '#EFF6FF' : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 20 }}>{v.loaiKhuyenMai === 'GIAM_PHAN_TRAM' ? '🎁' : '🎫'}</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.voucherTitle}>{v.maCode}</Text>
                                {v.idKhuyenMai === bestVoucherId && (
                                  <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>Giảm nhiều nhất</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={[styles.voucherSub, { color: isEligible ? '#3B82F6' : '#64748B', fontWeight: '700' }]}>{discountLabel}</Text>
                            </View>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                              {isSelected && <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>}
                            </View>
                          </View>

                          <Text style={[styles.voucherSub, { fontSize: 12, marginTop: 4 }]} numberOfLines={1}>
                            Áp dụng cho đơn từ {formatPrice(minOrder)}
                          </Text>

                          {!isEligible && (
                            <Text style={styles.voucherError}>
                              ⚠ Chưa đủ điều kiện (Thiếu {formatPrice(minOrder - subtotal)})
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 15 }}>Chưa có mã khuyến mãi khả dụng</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.payBtn, { marginTop: 20, backgroundColor: '#1E293B' }]} onPress={() => setShowVoucherModal(false)}>
              <Text style={styles.payBtnText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tax Modal */}
      <Modal visible={showTaxModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thuế & Phụ phí</Text>
              <TouchableOpacity onPress={() => setShowTaxModal(false)} style={styles.closeBtn}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6L18 18" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {fees.map(f => {
                const isActive = selectedFees.includes(f.idThuePhi);
                return (
                  <TouchableOpacity key={f.idThuePhi} style={[styles.statusItem, isActive && styles.statusItemActive]} onPress={() => toggleFee(f.idThuePhi)}>
                    <View style={[styles.checkbox, isActive && styles.checkboxSelected]}>
                      {isActive && <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>}
                    </View>
                    <View style={styles.statusLabelContainer}>
                      <Text style={styles.statusLabelMain}>{f.tenThuePhi}</Text>
                      <Text style={styles.statusLabelSub}>
                        {f.loaiGiaTri === 'PHAN_TRAM' 
                          ? `Áp dụng ${f.giaTri}% trên tổng bill` 
                          : `Phụ thu ${formatPrice(f.giaTri)}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={[styles.payBtn, { marginTop: 20 }]} onPress={() => setShowTaxModal(false)}>
              <Text style={styles.payBtnText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 📄 PHYSICAL RECEIPT MODAL */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptPaper}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 600 }}>
              <View ref={receiptRef} collapsable={false} style={{ backgroundColor: '#FFF', padding: 10 }}>
                <Text style={styles.receiptBrand}>MATCHTEA COFFEE</Text>
                <Text style={styles.receiptSubBrand}>Đ/C: 888 Đường Lê Trọng Tấn, Q. Tân Phú, TP.HCM</Text>

                <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Bàn:</Text>
                <Text style={styles.receiptValue}>{params?.tableName || 'Mang về'}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Ngày:</Text>
                <Text style={styles.receiptValue}>
                  {(() => {
                    // Ưu tiên ngày giờ hiện tại nếu đơn chưa thanh toán xong
                    const isSettled = currentStatus === 'DA_THANH_TOAN' || currentStatus === 'HOAN_TAT';
                    const date = isSettled
                      ? (invoice?.thoiGianThanhToan || invoice?.thoiGianTao || new Date())
                      : new Date();

                    return new Date(date).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  })()}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Thu ngân:</Text>
                <Text style={styles.receiptValue}>{currentUser?.hoTen || 'Thu ngân'}</Text>
              </View>

              {invoice?.tenPhucVu && (
                <View style={[styles.receiptRow, { marginTop: 4 }]}>
                  <Text style={styles.receiptLabel}>Phục vụ:</Text>
                  <Text style={styles.receiptValue}>{invoice.tenPhucVu}</Text>
                </View>
              )}

              {foundMember && (
                <View style={[styles.receiptRow, { marginTop: 4 }]}>
                  <Text style={styles.receiptLabel}>Khách hàng:</Text>
                  <Text style={styles.receiptValue}>{foundMember.hoTen}</Text>
                </View>
              )}

              <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

              {(previewInvoice?.danhSachChiTiet || invoice?.danhSachChiTiet || []).map((item, idx) => {
                let details = item.tenKichCo || '';
                try {
                  if (item.tuyChonJson) {
                    const opts = JSON.parse(item.tuyChonJson);
                    if (opts.da) details += ` • Đá: ${opts.da}`;
                    if (opts.duong) details += ` • Đường: ${opts.duong}`;
                  }
                } catch (e) { }

                const toppingNames = (item.danhSachTopping || []).map(t => t.tenTopping).join(', ');

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
                  <Text style={styles.receiptItemPrice}>{formatPrice(previewInvoice?.tongTienHang || subtotal)}</Text>
                </View>

                {pointsDiscount > 0 && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptItemName}>Cấn trừ điểm</Text>
                    <Text style={[styles.receiptItemPrice, { color: '#8BA367' }]}>-{formatPrice(pointsDiscount)}</Text>
                  </View>
                )}

                {(previewInvoice?.giamGiaKhuyenMai > 0 || voucherDiscount > 0) && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptItemName}>Khuyến mãi {previewInvoice?.maKhuyenMai ? `(${previewInvoice.maKhuyenMai})` : ''}</Text>
                    <Text style={[styles.receiptItemPrice, { color: '#8BA367' }]}>-{formatPrice(previewInvoice?.giamGiaKhuyenMai || voucherDiscount)}</Text>
                  </View>
                )}

                {previewInvoice?.danhSachThuePhi?.map((t, i) => (
                  <View key={i} style={styles.receiptRow}>
                    <Text style={styles.receiptItemName}>{t.tenThuePhi}{t.loaiGiaTri === 'PHAN_TRAM' ? ` (${t.giaTriTaiThoiDiemBan}%)` : ''}</Text>
                    <Text style={styles.receiptItemPrice}>+{formatPrice(t.soTienQuyDoi)}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.iptDashDivider, { marginVertical: 10 }]} />

              <View style={styles.receiptTotalRow}>
                <Text style={styles.receiptTotalLabel}>TỔNG CỘNG</Text>
                <Text style={styles.receiptTotalValue}>{formatPrice(previewInvoice?.tongThanhToan || total)}</Text>
              </View>

              <View style={styles.receiptQR}>
                <Image
                  source={require('../../assets/images/qr_pay.png')}
                  style={styles.receiptQRImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: 8, color: '#1E293B' }}>
                STK: 0123456789 - MB Bank
              </Text>
              <Text style={{ textAlign: 'center', fontSize: 10, color: '#64748B', marginTop: 2 }}>
                CTK: MATCHTEA COFFEE
              </Text>

              <Text style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 20, fontStyle: 'italic' }}>
                Cảm ơn quý khách. Hẹn gặp lại!
              </Text>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.payBtn, { flex: 1, backgroundColor: '#4A924C' }]}
                onPress={handleDownloadInvoice}
              >
                <Text style={styles.payBtnText}>LƯU & CHIA SẺ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payBtn, { flex: 1, backgroundColor: '#1E293B' }]}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.payBtnText}>ĐÓNG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: 400, alignItems: 'center', paddingVertical: 40 }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <Path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.5322 19 5.07183 19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={[styles.modalTitle, { textAlign: 'center', fontSize: 24, color: '#1E293B', marginBottom: 12 }]}>Xác nhận hủy đơn</Text>
            <Text style={[styles.modalSubtitle, { textAlign: 'center', fontSize: 16, marginBottom: 36, lineHeight: 24, paddingHorizontal: 20 }]}>Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.</Text>
            
            <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, height: 56, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B' }}>Đóng lại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ flex: 1, height: 56, borderRadius: 20, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8 }}
                onPress={confirmCancelOrder}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>Hủy đơn ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔔 TOAST MESSAGE (Wrapped in Modal to be on top of other modals) */}
      <Modal visible={!!toast} transparent animationType="fade">
        <View style={{ flex: 1, pointerEvents: 'none' }}>
          <View style={[
            styles.toastContainer,
            toastType === 'warning' ? styles.toastWarning : {}
          ]}>
            <Text style={{ fontSize: 18 }}>{toastType === 'warning' ? '⚠️' : '✨'}</Text>
            <Text style={[
              styles.toastText,
              toastType === 'warning' ? styles.toastTextWarning : {}
            ]}>{toast}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OrderDetails;
