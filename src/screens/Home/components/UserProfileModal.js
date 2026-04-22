import React from 'react';
import { View, Text, Modal, Pressable, useWindowDimensions, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const UserProfileModal = ({ isVisible, onClose, onLogout, user }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const userData = user || {};

  const getRoleLabel = (role) => {
    switch (role) {
      case 'THU_NGAN': return 'Thu ngân';
      case 'PHUC_VU': return 'Phục vụ';
      case 'QUAN_LY': return 'Quản lý';
      default: return role || 'Nhân viên';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'HOAT_DONG': return 'Đang hoạt động';
      case 'TAM_KHOA': return 'Tạm khóa';
      case 'CHO_DUYET': return 'Chờ duyệt';
      default: return status || 'Đang hoạt động';
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={[styles.modalCard, { width: isTablet ? 500 : '92%' }]}>
          {/* Header với Ảnh bìa */}
          <View style={styles.header}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }}>
              <Image 
                source={require('../../../assets/images/user_cover.png')} 
                style={{ width: '100%', height: '100%' }} 
                resizeMode="cover"
              />
            </View>
            
            <LinearGradient 
              colors={['transparent', 'rgba(126, 170, 88, 0.8)', '#408043']} 
              style={StyleSheet.absoluteFill} 
              locations={[0, 0.6, 1]}
            />
            
            <View style={styles.headerContent}>
              <View style={styles.avatarLarge}>
                <Image 
                  source={require('../../../assets/images/user_avatar.png')} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.userNameHeader}>{userData.hoTen}</Text>
              <Text style={styles.userRoleHeader}>{getRoleLabel(userData.vaiTro)}</Text>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            <LinearGradient 
              colors={['#F8FAFC', '#F1F5F9']} 
              style={StyleSheet.absoluteFill} 
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, zIndex: 1 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Thông tin nhân viên</Text>
              <Pressable style={styles.editMainBtn}>
                <View style={styles.editIconCircle}>
                  <Text style={{ fontSize: 16 }}>✏️</Text>
                </View>
              </Pressable>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Text>📧</Text></View>
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Text>📞</Text></View>
              <View>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{userData.soDienThoai}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Text>⚧</Text></View>
              <View>
                <Text style={styles.infoLabel}>Giới tính</Text>
                <Text style={styles.infoValue}>{userData.gioiTinh === 'NAM' ? 'Nam' : (userData.gioiTinh === 'NU' ? 'Nữ' : 'Chưa cập nhật')}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Text>⚡</Text></View>
              <View>
                <Text style={styles.infoLabel}>Trạng thái tài khoản</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{getStatusLabel(userData.trangThai)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Pressable style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutBtnText}>🔒 Đăng xuất tài khoản</Text>
              </Pressable>
              <Text style={styles.versionText}>Phiên bản 1.0.4 - MatchTea Cashier</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  editMainBtn: {
    padding: 4,
  },
  editIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userNameHeader: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  userRoleHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  body: {
    padding: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 16,
  },
  logoutBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '800',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  }
});

export default UserProfileModal;
