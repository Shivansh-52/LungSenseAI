import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';

// Lung Stack Screens (Existing)
import LungDashboardScreen from '../screens/LungDashboardScreen';
import RecordingScreen from '../screens/RecordingScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';

// New Dashboards (To be created)
import HomeDashboardScreen from '../screens/HomeDashboardScreen';
import HealthDashboardScreen from '../screens/HealthDashboardScreen';
import DoctorsScreen from '../screens/DoctorsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Feature Screens
import WellnessScreen from '../screens/WellnessScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MedicineRemindersScreen from '../screens/MedicineRemindersScreen';
import ExaminationDetailScreen from '../screens/ExaminationDetailScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Tab = createBottomTabNavigator();
const LungStack = createNativeStackNavigator();
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
    <ProfileStack.Screen name="Wellness" component={WellnessScreen} />
    <ProfileStack.Screen name="Reports" component={ReportsScreen} />
    <ProfileStack.Screen name="MedicineReminders" component={MedicineRemindersScreen} />
    <ProfileStack.Screen name="Privacy" component={PrivacyScreen} />
  </ProfileStack.Navigator>
);

const TabNavigator = () => {
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
          } else if (route.name === 'HealthTab') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'DoctorsTab') {
            iconName = focused ? 'people' : 'people-outline';
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
      <Tab.Screen name="HomeTab" component={HomeDashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="LungTab" component={LungStackNavigator} options={{ title: 'Lung' }} />
      <Tab.Screen name="HealthTab" component={HealthDashboardScreen} options={{ title: 'Health' }} />
      <Tab.Screen name="DoctorsTab" component={DoctorsScreen} options={{ title: 'Doctors' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_bottom' }} />
      <RootStack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_bottom' }} />
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'slide_from_right' }} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
