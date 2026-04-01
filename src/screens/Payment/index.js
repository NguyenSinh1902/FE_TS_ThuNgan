import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import invoiceApi from '../../api/invoiceApi';
import styles from './Payment.styles';

const Payment = ({ onNavigate, params }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const invoiceId  = params?.invoiceId;
  const paymentBody = params?.paymentBody || { maCode: null, diemSuDung: 0, danhSachIdThuePhi: [] };
  const displayName = params?.displayName || `#${invoiceId}`;

  const paymentMethods = [
    { id: 'TIEN_MAT',      name: 'Tiền mặt',    desc: 'Thanh toán trực tiếp tại quầy', iconText: '💵' },
    { id: 'CHUYEN_KHOAN',  name: 'Chuyển khoản', desc: 'Quét mã QR để thanh toán',      iconText: '📱' },
  ];

  useEffect(() => {
    if (!invoiceId) { setLoadingPreview(false); return; }
    const fetchPreview = async () => {
      try {
        setLoadingPreview(true);
        const res = await invoiceApi.previewPayment(invoiceId, paymentBody);
        setPreviewInvoice(res);
      } catch (err) {
        console.error('Preview payment failed:', err);
      } finally {
        setLoadingPreview(false);
      }
    };
    fetchPreview();
  }, []);

  const formatPrice = (p) => Number(p || 0).toLocaleString('vi-VN') + 'đ';

  const handleConfirmPayment = async () => {
    if (!selectedMethod || !invoiceId) return;
    try {
      setConfirming(true);
      const res = await invoiceApi.confirmPayment(invoiceId, selectedMethod, paymentBody);
      onNavigate('PaymentSuccess', {
        invoiceId,
        totalAmount: formatPrice(res.tongThanhToan),
        method: selectedMethod,
        thoiGianThanhToan: res.thoiGianThanhToan,
      });
    } catch (err) {
      console.error('Confirm payment failed:', err);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FFF8F0', '#F5F5F5', '#E8F5E0']} style={styles.gradientBg}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => onNavigate('OrderDetails')} style={styles.backBtn}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M15 18L9 12L15 6" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Amount Summary from API */}
          <View style={styles.summaryCard}>
            {loadingPreview ? (
              <ActivityIndicator color="#8BA367" size="large" />
            ) : previewInvoice ? (
              <>
                <Text style={styles.summaryLabel}>Hóa đơn {displayName}</Text>
                <Text style={styles.summaryAmount}>{formatPrice(previewInvoice.tongThanhToan)}</Text>
                {/* breakdown */}
                <View style={{ width: '100%', marginTop: 12, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>Tiền hàng</Text>
                    <Text style={{ color: '#64748B', fontSize: 13 }}>{formatPrice(previewInvoice.tongTienHang)}</Text>
                  </View>
                  {previewInvoice.giamGiaKhuyenMai > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 13 }}>Giảm giá ({previewInvoice.maKhuyenMai})</Text>
                      <Text style={{ color: '#8BA367', fontSize: 13 }}>-{formatPrice(previewInvoice.giamGiaKhuyenMai)}</Text>
                    </View>
                  )}
                  {previewInvoice.danhSachThuePhi?.map((t, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#94A3B8', fontSize: 13 }}>{t.tenThuePhi}</Text>
                      <Text style={{ color: '#64748B', fontSize: 13 }}>+{formatPrice(t.soTienQuyDoi)}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.summaryLabel}>Không thể tải hóa đơn</Text>
            )}
          </View>

          {/* Payment Methods */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={[styles.iconBox, selectedMethod === method.id && styles.iconBoxActive]}>
                  <Text style={{ fontSize: 24 }}>{method.iconText}</Text>
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDesc}>{method.desc}</Text>
                </View>
                <View style={[styles.checkCircle, selectedMethod === method.id && styles.checkCircleActive]}>
                  {selectedMethod === method.id && (
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17L4 12" stroke="#8BA367" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Instructions based on selection */}
          {selectedMethod === 'TIEN_MAT' && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="5" width="20" height="14" rx="2" stroke="#8BA367" strokeWidth="1.2" />
                <Circle cx="12" cy="12" r="3" stroke="#8BA367" strokeWidth="1.2" />
                <Path d="M16 12H16.01M8 12H8.01" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={{ fontSize: 20, fontWeight: '500', color: '#1E293B', marginTop: 16 }}>
                Nhận tiền mặt từ khách hàng
              </Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8 }}>
                Kiểm tra số tiền và xác nhận bên dưới
              </Text>
            </View>
          )}

          {selectedMethod === 'CHUYEN_KHOAN' && (
            <View style={{ paddingBottom: 40 }}>
              <Text style={{ textAlign: 'center', fontSize: 18, color: '#1E293B', fontWeight: '500', marginTop: 20 }}>
                Quét mã QR để thanh toán
              </Text>
              <View style={styles.qrCardContainer}>
                <View style={styles.qrBox}>
                  <Svg width="140" height="140" viewBox="0 0 24 24" fill="none">
                    <Path d="M3 3H9V9H3V3Z" stroke="#8BA367" strokeWidth="1.5" />
                    <Path d="M15 3H21V9H15V3Z" stroke="#8BA367" strokeWidth="1.5" />
                    <Path d="M3 15H9V21H3V15Z" stroke="#8BA367" strokeWidth="1.5" />
                    <Path d="M15 15H18" stroke="#8BA367" strokeWidth="1.5" />
                    <Path d="M21 15V18" stroke="#8BA367" strokeWidth="1.5" />
                    <Path d="M15 21V18" stroke="#8BA367" strokeWidth="1.5" />
                    <Path d="M21 21H18" stroke="#8BA367" strokeWidth="1.5" />
                    <Rect x="17.5" y="17.5" width="1" height="1" fill="#8BA367" />
                    <Rect x="6" y="6" width="1" height="1" fill="#8BA367" />
                    <Rect x="17.5" y="6" width="1" height="1" fill="#8BA367" />
                    <Rect x="6" y="17.5" width="1" height="1" fill="#8BA367" />
                  </Svg>
                </View>
                <View style={styles.bankInfoContainer}>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Ngân hàng:</Text>
                    <Text style={styles.bankValue}>MB Bank</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>STK:</Text>
                    <Text style={styles.bankValue}>0123456789</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Chủ TK:</Text>
                    <Text style={styles.bankValue}>MATCHTEA COFFEE</Text>
                  </View>
                  <View style={styles.transferNote}>
                    <Text style={styles.transferNoteText}>
                      Nội dung: MATCHTEA {displayName} {previewInvoice ? Number(previewInvoice.tongThanhToan).toFixed(0) : ''}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.exportBtn}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M17 8L12 3L7 8" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 3V15" stroke="#8BA367" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.exportBtnText}>Xuất hóa đơn tạm tính</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, (!selectedMethod || confirming) && styles.confirmBtnDisabled]}
            disabled={!selectedMethod || confirming}
            onPress={handleConfirmPayment}
          >
            {confirming ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78477 19.2461 3.61096 17.4371C2.43716 15.6281 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85782 7.69279 2.71537 9.79631 2.24013C11.8998 1.7649 14.1003 1.98234 16.07 2.85999" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M22 4L12 14.01L9 11.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.confirmBtnText}>Xác nhận thanh toán</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Payment;
