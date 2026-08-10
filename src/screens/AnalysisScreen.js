import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import api from '../services/api';
import mockPrediction from '../utils/mockPrediction';

const AnalysisScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { audioPath } = route.params || {};

  useEffect(() => {
    const analyze = async () => {
      // Simulate short processing delay
      await new Promise(res => setTimeout(res, 2000));
      // In future, replace with real API call:
      // const result = await api.analyzeAudio(audioPath);
      const result = await mockPrediction();
      navigation.replace('Result', { prediction: result });
    };
    analyze();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analyzing Respiratory Sound</Text>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>Processing your audio...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default AnalysisScreen;
