import React from 'react';
import { View, Text, StatusBar, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import s from './styles';

const Start = ({ onNavigate }) => {
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
            <Text style={{ fontSize: 60 }}>🍵</Text>
          </LinearGradient>
        </View>
        <Text style={s.brandTitle} numberOfLines={2}>MatchTea{'\n'}Cashier</Text>
      </View>

      {/* Cột phải (60%) */}
      <View style={s.rightCol}>
        <Text style={s.decor4}>🍃</Text>
        <Text style={s.decor5}>🌿</Text>

        <View style={s.contentWrap}>
          {/* Welcome on 1 line */}
          <Text style={s.title} numberOfLines={1}>Welcome to MatchTea Cashier</Text>
          <Text style={s.subtitle}>Hệ thống chuyên nghiệp, quản lý vận hành mượt mà và thông minh dành cho thu ngân.</Text>

          <View style={s.btnRow}>
            <Pressable
              style={({ pressed }) => [s.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => onNavigate('Login')}
            >
              <LinearGradient colors={['#7EAA58', '#408043']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btnPrimary}>
                <Text style={s.btnPrimaryText} numberOfLines={1}>Đăng nhập</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.btnWrapper, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => onNavigate('Register')}
            >
              <View style={s.btnSecondary}>
                <Text style={s.btnSecondaryText} numberOfLines={1}>Đăng ký</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Start;
