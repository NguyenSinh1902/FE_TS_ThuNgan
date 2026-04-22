import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Start from './src/screens/Start';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import ActiveOrders from './src/screens/ActiveOrders';
import OrderDetails from './src/screens/OrderDetails';
import Payment from './src/screens/Payment';
import PaymentSuccess from './src/screens/PaymentSuccess';
import Report from './src/screens/Report';

import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Start">
          {({ navigation }) => <Start onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {({ navigation }) => <Login onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {({ navigation }) => <Register onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {({ navigation }) => <Home onNavigate={(screen, params) => navigation.navigate(screen, params)} />}
        </Stack.Screen>

        <Stack.Screen name="ActiveOrders">
          {({ navigation, route }) => <ActiveOrders onNavigate={(screen, params) => navigation.navigate(screen, params)} params={route.params} />}
        </Stack.Screen>

        <Stack.Screen name="OrderDetails">
          {({ navigation, route }) => <OrderDetails onNavigate={(screen, params) => navigation.navigate(screen, params)} params={route.params} />}
        </Stack.Screen>

        <Stack.Screen name="Payment">
          {({ navigation, route }) => <Payment onNavigate={(screen, params) => navigation.navigate(screen, params)} params={route.params} />}
        </Stack.Screen>

        <Stack.Screen name="PaymentSuccess">
          {({ navigation, route }) => <PaymentSuccess onNavigate={(screen, params) => navigation.navigate(screen, params)} params={route.params} />}
        </Stack.Screen>

        <Stack.Screen name="Report">
          {({ navigation, route }) => <Report onNavigate={(screen, params) => navigation.navigate(screen, params)} params={route.params} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
