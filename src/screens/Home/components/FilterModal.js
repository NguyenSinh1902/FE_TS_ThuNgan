import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Check, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const filterOptions = [
  { id: 'ALL', label: 'Tất cả bàn', color: '#64748B' },
  { id: 'AVAILABLE', label: 'Bàn trống', color: '#10B981' },
  { id: 'OCCUPIED', label: 'Có khách', color: '#F59E0B' },
  { id: 'RESERVED', label: 'Đã đặt', color: '#3B82F6' },
];

const FilterModal = ({ isVisible, onClose, currentFilter, onSelectFilter }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Lọc trạng thái bàn</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionBtn,
                  currentFilter === option.id && { backgroundColor: option.color + '15', borderColor: option.color }
                ]}
                onPress={() => {
                  onSelectFilter(option.id);
                  onClose();
                }}
              >
                <View style={[styles.dot, { backgroundColor: option.color }]} />
                <Text style={[
                  styles.optionLabel,
                  currentFilter === option.id && { color: option.color, fontWeight: '700' }
                ]}>
                  {option.label}
                </Text>
                {currentFilter === option.id && <Check size={20} color={option.color} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
          </View>
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
    width: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
});

export default FilterModal;
