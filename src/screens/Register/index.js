import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import styles from './styles';

const Register = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Perform registration logic or just navigate
    onNavigate('Login');
  };

  const CoffeeIcon = () => (
    <View style={{ width: 28, height: 28 }}>
      <Svg width="28" height="28" viewBox="0 0 28 20" fill="none">
        <Path 
          d="M18.6668 1.33334C19.0205 1.33334 19.3596 1.47381 19.6096 1.72386C19.8597 1.97391 20.0002 2.31305 20.0002 2.66667V13.3333C20.0002 14.7478 19.4383 16.1044 18.4381 17.1046C17.4379 18.1048 16.0813 18.6667 14.6668 18.6667H6.66683C5.25234 18.6667 3.89579 18.1048 2.89559 17.1046C1.8954 16.1044 1.3335 14.7478 1.3335 13.3333V2.66667C1.3335 2.31305 1.47397 1.97391 1.72402 1.72386C1.97407 1.47381 2.31321 1.33334 2.66683 1.33334H21.3335C22.748 1.33334 24.1045 1.89524 25.1047 2.89543C26.1049 3.89563 26.6668 5.25218 26.6668 6.66667C26.6668 8.08116 26.1049 9.43771 25.1047 10.4379C24.1045 11.4381 22.748 12 21.3335 12H20.0002" 
          stroke="white" 
          strokeWidth="2.66667" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path d="M10 1V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <Path d="M14 1V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  );

  const EyeIcon = ({ visible }) => (
    <Svg width="19" height="14" viewBox="0 0 19 14" fill="none">
      <Path 
        d="M0.885584 6.95616C0.816133 6.76907 0.816133 6.56326 0.885584 6.37616C1.562 4.73604 2.71018 3.3337 4.18456 2.34691C5.65894 1.36013 7.39312 0.833344 9.16725 0.833344C10.9414 0.833344 12.6756 1.36013 14.1499 2.34691C15.6243 3.3337 16.7725 4.73604 17.4489 6.37616C17.5184 6.56326 17.5184 6.76907 17.4489 6.95616C16.7725 8.59628 15.6243 9.99863 14.1499 10.9854C12.6756 11.9722 10.9414 12.499 9.16725 12.499C7.39312 12.499 5.65894 11.9722 4.18456 10.9854C2.71018 9.99863 1.562 8.59628 0.885584 6.95616Z" 
        stroke={visible ? "#8BA367" : "#99A1AF"} 
        strokeWidth="1.66667" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M9.16725 9.33333C10.548 9.33333 11.6672 8.21405 11.6672 6.83333C11.6672 5.45262 10.548 4.33333 9.16725 4.33333C7.78654 4.33333 6.66725 5.45262 6.66725 6.83333C6.66725 8.21405 7.78654 9.33333 9.16725 9.33333Z" 
        stroke={visible ? "#8BA367" : "#99A1AF"} 
        strokeWidth="1.66667" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Background Decor */}
      <View style={styles.backgroundElements}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            
            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <CoffeeIcon />
              </View>
              <Text style={styles.titleText}>Đăng Ký</Text>
              <Text style={styles.subtitleText}>Tạo tài khoản mới của bạn</Text>
            </View>

            {/* Register Card */}
            <View style={styles.card}>
              
              {/* Rounded White Input Area */}
              <View style={styles.inputContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#99A1AF"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#99A1AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <View style={[styles.input, styles.passwordContainer]}>
                    <TextInput
                      style={[{ flex: 1, height: '100%' }, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor="#99A1AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <EyeIcon visible={showPassword} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <View style={[styles.input, styles.passwordContainer]}>
                    <TextInput
                      style={[{ flex: 1, height: '100%' }, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor="#99A1AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Consent Text */}
              <View style={styles.consentContainer}>
                <Text style={styles.consentText}>
                  Tôi đồng ý với <Text 
                    style={styles.linkText}
                    onPress={() => {/* Open Terms */}}
                  >Điều khoản</Text> và <Text 
                    style={styles.linkText}
                    onPress={() => {/* Open Policy */}}
                  >Chính sách bảo mật</Text>
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                style={styles.registerBtn}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <Text style={styles.registerBtnText}>ĐĂNG KÝ</Text>
              </TouchableOpacity>

            </View>

            {/* Footer Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => onNavigate('Login')}>
                <Text style={styles.loginLinkText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Register;
