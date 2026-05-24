import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Start from './src/screens/Start';
import Login from './src/screens/Login';
import ForgotPassword from './src/screens/Login/ForgotPassword';
import Register from './src/screens/Register';
import VerifyOTP from './src/screens/Register/VerifyOTP';
import Home from './src/screens/Home';
import ActiveOrders from './src/screens/ActiveOrders';
import OrderDetails from './src/screens/OrderDetails';
import Payment from './src/screens/Payment';
import PaymentSuccess from './src/screens/PaymentSuccess';
import Report from './src/screens/Report';

import { StatusBar, View, ActivityIndicator, LogBox, DeviceEventEmitter } from 'react-native';
import safeAsyncStorage from './src/utils/storage';
import messaging from '@react-native-firebase/messaging';

// Ẩn toàn bộ cảnh báo LogBox (khung đen dưới màn hình) trên toàn app
LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Start');

  useEffect(() => {
    checkLoginSession();

    // Setup Firebase Cloud Messaging
    const setupFCM = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await messaging().subscribeToTopic('THU_NGAN');
          console.log('Subscribed to THU_NGAN topic!');
        }
      } catch (error) {
        console.log('FCM Setup error:', error);
      }
    };
    setupFCM();

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      DeviceEventEmitter.emit('FCM_MESSAGE', remoteMessage);
    });

    return unsubscribe;
  }, []);

  const checkLoginSession = async () => {
    try {
      const token = await safeAsyncStorage.getItem('token');
      if (token) {
        setInitialRoute('Home');
      } else {
        setInitialRoute('Start');
      }
    } catch (e) {
      setInitialRoute('Start');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#34A853" />
      </View>
    );
  }

  const renderScreen = (Component, extraProps = {}) => {
    return ({ navigation, route }) => (
      <Component 
        {...extraProps}
        params={route.params}
        onNavigate={(screen, params) => {
          if (params?.goBack) {
            navigation.goBack();
          } else if (params?.reset) {
            navigation.reset({
              index: 0,
              routes: [{ name: screen, params: params?.params || {} }],
            });
          } else {
            navigation.navigate(screen, params);
          }
        }}
      />
    );
  };

  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Start" component={renderScreen(Start)} />
        <Stack.Screen name="Login" component={renderScreen(Login)} />
        <Stack.Screen name="ForgotPassword" component={renderScreen(ForgotPassword)} />
        <Stack.Screen name="Register" component={renderScreen(Register)} />
        <Stack.Screen name="VerifyOTP" component={renderScreen(VerifyOTP)} />
        <Stack.Screen name="Home" component={renderScreen(Home)} />
        <Stack.Screen name="ActiveOrders" component={renderScreen(ActiveOrders)} />
        <Stack.Screen name="OrderDetails" component={renderScreen(OrderDetails)} />
        <Stack.Screen name="Payment" component={renderScreen(Payment)} />
        <Stack.Screen name="PaymentSuccess" component={renderScreen(PaymentSuccess)} />
        <Stack.Screen name="Report" component={renderScreen(Report)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
