import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

// Lung Stack Screens
import LungDashboardScreen from '../screens/LungDashboardScreen';
import RecordingScreen from '../screens/RecordingScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ExaminationDetailScreen from '../screens/ExaminationDetailScreen';

// Dashboards
import HomeDashboardScreen from '../screens/HomeDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Health Screens
import BMIScreen from '../screens/BMIScreen';
import StepsScreen from '../screens/StepsScreen';
import HydrationScreen from '../screens/HydrationScreen';
import SleepScreen from '../screens/SleepScreen';
import ActivityScreen from '../screens/ActivityScreen';
import RoutineScreen from '../screens/RoutineScreen';

const Tab = createBottomTabNavigator();
const LungStack = createNativeStackNavigator();
const HealthStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const LungStackNavigator = () => (
  <LungStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <LungStack.Screen name="LungDashboard" component={LungDashboardScreen} />
    <LungStack.Screen name="Recording" component={RecordingScreen} />
    <LungStack.Screen name="Analysis" component={AnalysisScreen} />
    <LungStack.Screen name="Result" component={ResultScreen} />
    <LungStack.Screen name="History" component={HistoryScreen} />
    <LungStack.Screen name="ExaminationDetail" component={ExaminationDetailScreen} />
  </LungStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
  </ProfileStack.Navigator>
);

const HealthStackNavigator = () => (
  <HealthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <HealthStack.Screen name="HomeMain" component={HomeDashboardScreen} />
    <HealthStack.Screen name="BMI" component={BMIScreen} />
    <HealthStack.Screen name="Steps" component={StepsScreen} />
    <HealthStack.Screen name="Hydration" component={HydrationScreen} />
    <HealthStack.Screen name="Sleep" component={SleepScreen} />
    <HealthStack.Screen name="Activity" component={ActivityScreen} />
    <HealthStack.Screen name="Routine" component={RoutineScreen} />
  </HealthStack.Navigator>
);

const TabNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LungTab') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HealthStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="LungTab" component={LungStackNavigator} options={{ title: 'Examination' }} />
      {isAuthenticated && (
        <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
      <RootStack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_bottom' }} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
