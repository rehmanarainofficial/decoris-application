import React, { useState, useRef, useEffect } from 'react';
import { Animated, StyleSheet, BackHandler } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeStorage } from './src/utils/storage';
import { store } from './src/store';
import { useAppDispatch, useAppSelector } from './src/hooks';
import { loginSuccess } from './src/store/slices/userSlice';
import {
  SplashScreen,
  DashboardScreen,
  LoginScreen,
  NewBookingScreen,
  EventCalendarScreen,
  DailyExpenseScreen,
  SalesPaymentsScreen,
  InventoryMovementScreen,
  EventCostingScreen,
  LedgerScreen,
} from './src/screens';

import { EventQuotationHeaderItem } from './src/api/bookingApi';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  activeKey: string;
}

const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  activeKey,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0.7);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [activeKey, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

function MainAppNavigator(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<string>('DASHBOARD');
  const [calendarFilter, setCalendarFilter] = useState<'ALL' | '1' | '2'>('ALL');
  const [editingEventData, setEditingEventData] = useState<EventQuotationHeaderItem | null>(null);
  const [costingEventData, setCostingEventData] = useState<EventQuotationHeaderItem | any | null>(null);
  const [savedEventData, setSavedEventData] = useState<any>(null);

  // Android Hardware / Gesture Back Button Handling
  useEffect(() => {
    const onBackPress = () => {
      if (!isAuthenticated || isSplashActive) {
        return false;
      }

      if (currentScreen === 'EVENT_COSTING') {
        if (costingEventData) {
          setCostingEventData(null);
          setCurrentScreen('EVENT_CALENDAR');
        } else {
          setCurrentScreen('DASHBOARD');
        }
        return true;
      }

      if (currentScreen === 'NEW_BOOKING') {
        setEditingEventData(null);
        setCurrentScreen(editingEventData ? 'EVENT_CALENDAR' : 'DASHBOARD');
        return true;
      }

      if (currentScreen !== 'DASHBOARD') {
        setEditingEventData(null);
        setCostingEventData(null);
        setCurrentScreen('DASHBOARD');
        return true;
      }

      // On DASHBOARD: Allow default behavior (exit app)
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [isAuthenticated, isSplashActive, currentScreen, costingEventData, editingEventData]);

  // Restore saved login session on app launch safely
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUserProfile = await SafeStorage.getItem('@auth_user_profile');
        if (savedUserProfile) {
          const parsedUser = JSON.parse(savedUserProfile);
          if (parsedUser) {
            dispatch(loginSuccess(parsedUser));
          }
        }
      } catch (err) {
        console.log('Error restoring auth session:', err);
      }
    };
    restoreSession();
  }, [dispatch]);

  if (isSplashActive) {
    return <SplashScreen onFinish={() => setIsSplashActive(false)} />;
  }

  const handleNavigate = (screenTitle: string) => {
    if (screenTitle === 'Plus Booking' || screenTitle === 'New Booking') {
      setEditingEventData(null);
      setCurrentScreen('NEW_BOOKING');
    } else if (screenTitle === 'Tentative' || screenTitle === 'Tentative Orders') {
      setCalendarFilter('1');
      setCurrentScreen('EVENT_CALENDAR');
    } else if (screenTitle === 'Confirmed' || screenTitle === 'Confirmed Orders') {
      setCalendarFilter('2');
      setCurrentScreen('EVENT_CALENDAR');
    } else if (screenTitle === 'Event Calendar') {
      setCalendarFilter('ALL');
      setCurrentScreen('EVENT_CALENDAR');
    } else if (
      screenTitle === 'Daily Expenses' ||
      screenTitle === 'Daily Expense' ||
      screenTitle === 'Daily Cash Transaction'
    ) {
      setCurrentScreen('DAILY_EXPENSE');
    } else if (screenTitle === 'Sales & Payments') {
      setCurrentScreen('SALES_PAYMENTS');
    } else if (
      screenTitle === 'Ledger' ||
      screenTitle === 'General Ledger' ||
      screenTitle === 'Inventory Movement'
    ) {
      setCurrentScreen('LEDGER');
    } else if (screenTitle === 'Event Costing') {
      setCostingEventData(null);
      setCurrentScreen('EVENT_COSTING');
    } else {
      setCurrentScreen('DASHBOARD');
    }
  };

  const handleSaveSuccess = (eventData: any) => {
    setSavedEventData(eventData);
    setEditingEventData(null);
    setCurrentScreen('EVENT_CALENDAR');
  };

  if (!isAuthenticated) {
    return (
      <AnimatedScreenWrapper activeKey="LOGIN">
        <LoginScreen />
      </AnimatedScreenWrapper>
    );
  }

  let activeView = <DashboardScreen onNavigate={handleNavigate} />;

  if (currentScreen === 'NEW_BOOKING') {
    activeView = (
      <NewBookingScreen
        editEventData={editingEventData}
        onBack={() => {
          setEditingEventData(null);
          setCurrentScreen('DASHBOARD');
        }}
        onHome={() => {
          setEditingEventData(null);
          setCurrentScreen('DASHBOARD');
        }}
        onSaveSuccess={handleSaveSuccess}
      />
    );
  } else if (currentScreen === 'EVENT_CALENDAR') {
    activeView = (
      <EventCalendarScreen
        eventData={savedEventData}
        filterStatus={calendarFilter}
        onBack={() => setCurrentScreen('DASHBOARD')}
        onHome={() => setCurrentScreen('DASHBOARD')}
        onEditEvent={(event) => {
          setEditingEventData(event);
          setCurrentScreen('NEW_BOOKING');
        }}
        onNavigateToCosting={(event) => {
          setCostingEventData(event);
          setCurrentScreen('EVENT_COSTING');
        }}
      />
    );
  } else if (currentScreen === 'DAILY_EXPENSE') {
    activeView = (
      <DailyExpenseScreen
        onBack={() => setCurrentScreen('DASHBOARD')}
        onHome={() => setCurrentScreen('DASHBOARD')}
      />
    );
  } else if (currentScreen === 'SALES_PAYMENTS') {
    activeView = (
      <SalesPaymentsScreen
        onBack={() => setCurrentScreen('DASHBOARD')}
        onHome={() => setCurrentScreen('DASHBOARD')}
      />
    );
  } else if (currentScreen === 'LEDGER' || currentScreen === 'INVENTORY_MOVEMENT') {
    activeView = (
      <LedgerScreen
        onBack={() => setCurrentScreen('DASHBOARD')}
        onHome={() => setCurrentScreen('DASHBOARD')}
      />
    );
  } else if (currentScreen === 'EVENT_COSTING') {
    activeView = (
      <EventCostingScreen
        eventData={costingEventData}
        onBack={() => {
          if (costingEventData) {
            setCurrentScreen('EVENT_CALENDAR');
          } else {
            setCurrentScreen('DASHBOARD');
          }
        }}
        onHome={() => setCurrentScreen('DASHBOARD')}
      />
    );
  }

  return (
    <AnimatedScreenWrapper activeKey={currentScreen}>
      {activeView}
    </AnimatedScreenWrapper>
  );
}

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MainAppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },
});

export default App;
