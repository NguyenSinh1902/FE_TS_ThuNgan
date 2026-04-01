import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ActiveOrders = ({ onNavigate }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng cần thanh toán</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Placeholder for orders */}
        <View style={styles.orderCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.tableId}>Bàn 5</Text>
            <Text style={styles.orderTime}>16:25</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.itemText}>- 2x Trà sữa Matcha</Text>
            <Text style={styles.itemText}>- 1x Hồng trà kem muối</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.totalPrice}>145,000đ</Text>
            <Pressable style={styles.payBtn} onPress={() => onNavigate('Login')}>
              <Text style={styles.payBtnText}>Thanh toán</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thêm đơn hàng mới...</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.logoutBtn} onPress={() => onNavigate('Login')}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#242928',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  tableId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#242928',
  },
  orderTime: {
    color: '#888',
  },
  cardBody: {
    marginBottom: 15,
  },
  itemText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#242928',
  },
  payBtn: {
    backgroundColor: '#242928',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  payBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  logoutBtn: {
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4D4D',
    fontWeight: '600',
  },
});

export default ActiveOrders;
