import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Start from './src/screens/Start';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import VerifyOTP from './src/screens/Register/VerifyOTP';
import Home from './src/screens/Home';
import ActiveOrders from './src/screens/ActiveOrders';
import OrderDetails from './src/screens/OrderDetails';
import Payment from './src/screens/Payment';
import PaymentSuccess from './src/screens/PaymentSuccess';
import Report from './src/screens/Report';

import { StatusBar, View, ActivityIndicator } from 'react-native';
import safeAsyncStorage from './src/utils/storage';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Start');

  useEffect(() => {
    checkLoginSession();
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
