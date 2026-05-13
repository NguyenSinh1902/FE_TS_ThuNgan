import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CustomAlert = ({ visible, onClose, title, message, type = 'info', buttons }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={48} color="#10B981" strokeWidth={1.5} />;
      case 'error':
        return <XCircle size={48} color="#EF4444" strokeWidth={1.5} />;
      case 'warning':
        return <AlertTriangle size={48} color="#F59E0B" strokeWidth={1.5} />;
      default:
        return <Info size={48} color="#3B82F6" strokeWidth={1.5} />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  const renderButtons = () => {
    if (buttons && buttons.length > 0) {
      return buttons.map((btn, index) => {
        const isPrimary = index === buttons.length - 1; // Assume last button is primary
        
        if (isPrimary) {
          return (
            <TouchableOpacity key={index} style={styles.primaryBtn} onPress={btn.onPress}>
              <LinearGradient 
                colors={['#7EAA58', '#408043']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.gradientBtn}
              >
                <Text style={styles.primaryBtnText}>{btn.text}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        }
        
        return (
          <TouchableOpacity key={index} style={styles.secondaryBtn} onPress={btn.onPress}>
            <Text style={styles.secondaryBtnText}>{btn.text}</Text>
          </TouchableOpacity>
        );
      });
    }

    // Default button if none provided
    return (
      <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
        <LinearGradient 
          colors={['#7EAA58', '#408043']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={styles.gradientBtn}
        >
          <Text style={styles.primaryBtnText}>OK</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          
          <Text style={[styles.title, { color: '#1E293B' }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {renderButtons()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: Math.min(width * 0.8, 400),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold', // Assuming this font or similar is available, fallback will be used if not
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
