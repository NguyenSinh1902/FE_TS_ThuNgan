import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const NewMemberModal = ({ visible, onClose, onCreateCustomer, initialPhone = '' }) => {
    const [hoTen, setHoTen] = useState('');
    const [soDienThoai, setSoDienThoai] = useState('');
    const [hangThanhVien, setHangThanhVien] = useState('Đồng');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setSoDienThoai(initialPhone);
            setHoTen('');
            setHangThanhVien('Đồng');
        }
    }, [visible, initialPhone]);

    const handleCreate = async () => {
        if (!hoTen || !soDienThoai) return;
        setLoading(true);
        await onCreateCustomer({ hoTen, soDienThoai, gioiTinh: 'NAM', hangThanhVien });
        setLoading(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            {/* Glassmorphism Backdrop Simulation */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.glassBackground} />
            </TouchableWithoutFeedback>

            <View style={styles.modalContainer} pointerEvents="box-none">
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Đăng ký Thành Viên Mới</Text>
                            <Text style={styles.subtitle}>Điền thông tin định danh cho khách hàng</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <Path d="M18 6L6 18M6 6L18 18" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập họ và tên..."
                        placeholderTextColor="#94A3B8"
                        value={hoTen}
                        onChangeText={setHoTen}
                    />

                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập số điện thoại..."
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        value={soDienThoai}
                        onChangeText={setSoDienThoai}
                    />

                    <Text style={styles.label}>Hạng thành viên mặc định</Text>
                    <View style={styles.tierSelectRow}>
                        {['Đồng', 'Bạc', 'Vàng', 'Kim cương'].map(tier => (
                            <TouchableOpacity
                                key={tier}
                                style={[styles.tierBtn, hangThanhVien === tier && styles.tierBtnActive]}
                                onPress={() => setHangThanhVien(tier)}
                            >
                                <Text style={[styles.tierBtnText, hangThanhVien === tier && styles.tierBtnTextActive]}>{tier}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading || !hoTen || !soDienThoai}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.createBtnText}>Hoàn tất Đăng ký</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    glassBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Frost glass sim
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 460,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    closeBtn: {
        padding: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
    },
    input: {
        height: 48,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1E293B',
        marginBottom: 20,
    },
    tierSelectRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
        flexWrap: 'wrap'
    },
    tierBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tierBtnActive: {
        backgroundColor: '#8BA367',
        borderColor: '#8BA367',
    },
    tierBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    tierBtnTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    createBtn: {
        height: 52,
        backgroundColor: '#8BA367',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    }
});

export default NewMemberModal;
