import React, { useState } from 'react';
import Start from './src/screens/Start';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import ActiveOrders from './src/screens/ActiveOrders';
import OrderDetails from './src/screens/OrderDetails';
import Payment from './src/screens/Payment';
import PaymentSuccess from './src/screens/PaymentSuccess';
import Report from './src/screens/Report';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Start');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screen, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  // Centralized navigation logic similar to MatchTeaWaiter
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Start':
        return <Start onNavigate={navigate} />;
      case 'Login':
        return <Login onNavigate={navigate} />;
      case 'Register':
        return <Register onNavigate={navigate} />;
      case 'Home':
        return <Home onNavigate={navigate} />;
      case 'ActiveOrders':
        return <ActiveOrders onNavigate={navigate} params={screenParams} />;
      case 'OrderDetails':
        return <OrderDetails onNavigate={navigate} params={screenParams} />;
      case 'Payment':
        return <Payment onNavigate={navigate} params={screenParams} />;
      case 'PaymentSuccess':
        return <PaymentSuccess onNavigate={navigate} params={screenParams} />;
      case 'Report':
        return <Report onNavigate={navigate} params={screenParams} />;
      default:
        return <Start onNavigate={navigate} />;
    }
  };

  return renderScreen();
};

export default App;
