import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import invoiceApi from '../../api/invoiceApi';
import styles from './PaymentSuccess.styles';

const PaymentSuccess = ({ onNavigate, params }) => {
  const [completing, setCompleting] = useState(false);

  const invoiceId = params?.invoiceId;
  const amountStr = params?.totalAmount || '0đ';
  const methodLabel = params?.method === 'TIEN_MAT' ? 'Tiền mặt' : 'Chuyển khoản';
  const thoiGian = params?.thoiGianThanhToan
    ? new Date(params.thoiGianThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const handleComplete = async () => {
    try {
      setCompleting(true);
      if (invoiceId) await invoiceApi.completeOrder(invoiceId);
      onNavigate('Home');
    } catch (err) {
      console.error('Complete order failed:', err);
      onNavigate('Home'); // navigate anyway on error
    } finally {
      setCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#FFF8F0', '#F5F5F5', '#E8F5E0']} style={styles.gradientBg}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <Svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <Path d="M20 6L9 17L4 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        {/* Message */}
        <Text style={styles.successTitle}>Thanh toán thành công!</Text>
        <Text style={styles.successSub}>Hóa đơn #{invoiceId} đã được xử lý xong.</Text>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã hóa đơn</Text>
            <Text style={styles.detailValue}>#{invoiceId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phương thức</Text>
            <Text style={styles.detailValue}>{methodLabel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian</Text>
            <Text style={styles.detailValue}>{thoiGian}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tổng thanh toán</Text>
            <Text style={styles.detailValueLarge}>{amountStr}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing
              ? <ActivityIndicator color="white" />
              : <Text style={styles.completeBtnText}>Hoàn tất & Giải phóng bàn</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => onNavigate('Home')}
          >
            <Text style={styles.homeBtnText}>Quay về màn hình chính</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PaymentSuccess;
