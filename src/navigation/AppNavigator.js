import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Recording" component={RecordingScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
  );
};

export default AppNavigator;
