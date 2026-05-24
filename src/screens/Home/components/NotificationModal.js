import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Coffee, CreditCard, CalendarClock, Bell, X, AlertTriangle, CheckCircle } from 'lucide-react-native';
import safeAsyncStorage from '../../../utils/storage';

const { height } = Dimensions.get('window');
const NOTI_KEY = 'cashier_notifications';

/**
 * Thêm thông báo mới vào AsyncStorage (gọi từ bên ngoài component)
 * @param {object} noti - { title, message, type }
 */
export async function pushNotification(noti) {
  try {
    const raw = await safeAsyncStorage.getItem(NOTI_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const newItem = {
      id: Date.now().toString(),
      title: noti.title,
      message: noti.message,
      type: noti.type || 'info',
      time: Date.now(),
      isUnread: true,
    };
    const updated = [newItem, ...existing].slice(0, 50);
    await safeAsyncStorage.setItem(NOTI_KEY, JSON.stringify(updated));
  } catch (e) {
    console.log('[Cashier Noti] push error:', e?.message);
  }
}

const getIcon = (type) => {
  switch (type) {
    case 'payment':     return <CreditCard size={22} color="#DC2626" />;
    case 'reservation': return <CalendarClock size={22} color="#2563EB" />;
    case 'cancelled':   return <AlertTriangle size={22} color="#DC2626" />;
    case 'completed':   return <CheckCircle size={22} color="#059669" />;
    case 'order':       return <Coffee size={22} color="#10B981" />;
    default:            return <Bell size={22} color="#6366F1" />;
  }
};

const getBgColor = (type) => {
  switch (type) {
    case 'payment':     return '#FEF2F2';
    case 'reservation': return '#EFF6FF';
    case 'cancelled':   return '#FEF2F2';
    case 'completed':   return '#ECFDF5';
    case 'order':       return '#ECFDF5';
    default:            return '#EEF2FF';
  }
};

const formatTime = (timestamp) => {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

const NotificationModal = ({ isVisible, onClose }) => {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const raw = await safeAsyncStorage.getItem(NOTI_KEY);
      setNotifications(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    if (isVisible) loadNotifications();
  }, [isVisible, loadNotifications]);

  const markAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, isUnread: false }));
    setNotifications(updated);
    await safeAsyncStorage.setItem(NOTI_KEY, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const renderItem = useCallback(({ item }) => (
    <View style={[styles.notiItem, !item.isUnread && styles.notiRead]}>
      <View style={[styles.iconWrap, { backgroundColor: getBgColor(item.type) }]}>
        {getIcon(item.type)}
      </View>
      <View style={styles.notiContent}>
        <View style={styles.notiHeader}>
          <Text style={[styles.notiTitle, item.isUnread && styles.textUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notiTime}>{formatTime(item.time)}</Text>
        </View>
        <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
      </View>
      {item.isUnread && <View style={styles.unreadDot} />}
    </View>
  ), []);

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Thông báo</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount} mới</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <Bell size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
            />
          )}

          {notifications.length > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Text style={styles.markAllText}>Đánh dấu tất cả là đã đọc</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 520,
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
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginRight: 12 },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: { color: '#94A3B8', fontSize: 15, marginTop: 12 },
  listContent: { padding: 12 },
  notiItem: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  notiRead: { opacity: 0.55 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  notiContent: { flex: 1 },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: { fontSize: 15, fontWeight: '600', color: '#334155', flex: 1, marginRight: 8 },
  textUnread: { fontWeight: '800', color: '#0F172A' },
  notiTime: { fontSize: 12, color: '#94A3B8' },
  notiMessage: { fontSize: 13, color: '#64748B', lineHeight: 19 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#3B82F6', marginLeft: 10,
  },
  markAllBtn: {
    padding: 16, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  markAllText: { color: '#3B82F6', fontWeight: '700', fontSize: 15 },
});

export default NotificationModal;
