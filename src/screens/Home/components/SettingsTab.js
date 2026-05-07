import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Alert, RefreshControl } from 'react-native';
import { User, Bell, Printer, ShieldCheck, Globe, Moon, CircleHelp, LogOut, ChevronRight, Smartphone } from 'lucide-react-native';

const SettingsTab = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPrint, setAutoPrint] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const SettingItem = ({ icon, title, subtitle, value, onValueChange, isSwitch, onPress, destructive }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, destructive && styles.destructiveIcon]}>
        {icon}
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: '#CBD5E1', true: '#4A924C' }}
          thumbColor="#FFF"
        />
      ) : (
        <ChevronRight size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A924C']} />}
    >
      
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Image 
            source={require('../../../assets/images/user_avatar.png')} 
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Smartphone size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.hoTen || 'Nhân viên thu ngân'}</Text>
          <Text style={styles.userRole}>{user?.vaiTro === 'THU_NGAN' ? 'Thu ngân hệ thống' : 'Quản lý cửa hàng'}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileBtn}>
          <Text style={styles.editProfileText}>Sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Cửa hàng & Vận hành</Text>
        <View style={styles.sectionContent}>
          <SettingItem 
            icon={<Printer size={20} color="#4A924C" />}
            title="Máy in hóa đơn"
            subtitle="Đã kết nối: Epson TM-T88VI"
            onPress={() => {}}
          />
          <SettingItem 
            icon={<Printer size={20} color="#4A924C" />}
            title="Tự động in hóa đơn"
            subtitle="In ngay sau khi xác nhận thanh toán"
            isSwitch
            value={autoPrint}
            onValueChange={setAutoPrint}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Cá nhân hóa</Text>
        <View style={styles.sectionContent}>
          <SettingItem 
            icon={<Bell size={20} color="#3B82F6" />}
            title="Thông báo"
            subtitle="Âm thanh và rung khi có đơn mới"
            isSwitch
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem 
            icon={<Moon size={20} color="#6366F1" />}
            title="Chế độ tối"
            subtitle="Giao diện bảo vệ mắt"
            isSwitch
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingItem 
            icon={<Globe size={20} color="#10B981" />}
            title="Ngôn ngữ"
            subtitle="Tiếng Việt"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Bảo mật & Hỗ trợ</Text>
        <View style={styles.sectionContent}>
          <SettingItem 
            icon={<ShieldCheck size={20} color="#F59E0B" />}
            title="Đổi mật khẩu"
            onPress={() => {}}
          />
          <SettingItem 
            icon={<CircleHelp size={20} color="#64748B" />}
            title="Trung tâm hỗ trợ"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionContent}>
          <SettingItem 
            icon={<LogOut size={20} color="#EF4444" />}
            title="Đăng xuất"
            destructive
            onPress={onLogout}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Phiên bản 2.1.0 (Build 2026.05)</Text>
        <Text style={styles.copyrightText}>© 2026 MatchTea POS System</Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#F1F5F9',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A924C',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  editProfileBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 16,
  },
  sectionContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  destructiveText: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
});

export default SettingsTab;
