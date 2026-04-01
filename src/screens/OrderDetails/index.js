import React, { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import invoiceApi from '../../api/invoiceApi';
import promotionApi from '../../api/promotionApi';
import customerApi from '../../api/customerApi';
import styles from './OrderDetails.styles';



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
  
  // Customer / Membership
  const [searchPhone, setSearchPhone] = useState('');
  const [foundMember, setFoundMember] = useState(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ hoTen: '', soDienThoai: '', gioiTinh: 'NAM' });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [pointsToUse, setPointsToUse] = useState('');
  
  // Vouchers & Fees
  const [vouchers, setVouchers] = useState([]);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);

  // Payment
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('TIEN_MAT');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [completingOrder, setCompletingOrder] = useState(false);

  // Remove real-time search via useEffect - replace with manual button search

  useEffect(() => {
    if (params?.invoiceId) {
      fetchInvoiceDetail(params.invoiceId);
    } else {
      setLoading(false);
    }
    fetchFees();
    fetchVouchers();
  }, [params?.invoiceId]);

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

  const handleCreateCustomer = async () => {
    if (!newCustomer.hoTen.trim() || !newCustomer.soDienThoai.trim()) return;
    try {
      setCreatingCustomer(true);
      const res = await customerApi.create(newCustomer);
      setFoundMember(res);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Create customer failed:', err);
    } finally {
      setCreatingCustomer(false);
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
    return { maCode, diemSuDung: parseInt(pointsToUse) || 0, danhSachIdThuePhi: extraFeeIds };
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

  const handleConfirmPayment = async () => {
    if (!params?.invoiceId) return;
    try {
      setConfirmingPayment(true);
      const res = await invoiceApi.confirmPayment(params.invoiceId, paymentMethod, buildPaymentBody());
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
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Calculations
  const subtotal = invoice ? invoice.tongTienHang : 0;
  
  // Voucher discount from applied voucher (manual code) or selected list
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.loaiKhuyenMai === 'GIAM_TIEN_MAT') {
      voucherDiscount = appliedVoucher.giaTriGiam;
    } else if (appliedVoucher.loaiKhuyenMai === 'GIAM_PHAN_TRAM') {
      voucherDiscount = subtotal * appliedVoucher.giaTriGiam;
    }
  } else {
    selectedVouchers.forEach(vId => {
      const v = vouchers.find(x => x.idKhuyenMai === vId);
      if (v) {
        if (v.loaiKhuyenMai === 'GIAM_TIEN_MAT') voucherDiscount += v.giaTriGiam;
        else if (v.loaiKhuyenMai === 'GIAM_PHAN_TRAM') voucherDiscount += subtotal * v.giaTriGiam;
      }
    });
  }

  const pointsDiscount = (parseInt(pointsToUse) || 0) * 1000;
  
  // Tax calculated from real API fees (all are % based)
  let taxAmount = 0;
  selectedFees.forEach(fId => {
    const f = fees.find(x => x.idThuePhi === fId);
    if (f) {
      taxAmount += (subtotal - voucherDiscount - pointsDiscount) * f.giaTri;
    }
  });
  // Fallback: use invoice's tongTienThue if no fees selected
  if (selectedFees.length === 0 && invoice) {
    taxAmount = invoice.tongTienThue;
  }

  const total = Math.max(0, subtotal - voucherDiscount - pointsDiscount + taxAmount);

  const toggleFee = (id) => {
    const fee = fees.find(f => f.idThuePhi === id);
    if (fee?.laMacDinh) return; // locked - cannot remove default fees
    if (selectedFees.includes(id)) setSelectedFees(selectedFees.filter(f => f !== id));
    else setSelectedFees([...selectedFees, id]);
  };

  const toggleVoucher = (id) => {
    if (selectedVouchers.includes(id)) setSelectedVouchers(selectedVouchers.filter(v => v !== id));
    else setSelectedVouchers([...selectedVouchers, id]);
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

  const formatPrice = (p) => p.toLocaleString('vi-VN') + 'đ';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FFF8F0', '#F5F5F5', '#E8F5E0']} style={styles.gradientBg}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => onNavigate('Home')} style={styles.backBtn}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsStatusModalVisible(true)}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#4A5565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#4A5565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ marginTop: 100, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#8BA367" />
              <Text style={{ marginTop: 16, color: '#4A5565' }}>Đang tải hóa đơn...</Text>
            </View>
          ) : (
            <>
              {/* Progress Section */}
              <Text style={styles.sectionLabel}>Tiến độ đơn hàng</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
            <View style={[styles.stepperContainer, { minWidth: width * 1.25, marginBottom: 0 }]}>
              <View style={styles.stepperLine} />
              <View style={[styles.stepperLineActive, { width: currentStep === 0 ? '0%' : `${((Math.max(1, currentStep) - 1) / (steps.length - 1)) * 100}%` }]} />
              {steps.map((step, index) => {
                let isActive = currentStep > 0 && (index + 1) <= currentStep;
                let isError = currentStep === 0; // DA_HUY

                return (
                  <View key={index} style={styles.stepItem}>
                    <View style={[
                      styles.stepCircle, 
                      isActive && styles.stepCircleActive,
                      isError && { borderColor: '#FFE2E2' }
                    ]}>
                      <Text style={{ fontSize: 16 }}>{isError ? '❌' : step.icon}</Text>
                    </View>
                    <Text style={[
                      styles.stepText, 
                      isActive && styles.stepTextActive,
                      isError && { color: '#E7000B' }
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Order Summary Card */}
          <View style={styles.card}>
            <View style={styles.orderHeader}>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderTitleLabel}>Đơn hàng</Text>
                <Text style={styles.orderIdText}>
                   {params?.orderId ? params.orderId : params?.tableName ? params.tableName : `#${params?.invoiceId || '001'}`}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{statusOptions.find(o => o.id === currentStatus)?.label || 'Không gõ'}</Text>
              </View>
            </View>

            {invoice?.danhSachChiTiet?.map((item, index) => {
              // Extract details beautifully
              let details = item.tenKichCo || '';
              try {
                if (item.tuyChonJson) {
                  const opts = JSON.parse(item.tuyChonJson);
                  if (opts.da && opts.da !== 'Mặc định') details += ` • Đá: ${opts.da}`;
                  if (opts.duong && opts.duong !== 'Mặc định') details += ` • Đường: ${opts.duong}`;
                }
              } catch (e) {}

              return (
                <React.Fragment key={item.idChiTiet.toString()}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemEmoji}>🍵</Text>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemNameRow}>
                        <View style={styles.qtyBadge}><Text style={styles.qtyText}>{item.soLuong}x</Text></View>
                        <Text style={styles.itemName}>{item.tenSanPham}</Text>
                      </View>
                      <Text style={styles.itemDetails}>{details}</Text>
                    </View>
                    <View style={styles.itemPriceSection}>
                      <Text style={styles.unitPrice}>{formatPrice(item.giaThoiDiemBan)}</Text>
                      <Text style={styles.totalPrice}>{formatPrice(item.thanhTien)}</Text>
                    </View>
                  </View>
                  {index < (invoice.danhSachChiTiet.length - 1) && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>

          {/* Member Section */}
          <View style={styles.card}>
            <View style={styles.memberHeader}>
               <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx="12" cy="7" r="4" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               </Svg>
               <Text style={styles.memberTitle}>Thành viên</Text>
            </View>
            
            <View style={styles.searchRow}>
               <TextInput 
                style={styles.pointsInput} 
                placeholder="Nhập số điện thoại khách hàng..." 
                value={searchPhone}
                onChangeText={setSearchPhone}
                keyboardType="phone-pad"
               />
               <TouchableOpacity style={styles.searchBtn} onPress={handleSearchCustomer} disabled={searchingCustomer}>
                  {searchingCustomer
                    ? <ActivityIndicator color="white" size="small" />
                    : <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2.5" />
                        <Path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </Svg>
                  }
               </TouchableOpacity>
            </View>

            {/* Found customer card */}
            {foundMember && (
              <View style={styles.memberCard}>
                <View style={styles.memberInfoRow}>
                  <View>
                    <Text style={styles.itemName}>{foundMember.hoTen}</Text>
                    <Text style={styles.itemDetails}>{foundMember.soDienThoai}</Text>
                  </View>
                  <View style={styles.memberRankBadge}>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8BA367" stroke="#8BA367" strokeWidth="2" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.memberRankText}>{foundMember.hangThanhVien}</Text>
                  </View>
                </View>

                <View style={styles.pointsInfo}>
                  <Text style={styles.pointsLabel}>Điểm tích lũy hiện tại</Text>
                  <Text style={styles.pointsValue}>{foundMember.diemTichLuy} Đ</Text>
                </View>

                <View style={styles.pointsInputRow}>
                   <Text style={styles.pointsInputLabel}>Điểm sử dụng:</Text>
                   <TextInput
                    style={styles.pointsInput}
                    placeholder="0"
                    value={pointsToUse}
                    onChangeText={setPointsToUse}
                    keyboardType="numeric"
                   />
                </View>
              </View>
            )}

            {/* Not found → Create new customer form */}
            {showCreateForm && !foundMember && (
              <View style={[styles.memberCard, { borderColor: '#3B82F6', borderWidth: 1.5 }]}>
                <Text style={[styles.memberTitle, { fontSize: 15, marginBottom: 12, color: '#3B82F6' }]}>
                  Khách chưa có tài khoản — Tạo mới
                </Text>
                <TextInput
                  style={[styles.pointsInput, { marginBottom: 10 }]}
                  placeholder="Họ tên *"
                  value={newCustomer.hoTen}
                  onChangeText={v => setNewCustomer(p => ({ ...p, hoTen: v }))}
                />
                <TextInput
                  style={[styles.pointsInput, { marginBottom: 10 }]}
                  placeholder="Số điện thoại *"
                  value={newCustomer.soDienThoai}
                  onChangeText={v => setNewCustomer(p => ({ ...p, soDienThoai: v }))}
                  keyboardType="phone-pad"
                />
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {['NAM', 'NU'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.feeChip, newCustomer.gioiTinh === g && styles.feeChipActive]}
                      onPress={() => setNewCustomer(p => ({ ...p, gioiTinh: g }))}
                    >
                      <Text style={[styles.feeChipText, newCustomer.gioiTinh === g && styles.feeChipTextActive]}>
                        {g === 'NAM' ? '👨 Nam' : '👩 Nữ'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.payBtn, { height: 44, backgroundColor: '#3B82F6' }]}
                  onPress={handleCreateCustomer}
                  disabled={creatingCustomer}
                >
                  {creatingCustomer
                    ? <ActivityIndicator color="white" />
                    : <Text style={styles.payBtnText}>Tạo khách hàng</Text>
                  }
                </TouchableOpacity>
              </View>
            )}

            {/* Voucher Code Input */}
            <Text style={styles.voucherSectionTitle}>Mã khuyến mãi</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.pointsInput, { flex: 1, height: 44 }]}
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleCheckVoucherCode} disabled={checkingVoucher}>
                {checkingVoucher
                  ? <ActivityIndicator color="white" size="small" />
                  : <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                }
              </TouchableOpacity>
            </View>
            {appliedVoucher && (
              <View style={[styles.memberCard, { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <View>
                  <Text style={styles.itemName}>{appliedVoucher.maCode}</Text>
                  <Text style={styles.itemDetails}>
                    {appliedVoucher.loaiKhuyenMai === 'GIAM_TIEN_MAT'
                      ? `Giảm ${Number(appliedVoucher.giaTriGiam).toLocaleString('vi-VN')}đ`
                      : `Giảm ${(appliedVoucher.giaTriGiam * 100).toFixed(0)}%`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => { setAppliedVoucher(null); setVoucherCode(''); }}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M18 6L6 18M6 6L18 18" stroke="#E7000B" strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
            )}

            {/* Active Voucher List */}
            <Text style={[styles.voucherSectionTitle, { marginTop: 16 }]}>Khuyến mãi đang hoạt động</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.voucherScroll}>
              {vouchers.map((v) => {
                const isSelected = selectedVouchers.includes(v.idKhuyenMai);
                const discLabel = v.loaiKhuyenMai === 'GIAM_TIEN_MAT'
                  ? `Giảm ${Number(v.giaTriGiam).toLocaleString('vi-VN')}đ`
                  : `Giảm ${(v.giaTriGiam * 100).toFixed(0)}%`;
                return (
                  <TouchableOpacity
                    key={v.idKhuyenMai}
                    style={[styles.voucherCard, isSelected && styles.voucherCardSelected]}
                    onPress={() => !appliedVoucher && toggleVoucher(v.idKhuyenMai)}
                  >
                    <View style={styles.voucherInfo}>
                      <Text style={styles.voucherTitle}>{v.maCode} — {discLabel}</Text>
                      <Text style={styles.voucherSub}>Đơn tối thiểu: {Number(v.donToiThieu).toLocaleString('vi-VN')}đ</Text>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && (
                        <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <Path d="M20 6L9 17L4 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {vouchers.length === 0 && <Text style={styles.itemDetails}>Không có khuyến mãi nào đang hoạt động</Text>}
            </ScrollView>

            <View style={styles.feeSection}>
              <Text style={styles.pointsInputLabel}>Thuế/Phí áp dụng:</Text>
              <View style={styles.feeRow}>
                {fees.map((f) => {
                  const isActive = selectedFees.includes(f.idThuePhi);
                  const isLocked = f.laMacDinh;
                  return (
                    <TouchableOpacity
                      key={f.idThuePhi}
                      style={[styles.feeChip, isActive && styles.feeChipActive, isLocked && { opacity: 1 }]}
                      onPress={() => toggleFee(f.idThuePhi)}
                    >
                      <Text style={[styles.feeChipText, isActive && styles.feeChipTextActive]}>
                        {isLocked ? '🔒 ' : ''}{f.tenThuePhi} ({(f.giaTri * 100).toFixed(0)}%)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

          </View>

          {/* Total Summary */}
          <View style={styles.card}>
            <View style={styles.summaryRow}>
               <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
               <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            {voucherDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá Voucher</Text>
                <Text style={[styles.summaryValue, { color: '#8BA367' }]}>-{formatPrice(voucherDiscount)}</Text>
              </View>
            )}
            {pointsDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Cấn trừ điểm</Text>
                <Text style={[styles.summaryValue, { color: '#8BA367' }]}>-{formatPrice(pointsDiscount)}</Text>
              </View>
            )}
            {selectedFees.map(fId => {
              const f = fees.find(x => x.idThuePhi === fId);
              if (!f) return null;
              const amount = (subtotal - voucherDiscount - pointsDiscount) * f.giaTri;
              return (
                <View key={fId} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{f.tenThuePhi}</Text>
                  <Text style={styles.summaryValue}>+{formatPrice(Math.round(amount))}</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
               <Text style={styles.totalLabel}>Tổng thanh toán</Text>
               <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
          <View style={{ height: 100 }} />
          </>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, (currentStatus === 'HOAN_TAT' || currentStatus === 'DA_HUY') && { opacity: 0.5 }]}
          onPress={() => onNavigate('Payment', {
            invoiceId: params?.invoiceId,
            paymentBody: buildPaymentBody(),
            displayName: params?.orderId || params?.tableName || `#${params?.invoiceId}`,
          })}
          disabled={currentStatus === 'HOAN_TAT' || currentStatus === 'DA_HUY'}
        >
          <Text style={styles.payBtnText}>💳 Tiếp tục thanh toán</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal visible={isPaymentModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => !confirmingPayment && setIsPaymentModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>💳 Thanh toán hóa đơn</Text>
                    <Text style={styles.modalSubtitle}>Chọn phương thức & xác nhận</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsPaymentModalVisible(false)} style={styles.closeBtn}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Path d="M18 6L6 18M6 6L18 18" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                  {/* Payment Method */}
                  <Text style={styles.pointsInputLabel}>Phương thức thanh toán:</Text>
                  <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      { id: 'TIEN_MAT', label: '💵 Tiền mặt' },
                      { id: 'CHUYEN_KHOAN', label: '📱 Chuyển khoản' },
                      { id: 'THE_NGAN_HANG', label: '💳 Quẹt thẻ' },
                    ].map(m => (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.feeChip, paymentMethod === m.id && styles.feeChipActive]}
                        onPress={() => setPaymentMethod(m.id)}
                        disabled={paymentDone}
                      >
                        <Text style={[styles.feeChipText, paymentMethod === m.id && styles.feeChipTextActive]}>{m.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Preview */}
                  {loadingPreview && <ActivityIndicator color="#8BA367" />}
                  {previewInvoice && (
                    <View style={[styles.card, { marginHorizontal: 0, marginBottom: 0 }]}>
                      <Text style={[styles.memberTitle, { marginBottom: 12 }]}>Tóm tắt hóa đơn</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tiền hàng</Text>
                        <Text style={styles.summaryValue}>{formatPrice(previewInvoice.tongTienHang)}</Text>
                      </View>
                      {previewInvoice.giamGiaKhuyenMai > 0 && (
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Giảm giá ({previewInvoice.maKhuyenMai})</Text>
                          <Text style={[styles.summaryValue, { color: '#8BA367' }]}>-{formatPrice(previewInvoice.giamGiaKhuyenMai)}</Text>
                        </View>
                      )}
                      {previewInvoice.danhSachThuePhi?.map((t, i) => (
                        <View key={i} style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>{t.tenThuePhi}</Text>
                          <Text style={styles.summaryValue}>+{formatPrice(t.soTienQuyDoi)}</Text>
                        </View>
                      ))}
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalValue}>{formatPrice(previewInvoice.tongThanhToan)}</Text>
                      </View>
                    </View>
                  )}

                  {/* Confirm Button */}
                  {!paymentDone ? (
                    <TouchableOpacity
                      style={[styles.payBtn, { marginTop: 8 }]}
                      onPress={handleConfirmPayment}
                      disabled={confirmingPayment || loadingPreview}
                    >
                      {confirmingPayment
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.payBtnText}>Xác nhận thanh toán</Text>
                      }
                    </TouchableOpacity>
                  ) : (
                    <View style={{ gap: 10 }}>
                      <View style={[styles.memberCard, { backgroundColor: 'rgba(139,163,103,0.08)', borderColor: '#8BA367', borderWidth: 1 }]}>
                        <Text style={{ color: '#8BA367', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>✅ Thanh toán thành công!</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.payBtn, { backgroundColor: '#006045' }]}
                        onPress={handleCompleteOrder}
                        disabled={completingOrder}
                      >
                        {completingOrder
                          ? <ActivityIndicator color="white" />
                          : <Text style={styles.payBtnText}>✅ Hoàn tất & Giải phóng bàn</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
    </SafeAreaView>
  );
};

export default OrderDetails;
