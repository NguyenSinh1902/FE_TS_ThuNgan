import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Toast thông báo nổi cho Thu ngân.
 * Hỗ trợ các type:
 *   'payment'   — khách yêu cầu thanh toán (đỏ cam, khẩn cấp)
 *   'reservation' — đặt bàn / check-in (xanh dương)
 *   'cancelled' — đơn bị hủy (đỏ)
 *   'info'      — thông tin chung (xanh lá)
 */

const TOAST_CONFIG = {
  payment: {
    colors: ['#92400E', '#F59E0B'],
    shadowColor: '#D97706',
    icon: '💵',
    title: '💵 Khách gọi thanh toán!',
  },
  reservation: {
    colors: ['#1E40AF', '#3B82F6'],
    shadowColor: '#2563EB',
    icon: '📅',
    title: 'Đặt bàn / Check-in',
  },
  cancelled: {
    colors: ['#7F1D1D', '#DC2626'],
    shadowColor: '#991B1B',
    icon: '🚨',
    title: 'Đơn hàng bị hủy!',
  },
  completed: {
    colors: ['#065F46', '#059669'],
    shadowColor: '#047857',
    icon: '✅',
    title: 'Đơn hàng hoàn tất',
  },
  info: {
    colors: ['#1E3A5F', '#1D4ED8'],
    shadowColor: '#1E40AF',
    icon: '🔔',
    title: 'Thông báo',
  },
};

const CashierToast = ({ toast, onDismiss }) => {
  const translateY = useRef(new Animated.Value(-130)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => handleDismiss(), toast.duration || 6000);
    return () => clearTimeout(timer);
  }, [toast?.id]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -130, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDismiss && onDismiss());
  };

  if (!toast) return null;
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }], opacity }]}>
      <Pressable onPress={handleDismiss} style={[styles.pressable, { shadowColor: config.shadowColor }]}>
        <LinearGradient colors={config.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{config.icon}</Text>
            <View style={styles.pingRing} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{toast.message}</Text>
          </View>
          <View style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  pressable: {
    width: Math.min(SCREEN_WIDTH - 32, 620),
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  icon: { fontSize: 24 },
  pingRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  textWrap: { flex: 1 },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 2,
  },
  body: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  closeText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
});

export default CashierToast;
