import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Animated, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import authApi from '../../api/authApi';
import safeAsyncStorage from '../../utils/storage';
import s from './styles';
import CustomAlert from '../../components/CustomAlert';

const AuthLayout = ({ children, onNavigate, title }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" />

      {/* Cột trái (40%) */}
      <View style={s.leftCol}>
        <Text style={s.decor1}>🍃</Text>
        <Text style={s.decor2}>🍵</Text>
        <Text style={s.decor3}>🌿</Text>

        <View style={s.logoGlow}>
          <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logoWrap}>
            <Text style={{ fontSize: 44 }}>🍵</Text>
          </LinearGradient>
        </View>
        <Text style={s.brandTitle} numberOfLines={2}>MatchTea Cashier</Text>
      </View>

      {/* Cột phải (60%) */}
      <View style={s.rightCol}>
        <Text style={s.decor4}>🍃</Text>
        <Text style={s.decor5}>🌿</Text>
        <Animated.View style={[s.card, { opacity: fadeAnim }]}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.backBtnBtn} onPress={() => onNavigate('Register', { goBack: true })} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ fontSize: 40, color: '#64748B', fontWeight: '300', lineHeight: 44, marginTop: -4 }}>‹</Text>
            </TouchableOpacity>
            <Text style={s.title} numberOfLines={1}>{title}</Text>
          </View>
          {children}
        </Animated.View>
      </View>
    </View>
  );
};

const VerifyOTP = ({ onNavigate, params }) => {
  const { email: initialEmail } = params || {};
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });
  const inputRef = useRef(null);

  useEffect(() => {
    if (!email) {
      const getEmail = async () => {
        const savedEmail = await safeAsyncStorage.getItem('pending_email');
        if (savedEmail) {
          setEmail(savedEmail);
        }
      };
      getEmail();
    }
  }, [email]);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setAlert({ visible: true, title: 'Lỗi', message: 'Vui lòng nhập mã OTP 6 chữ số', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.verifyRegister({ email, otp });

      if (response === 'Xác thực OTP thành công!' || response.message?.includes('thành công')) {
        setAlert({
          visible: true,
          title: 'Xác thực thành công',
          message: 'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập.',
          type: 'success',
          buttons: [{ text: 'OK', onPress: () => {
            setAlert({ ...alert, visible: false });
            onNavigate('Login');
          }}]
        });
      } else {
        setAlert({ visible: true, title: 'Lỗi', message: 'Mã OTP không chính xác hoặc đã hết hạn', type: 'error' });
      }
    } catch (error) {
      const errorMsg = error.response?.data || 'Xác thực không thành công. Vui lòng thử lại.';
      setAlert({ visible: true, title: 'Lỗi xác thực', message: typeof errorMsg === 'string' ? errorMsg : 'Mã OTP không hợp lệ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i] || '';
      const isFocused = otp.length === i;
      boxes.push(
        <View 
          key={i} 
          style={[
            styles.otpBox, 
            char ? styles.otpBoxFilled : null,
            isFocused ? styles.otpBoxFocused : null
          ]}
        >
          <Text style={styles.otpChar}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <AuthLayout onNavigate={onNavigate} title="Xác thực OTP">
      <View style={{ marginBottom: 30, alignItems: 'center' }}>
        <Text style={{ color: '#64748B', fontSize: 16, textAlign: 'center' }}>
          Mã xác thực đã được gửi tới:
        </Text>
        <Text style={{ color: '#059669', fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 8 }}>
          {email || 'Email'}
        </Text>
      </View>

      <Pressable style={styles.otpWrapper} onPress={() => inputRef.current?.focus()}>
        {renderOtpBoxes()}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        autoFocus={true}
      />

      <Pressable
        style={({ pressed }) => [s.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }, loading && { opacity: 0.7 }]}
        onPress={handleVerify}
        disabled={loading}
      >
        <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btnPrimary}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.btnPrimaryText} numberOfLines={1}>Xác nhận mã OTP</Text>
          )}
        </LinearGradient>
      </Pressable>

      <TouchableOpacity style={{ marginTop: 10 }}>
        <Text style={{ color: '#059669', fontWeight: '800', textAlign: 'center', fontSize: 15 }}>Gửi lại mã OTP</Text>
      </TouchableOpacity>

      <CustomAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpBox: {
    width: 65,
    height: 75,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#34A853',
    backgroundColor: '#F7FDF9',
  },
  otpBoxFocused: {
    borderColor: '#34A853',
    backgroundColor: '#FFFFFF',
    shadowColor: '#34A853',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  otpChar: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  }
});

export default VerifyOTP;
