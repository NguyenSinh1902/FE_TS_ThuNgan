import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Animated, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import s from './styles';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <AuthLayout onNavigate={onNavigate} title="Đăng ký Tài khoản Thu ngân">
      
      {/* Lưới 2x2 cho Input */}
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
      </View>

      <Pressable 
        style={({ pressed }) => [s.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }]} 
        onPress={() => onNavigate('Home')}
      >
        <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btnPrimary}>
          <Text style={s.btnPrimaryText} numberOfLines={1}>Đăng ký</Text>
        </LinearGradient>
      </Pressable>

      <TouchableOpacity onPress={() => onNavigate('Login')} style={s.footerLinkWrap}>
        <Text style={s.footerText}>
          Đã có tài khoản? <Text style={s.linkText}>Đăng nhập ngay</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default Register;
