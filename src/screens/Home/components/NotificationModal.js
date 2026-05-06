import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Coffee, CreditCard, CalendarClock, Bell, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const NotificationModal = ({ isVisible, onClose }) => {
  // Dữ liệu mẫu (mock data)
  const notifications = [
    { id: '1', title: 'Đơn hàng mới', message: 'Bàn 05 vừa gọi thêm 2 món mới.', time: '2 phút trước', type: 'order', isUnread: true },
    { id: '2', title: 'Yêu cầu thanh toán', message: 'Bàn 02 yêu cầu thanh toán hóa đơn.', time: '5 phút trước', type: 'payment', isUnread: true },
    { id: '3', title: 'Bàn đặt trước', message: 'Khách hàng Nguyễn Văn A sắp đến (Bàn 08).', time: '15 phút trước', type: 'reservation', isUnread: true },
    { id: '4', title: 'Hệ thống', message: 'Cập nhật phiên bản mới thành công.', time: '1 giờ trước', type: 'system', isUnread: false },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Coffee size={24} color="#10B981" />;
      case 'payment': return <CreditCard size={24} color="#F59E0B" />;
      case 'reservation': return <CalendarClock size={24} color="#EF4444" />;
      default: return <Bell size={24} color="#6366F1" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'order': return '#ECFDF5';
      case 'payment': return '#FEF3C7';
      case 'reservation': return '#FEF2F2';
      default: return '#EEF2FF';
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.notiItem, !item.isUnread && styles.notiRead]}>
      <View style={[styles.iconWrap, { backgroundColor: getBgColor(item.type) }]}>
        {getIcon(item.type)}
      </View>
      <View style={styles.notiContent}>
        <View style={styles.notiHeader}>
          <Text style={[styles.notiTitle, item.isUnread && styles.textUnread]}>{item.title}</Text>
          <Text style={styles.notiTime}>{item.time}</Text>
        </View>
        <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
      </View>
      {item.isUnread && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Thông báo</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3 mới</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Đánh dấu tất cả là đã đọc</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 500,
    maxHeight: height * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  notiItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  notiRead: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notiContent: {
    flex: 1,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  textUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  notiTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notiMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 12,
  },
  markAllBtn: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  markAllText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default NotificationModal;
