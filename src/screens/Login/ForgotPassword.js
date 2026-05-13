import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Animated, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import authApi from '../../api/authApi';
import safeAsyncStorage from '../../utils/storage';
import CustomAlert from '../../components/CustomAlert';

// Reusing AuthLayout pattern from Login/Register
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Cột trái (40%) */}
      <View style={styles.leftCol}>
        <Text style={styles.decor1}>🍃</Text>
        <Text style={styles.decor2}>🍵</Text>
        <Text style={styles.decor3}>🌿</Text>

        <View style={styles.logoGlow}>
          <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoWrap}>
            <Text style={{ fontSize: 44 }}>🍵</Text>
          </LinearGradient>
        </View>
        <Text style={styles.brandTitle} numberOfLines={2}>MatchTea Cashier</Text>
      </View>

      {/* Cột phải (60%) */}
      <View style={styles.rightCol}>
        <Text style={styles.decor4}>🍃</Text>
        <Text style={styles.decor5}>🌿</Text>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtnBtn} onPress={() => onNavigate('Login')} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={{fontSize: 40, color: '#64748B', fontWeight: '300', lineHeight: 44, marginTop: -4}}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>
          {children}
        </Animated.View>
      </View>
    </View>
  );
};

const ForgotPassword = ({ onNavigate }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  const handleRequestOtp = async () => {
    if (!email) {
      setAlert({ visible: true, title: 'Lỗi', message: 'Vui lòng nhập email', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.requestOtp(email);
      setAlert({
        visible: true,
        title: 'Thành công',
        message: response.message || 'Mã OTP đã được gửi về email của bạn',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {
          setAlert({ ...alert, visible: false });
          setStep(2);
        }}]
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      setAlert({ visible: true, title: 'Lỗi', message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setAlert({ visible: true, title: 'Lỗi', message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ visible: true, title: 'Lỗi', message: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.resetPassword({
        email,
        otp,
        matKhauMoi: newPassword
      });

      setAlert({
        visible: true,
        title: 'Thành công',
        message: response.message || 'Đổi mật khẩu thành công!',
        type: 'success',
        buttons: [{ text: 'Đăng nhập', onPress: () => {
          setAlert({ ...alert, visible: false });
          onNavigate('Login');
        }}]
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đổi mật khẩu không thành công. Vui lòng thử lại.';
      setAlert({ visible: true, title: 'Lỗi', message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate} title="Quên mật khẩu">
      {step === 1 ? (
        <View style={{ width: '100%' }}>
          <Text style={styles.subtitle}>Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.</Text>
          
          <View style={styles.inputWrap}>
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#94A3B8" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={email} 
              onChangeText={setEmail} 
            />
          </View>

          <Pressable 
            style={({ pressed }) => [styles.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }, loading && { opacity: 0.7 }]} 
            onPress={handleRequestOtp}
            disabled={loading}
          >
            <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnPrimary}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText} numberOfLines={1}>Gửi mã OTP</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <View style={{ width: '100%' }}>
          <Text style={styles.subtitle}>Nhập mã OTP đã gửi về email và mật khẩu mới.</Text>
          
          <View style={styles.inputWrap}>
            <TextInput 
              style={styles.input} 
              placeholder="Mã OTP" 
              placeholderTextColor="#94A3B8" 
              keyboardType="number-pad"
              maxLength={6}
              value={otp} 
              onChangeText={setOtp} 
            />
          </View>

          <View style={styles.pwInputWrap}>
            <TextInput 
              style={styles.pwInput} 
              placeholder="Mật khẩu mới" 
              placeholderTextColor="#94A3B8" 
              secureTextEntry={!showPw} 
              value={newPassword} 
              onChangeText={setNewPassword} 
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={{fontSize: 20}}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pwInputWrap}>
            <TextInput 
              style={styles.pwInput} 
              placeholder="Xác nhận mật khẩu mới" 
              placeholderTextColor="#94A3B8" 
              secureTextEntry={!showConfirmPw} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
            />
            <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)}>
              <Text style={{fontSize: 20}}>{showConfirmPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }, loading && { opacity: 0.7 }]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnPrimary}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnPrimaryText} numberOfLines={1}>Đổi mật khẩu</Text>
              )}
            </LinearGradient>
          </Pressable>
          
          <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 15 }}>
            <Text style={{ color: '#64748B', textAlign: 'center', fontSize: 14 }}>
              Gửi lại mã OTP? <Text style={{ color: '#059669', fontWeight: 'bold' }}>Quay lại</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  leftCol: {
    width: '40%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  rightCol: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  backBtnBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputWrap: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#0F172A',
    height: '100%',
  },
  pwInputWrap: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pwInput: {
    fontSize: 16,
    color: '#0F172A',
    flex: 1,
    height: '100%',
  },
  btnWrapper: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  btnPrimary: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  decor1: { position: 'absolute', top: '10%', left: '10%', fontSize: 32, opacity: 0.2 },
  decor2: { position: 'absolute', bottom: '15%', right: '15%', fontSize: 44, opacity: 0.15 },
  decor3: { position: 'absolute', top: '50%', right: '5%', fontSize: 24, opacity: 0.2 },
  decor4: { position: 'absolute', top: '5%', right: '10%', fontSize: 32, opacity: 0.2 },
  decor5: { position: 'absolute', bottom: '10%', left: '5%', fontSize: 24, opacity: 0.2 },
  logoGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(126, 170, 88, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B3B14',
    textAlign: 'center',
  },
});

export default ForgotPassword;
