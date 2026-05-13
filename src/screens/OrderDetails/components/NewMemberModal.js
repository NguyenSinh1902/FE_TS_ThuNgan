import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { User, Phone, X, Check } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const NewMemberModal = ({ visible, onClose, onCreateCustomer, initialPhone = '' }) => {
    const [hoTen, setHoTen] = useState('');
    const [soDienThoai, setSoDienThoai] = useState('');
    const [gioiTinh, setGioiTinh] = useState('NAM');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setSoDienThoai(initialPhone);
            setHoTen('');
            setGioiTinh('NAM');
        }
    }, [visible, initialPhone]);

    const handleCreate = async () => {
        if (!hoTen || !soDienThoai) return;
        setLoading(true);
        await onCreateCustomer({ hoTen, soDienThoai, gioiTinh });
        setLoading(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                {/* Backdrop closes the modal when pressed */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                {/* This wrapper stops propagation of touches to the backdrop */}
                <TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        {/* Header with Gradient Accent */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Đăng ký Thành Viên</Text>
                                <Text style={styles.subtitle}>Điền thông tin định danh cho khách hàng</Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formBody}>
                            {/* Input Họ và Tên */}
                            <Text style={styles.label}>Họ và tên</Text>
                            <View style={styles.inputWrapper}>
                                <User size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập họ và tên..."
                                    placeholderTextColor="#94A3B8"
                                    value={hoTen}
                                    onChangeText={setHoTen}
                                />
                            </View>

                            {/* Input Số Điện Thoại */}
                            <Text style={styles.label}>Số điện thoại</Text>
                            <View style={styles.inputWrapper}>
                                <Phone size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập số điện thoại..."
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={soDienThoai}
                                    onChangeText={setSoDienThoai}
                                />
                            </View>

                            {/* Giới tính - Redesigned as Cards */}
                            <Text style={styles.label}>Giới tính</Text>
                            <View style={styles.genderRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderCard,
                                        gioiTinh === 'NAM' && styles.genderCardActive,
                                        gioiTinh === 'NAM' && { borderColor: '#7EAA58' }
                                    ]}
                                    onPress={() => setGioiTinh('NAM')}
                                >
                                    <View style={[styles.genderIconBg, gioiTinh === 'NAM' && { backgroundColor: '#E8F5E9' }]}>
                                        <Text style={{ fontSize: 24 }}>👦</Text>
                                    </View>
                                    <View style={styles.genderInfo}>
                                        <Text style={[styles.genderLabel, gioiTinh === 'NAM' && { color: '#7EAA58' }]}>Nam</Text>
                                        <Text style={styles.genderSub}>Mã: NAM</Text>
                                    </View>
                                    {gioiTinh === 'NAM' && (
                                        <View style={styles.checkedBadge}>
                                            <Check size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.genderCard,
                                        gioiTinh === 'NU' && styles.genderCardActive,
                                        gioiTinh === 'NU' && { borderColor: '#EC4899' }
                                    ]}
                                    onPress={() => setGioiTinh('NU')}
                                >
                                    <View style={[styles.genderIconBg, gioiTinh === 'NU' && { backgroundColor: '#FCE7F3' }]}>
                                        <Text style={{ fontSize: 24 }}>👧</Text>
                                    </View>
                                    <View style={styles.genderInfo}>
                                        <Text style={[styles.genderLabel, gioiTinh === 'NU' && { color: '#EC4899' }]}>Nữ</Text>
                                        <Text style={styles.genderSub}>Mã: NU</Text>
                                    </View>
                                    {gioiTinh === 'NU' && (
                                        <View style={[styles.checkedBadge, { backgroundColor: '#EC4899' }]}>
                                            <Check size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Submit Button with Gradient */}
                        <TouchableOpacity 
                            style={styles.submitBtnWrapper} 
                            onPress={handleCreate} 
                            disabled={loading || !hoTen || !soDienThoai}
                        >
                            <LinearGradient
                                colors={(!hoTen || !soDienThoai) ? ['#CBD5E1', '#94A3B8'] : ['#7EAA58', '#408043']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.submitBtnText}>Hoàn tất Đăng ký</Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // Darker, more premium overlay
    },
    modalContent: {
        width: 480,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 28,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 15,
        overflow: 'hidden',
        zIndex: 1, // Ensure content is above overlay
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    closeBtn: {
        padding: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
    },
    formBody: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        marginTop: 16,
    },
    inputWrapper: {
        height: 52,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: '#0F172A',
        fontWeight: '500',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    genderCard: {
        flex: 1,
        height: 72,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        position: 'relative',
    },
    genderCardActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    genderIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    genderInfo: {
        flex: 1,
    },
    genderLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
    },
    genderSub: {
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 2,
    },
    checkedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#7EAA58',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    submitBtnWrapper: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#7EAA58',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    submitBtn: {
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    }
});

export default NewMemberModal;
