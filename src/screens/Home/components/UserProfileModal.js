import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Image, ActivityIndicator, Alert, useWindowDimensions, ScrollView, Platform, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import safeAsyncStorage from '../../../utils/storage';
import Svg, { Path, Circle } from 'react-native-svg';
import staffApi from '../../../api/staffApi';
import DatePicker from 'react-native-date-picker';

// Thin stroke icons (1.5px)
const CloseIcon = ({ color = '#94A3B8' }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6L18 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const EditIcon = ({ color = '#8BA367' }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const CameraIcon = ({ size = 20, color = "#FFFFFF" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const UserIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const PhoneIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const CalendarIcon = () => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M16 2v4M8 2v4M3 10h18" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const CheckIcon = ({ size = 24, color = '#FFFFFF' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const AlertIcon = ({ size = 20, color = '#EF4444' }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
        <Path d="M12 8V12M12 16H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const UserProfileModal = ({ isVisible, onClose, onLogout, onUpdate, user: propUser }) => {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 700;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form fields
    const [hoTen, setHoTen] = useState('');
    const [gioiTinh, setGioiTinh] = useState('NAM');
    const [ngaySinh, setNgaySinh] = useState('');
    const [soDienThoai, setSoDienThoai] = useState('');
    const [avatarUri, setAvatarUri] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [notification, setNotification] = useState({ visible: false, type: 'success', message: '' });
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const showToast = (type, message) => {
        setNotification({ visible: true, type, message });
        
        slideAnim.setValue(-100);
        opacityAnim.setValue(0);

        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: Platform.OS === 'ios' ? 80 : 60,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setNotification({ visible: false, type: '', message: '' });
            });
        }, 3000);
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date();
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return new Date();
    };

    useEffect(() => {
        if (isVisible) {
            loadUser();
            setIsEditing(false); // Reset edit state when opening
        }
    }, [isVisible, propUser]);

    const loadUser = async () => {
        try {
            let userData = propUser; // Ưu tiên dùng prop truyền từ ngoài vào
            
            if (!userData) {
                const userStr = await safeAsyncStorage.getItem('user');
                if (userStr) {
                    userData = JSON.parse(userStr);
                }
            }

            if (userData) {
                setUser(userData);
                setHoTen(userData.hoTen || '');
                setGioiTinh(userData.gioiTinh || 'NAM');
                
                if (userData.ngaySinh) {
                    const dateObj = new Date(userData.ngaySinh);
                    const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    setNgaySinh(formattedDate);
                } else {
                    setNgaySinh('');
                }
                
                setSoDienThoai(userData.soDienThoai || '');
                setAvatarUri(userData.avatar || userData.hinhAnh || null);
                setAvatarFile(null);
                setErrors({});
            }
        } catch (error) {
            console.error('Error loading user', error);
        }
    };

    const handlePickImage = async () => {
        if (!isEditing) return;
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
            });

            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setAvatarUri(asset.uri);
                setAvatarFile({
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    name: asset.fileName || 'avatar.jpg'
                });
            }
        } catch (error) {
            console.error('Pick image error', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setErrors({});
        loadUser(); // Reset fields to original
    };

    const handleSave = async () => {
        if (!user || !user.idNhanVien) return;

        try {
            setLoading(true);
            const formData = new FormData();

            const requestData = {
                hoTen,
                gioiTinh,
                ngaySinh,
                soDienThoai
            };

            formData.append('request', {
                string: JSON.stringify(requestData),
                type: 'application/json'
            });

            if (avatarFile) {
                formData.append('file', avatarFile);
            }

            console.log('Sending request to update profile...', requestData);
            await staffApi.updateProfileWithAvatar(user.idNhanVien, formData);
            console.log('Profile updated successfully on backend!');

            // Update local storage
            const updatedUser = { ...user, ...requestData, avatar: avatarUri };
            await safeAsyncStorage.setItem('user', JSON.stringify(updatedUser));
            
            if (onUpdate) {
                onUpdate(updatedUser);
            }
            
            showToast('success', 'Cập nhật hồ sơ thành công!');
            setIsEditing(false);
        } catch (error) {
            console.error('Save profile error', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                showToast('error', 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent={true} hardwareAccelerated={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { width: isTablet ? '45%' : '90%', maxHeight: '85%' }]}>
                    
                    {/* Header: Cover Photo & Close Button */}
                    <View style={styles.headerCover}>
                        <LinearGradient
                            colors={['#9BC158', '#C2E094', '#E8F5D8']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.coverGradient}
                        />
                        <Image 
                            source={require('../../../assets/images/user_cover.png')} 
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                        {/* Dim overlay for better contrast */}
                        <View style={styles.coverOverlay} />
                        
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <CloseIcon color="#FFFFFF" />
                        </TouchableOpacity>
                        

                    </View>

                    {/* Profile Section with Overlapping Avatar */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarContainer}>
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarInitials}>
                                            {hoTen ? hoTen.split(' ').pop().substring(0, 2).toUpperCase() : 'AD'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {isEditing && (
                                <TouchableOpacity style={styles.avatarCameraBtn} onPress={handlePickImage}>
                                    <CameraIcon size={14} color="#FFFFFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <Text style={styles.userName}>{hoTen || "Chưa cập nhật"}</Text>
                        
                        <View style={styles.badgeRow}>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{user?.vaiTro || "PHỤC VỤ"}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>ĐANG HOẠT ĐỘNG</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingTop: 10 }}>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>Thông tin cá nhân</Text>
                            {!isEditing && (
                                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editInlineBtn}>
                                    <EditIcon color="#8BA367" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Họ và tên</Text>
                            {!isEditing ? (
                                <View style={styles.readonlyRow}>
                                    <UserIcon />
                                    <Text style={styles.readonlyText}>{hoTen || 'Chưa cập nhật'}</Text>
                                </View>
                            ) : (
                                <View style={[styles.inputWrapper, errors.hoTen && styles.inputError]}>
                                    <UserIcon />
                                    <TextInput
                                        style={styles.input}
                                        value={hoTen}
                                        onChangeText={(text) => {
                                            setHoTen(text);
                                            setErrors({...errors, hoTen: null});
                                        }}
                                        placeholder="Nhập họ và tên"
                                        placeholderTextColor="#94A3B8"
                                        editable={true}
                                    />
                                </View>
                            )}
                            {errors.hoTen && <Text style={styles.errorText}>{errors.hoTen}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Giới tính</Text>
                            {!isEditing ? (
                                <View style={styles.readonlyRow}>
                                    <UserIcon />
                                    <Text style={styles.readonlyText}>{gioiTinh === 'NAM' ? 'Nam' : 'Nữ'}</Text>
                                </View>
                            ) : (
                                <View style={styles.genderRow}>
                                    <TouchableOpacity 
                                        style={[styles.genderBtn, gioiTinh === 'NAM' && { borderColor: '#9BC158' }]} 
                                        onPress={() => setGioiTinh('NAM')}
                                    >
                                        {gioiTinh === 'NAM' ? (
                                            <LinearGradient colors={['#9BC158', '#5E8D2E']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.genderGradient}>
                                                <Text style={[styles.genderText, { color: '#FFFFFF' }]}>Nam</Text>
                                            </LinearGradient>
                                        ) : (
                                            <Text style={styles.genderText}>Nam</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.genderBtn, gioiTinh === 'NU' && { borderColor: '#9BC158' }]} 
                                        onPress={() => setGioiTinh('NU')}
                                    >
                                        {gioiTinh === 'NU' ? (
                                            <LinearGradient colors={['#9BC158', '#5E8D2E']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.genderGradient}>
                                                <Text style={[styles.genderText, { color: '#FFFFFF' }]}>Nữ</Text>
                                            </LinearGradient>
                                        ) : (
                                            <Text style={styles.genderText}>Nữ</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Ngày sinh</Text>
                            {!isEditing ? (
                                <View style={styles.readonlyRow}>
                                    <CalendarIcon />
                                    <Text style={styles.readonlyText}>{ngaySinh || 'Chưa cập nhật'}</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.inputWrapper, errors.ngaySinh && styles.inputError]}
                                    onPress={() => setOpenDatePicker(true)}
                                >
                                    <CalendarIcon />
                                    <Text style={[styles.input, { color: ngaySinh ? '#1E293B' : '#94A3B8' }]}>
                                        {ngaySinh || 'Chọn ngày sinh'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {errors.ngaySinh && <Text style={styles.errorText}>{errors.ngaySinh}</Text>}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Số điện thoại</Text>
                            {!isEditing ? (
                                <View style={styles.readonlyRow}>
                                    <PhoneIcon />
                                    <Text style={styles.readonlyText}>{soDienThoai || 'Chưa cập nhật'}</Text>
                                </View>
                            ) : (
                                <View style={[styles.inputWrapper, errors.soDienThoai && styles.inputError]}>
                                    <PhoneIcon />
                                    <TextInput
                                        style={styles.input}
                                        value={soDienThoai}
                                        onChangeText={(text) => {
                                            setSoDienThoai(text);
                                            setErrors({...errors, soDienThoai: null});
                                        }}
                                        placeholder="Nhập số điện thoại"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        editable={true}
                                    />
                                </View>
                            )}
                            {errors.soDienThoai && <Text style={styles.errorText}>{errors.soDienThoai}</Text>}
                        </View>

                        {/* Actions */}
                        {isEditing ? (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
                                    <Text style={styles.cancelText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                                    <LinearGradient colors={['#9BC158', '#5E8D2E']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.saveBtnInner}>
                                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.divider} />
                                <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                                    <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                    
                </View>
                
                {/* Glassmorphism Notification */}
                {notification.visible && (
                    <Animated.View style={[
                        styles.notificationContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                            opacity: opacityAnim,
                        }
                    ]}>
                        <View style={[
                            styles.notificationContent,
                            {
                                borderColor: notification.type === 'success' ? 'rgba(155, 193, 88, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                            }
                        ]}>
                            {notification.type === 'success' ? (
                                <View style={styles.successIconGlow}>
                                    <CheckIcon size={12} color="#5E8D2E" />
                                </View>
                            ) : (
                                <AlertIcon size={16} color="#EF4444" />
                            )}
                            <Text style={[
                                styles.notificationText,
                                { color: notification.type === 'success' ? '#2C4C1B' : '#7F1D1D' }
                            ]}>
                                {notification.message}
                            </Text>
                        </View>
                    </Animated.View>
                )}
            </View>

            <DatePicker
                modal
                open={openDatePicker}
                date={parseDate(ngaySinh)}
                mode="date"
                onConfirm={(date) => {
                    setOpenDatePicker(false);
                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    setNgaySinh(formattedDate);
                    setErrors({...errors, ngaySinh: null});
                }}
                onCancel={() => {
                    setOpenDatePicker(false);
                }}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // Porcelain dark tint
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF', // Solid white
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        flexDirection: 'column',
    },
    headerCover: {
        height: 140,
        position: 'relative',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    coverGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        opacity: 0.4, // Blend with gradient
    },
    coverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    editInlineBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(139, 163, 103, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverCameraBtn: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    profileSection: {
        alignItems: 'center',
        marginTop: -45, // Overlap
        marginBottom: 10,
        zIndex: 1,
    },
    avatarWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFFFFF',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    avatarContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F1F5F9',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E2E8F0',
    },
    avatarInitials: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#64748B',
    },
    avatarCameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#8BA367',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
        alignItems: 'center',
    },
    roleBadge: {
        backgroundColor: 'rgba(139, 163, 103, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B8E4E',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
        shadowRadius: 4,
        shadowOpacity: 0.6,
        elevation: 2,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
    },
    formGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
    },
    readonlyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
    },
    readonlyText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F8FAFC',
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
        padding: 0,
    },
    inputReadonly: {
        color: '#64748B',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        fontSize: 11,
        color: '#EF4444',
        marginTop: 2,
    },
    genderRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    genderBtn: {
        flex: 1,
        height: 38,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    genderGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    genderText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    cancelBtn: {
        flex: 1,
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: 'bold',
    },
    saveBtn: {
        flex: 2,
        height: 44,
        borderRadius: 8,
        overflow: 'hidden',
    },
    saveBtnInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    logoutBtn: {
        height: 44,
        borderRadius: 8,
        backgroundColor: 'rgba(254, 242, 242, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        color: '#DC2626',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        width: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#9BC158',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    notificationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        elevation: 100,
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    notificationText: {
        fontSize: 14,
        fontWeight: '600',
    },
    successIconGlow: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(155, 193, 88, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default UserProfileModal;
