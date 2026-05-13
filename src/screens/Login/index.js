import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Animated, Pressable, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import authApi from '../../api/authApi';
import safeAsyncStorage from '../../utils/storage';
import s from './Login.styles';

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
            <TouchableOpacity style={s.backBtnBtn} onPress={() => onNavigate('Start')} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={{fontSize: 40, color: '#64748B', fontWeight: '300', lineHeight: 44, marginTop: -4}}>‹</Text>
            </TouchableOpacity>
            <Text style={s.title} numberOfLines={1}>{title}</Text>
          </View>
          {children}
        </Animated.View>
      </View>
    </View>
  );
};

const Login = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    setErrorMessage('');

    try {
      setLoading(true);
      const response = await authApi.login({ email, matKhau: password });
      
      if (response.token) {
        // Kiểm tra quyền hạn: Chặn nhân viên PHUC_VU đăng nhập vào app Thu ngân
        if (response.user?.vaiTro === 'PHUC_VU') {
          setErrorMessage('Tài khoản của bạn không có quyền truy cập vào hệ thống Thu ngân. Vui lòng liên hệ quản lý!');
          setLoading(false);
          return;
        }

        // Lưu token và id người dùng
        await safeAsyncStorage.setItem('token', response.token);
        if (response.user?.idNhanVien) {
          await safeAsyncStorage.setItem('userId', response.user.idNhanVien.toString());
        }
        
        // Điều hướng đến Home
        onNavigate('Home', { reset: true });
      } else {
        setErrorMessage('Thông tin đăng nhập không chính xác');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate} title="Đăng nhập Hệ thống">
      
      <View style={[s.inputWrap, errorMessage ? { borderColor: '#EF4444' } : null]}>
        <TextInput
          style={s.input}
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMessage) setErrorMessage('');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={[s.pwInputWrap, errorMessage ? { borderColor: '#EF4444' } : null]}>
        <TextInput
          style={s.pwInput}
          placeholder="Mật khẩu"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPw}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMessage) setErrorMessage('');
          }}
        />
        <TouchableOpacity onPress={() => setShowPw(!showPw)}>
          <Text style={{fontSize: 20}}>{showPw ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {errorMessage ? <Text style={s.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity onPress={() => onNavigate('ForgotPassword')}>
        <Text style={s.forgotPwText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <Pressable 
        style={({ pressed }) => [s.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }, loading && { opacity: 0.7 }]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btnPrimary}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.btnPrimaryText} numberOfLines={1}>Đăng nhập</Text>
          )}
        </LinearGradient>
      </Pressable>

      <TouchableOpacity onPress={() => onNavigate('Register')} style={s.footerLinkWrap}>
        <Text style={s.footerText}>
          Chưa có tài khoản? <Text style={s.linkText}>Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>

    </AuthLayout>
  );
};

export default Login;
