import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Animated, Pressable, Alert, ActivityIndicator } from 'react-native';
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

const Register = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info', buttons: [] });

  useEffect(() => {
    const restoreForm = async () => {
      const savedName = await safeAsyncStorage.getItem('pending_name');
      const savedEmail = await safeAsyncStorage.getItem('pending_email');
      const savedPhone = await safeAsyncStorage.getItem('pending_phone');
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    };
    restoreForm();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setAlert({ visible: true, title: 'Lỗi', message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ visible: true, title: 'Lỗi', message: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        hoTen: name,
        email: email,
        soDienThoai: phone,
        matKhau: password,
      };

      await authApi.register(payload);
      
      // Lưu lại thông tin để dùng cho bước Verify OTP hoặc khi quay lại
      await safeAsyncStorage.setItem('pending_email', email);
      await safeAsyncStorage.setItem('pending_name', name);
      await safeAsyncStorage.setItem('pending_phone', phone);
      
      setAlert({
        visible: true,
        title: 'Thành công',
        message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra.',
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => {
          setAlert({ visible: false, title: '', message: '', type: 'info', buttons: [] });
          onNavigate('VerifyOTP', { email: email });
        }}]
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.';
      setAlert({ visible: true, title: 'Lỗi đăng ký', message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout onNavigate={onNavigate} title="Đăng ký Tài khoản Thu ngân">
      
      <View style={s.rowInputs}>
        <View style={s.inputWrap}>
          <TextInput 
            style={s.input} 
            placeholder="Họ & Tên" 
            placeholderTextColor="#94A3B8" 
            value={name} 
            onChangeText={setName} 
          />
        </View>
        <View style={s.inputWrap}>
          <TextInput 
            style={s.input} 
            placeholder="Email" 
            placeholderTextColor="#94A3B8" 
            keyboardType="email-address" 
            autoCapitalize="none"
            value={email} 
            onChangeText={setEmail} 
          />
        </View>
      </View>

      <View style={s.rowInputs}>
        <View style={s.inputWrap}>
          <TextInput 
            style={s.input} 
            placeholder="Số điện thoại" 
            placeholderTextColor="#94A3B8" 
            keyboardType="phone-pad"
            value={phone} 
            onChangeText={setPhone} 
          />
        </View>
        <View style={s.pwInputWrap}>
          <TextInput 
            style={s.pwInput} 
            placeholder="Mật khẩu" 
            placeholderTextColor="#94A3B8" 
            secureTextEntry={!showPw} 
            value={password} 
            onChangeText={setPassword} 
          />
          <TouchableOpacity onPress={() => setShowPw(!showPw)}>
            <Text style={{fontSize: 20}}>{showPw ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.rowInputs}>
        <View style={s.pwInputWrap}>
          <TextInput 
            style={s.pwInput} 
            placeholder="Xác nhận mật khẩu" 
            placeholderTextColor="#94A3B8" 
            secureTextEntry={!showConfirmPw} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
          />
          <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)}>
            <Text style={{fontSize: 20}}>{showConfirmPw ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }} />
      </View>

      <Pressable 
        style={({ pressed }) => [s.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }, loading && { opacity: 0.7 }]} 
        onPress={handleRegister}
        disabled={loading}
      >
        <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btnPrimary}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.btnPrimaryText} numberOfLines={1}>Đăng ký</Text>
          )}
        </LinearGradient>
      </Pressable>

      <TouchableOpacity onPress={() => onNavigate('Login')} style={s.footerLinkWrap}>
        <Text style={s.footerText}>
          Đã có tài khoản? <Text style={s.linkText}>Đăng nhập ngay</Text>
        </Text>
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

export default Register;
