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

const Tab = createBottomTabNavigator();
const LungStack = createNativeStackNavigator();

const LungStackNavigator = () => (
  <LungStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <LungStack.Screen name="LungDashboard" component={LungDashboardScreen} />
    <LungStack.Screen name="Recording" component={RecordingScreen} />
    <LungStack.Screen name="Analysis" component={AnalysisScreen} />
    <LungStack.Screen name="Result" component={ResultScreen} />
    <LungStack.Screen name="History" component={HistoryScreen} />
  </LungStack.Navigator>
);

const AppNavigator = () => {
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
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
