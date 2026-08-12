import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';
import api from '../services/api';
import mockPrediction from '../utils/mockPrediction';

const AnalysisScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { audioPath } = route.params || {};
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const [loadingText, setLoadingText] = useState('Extracting audio features...');

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    const analyze = async () => {
      setTimeout(() => setLoadingText('Running AI model...'), 1500);
      setTimeout(() => setLoadingText('Finalizing results...'), 3000);
      
      await new Promise(res => setTimeout(res, 4000));
      
      const result = await mockPrediction();
      
      // Save to backend history
      try {
        await api.saveHistory(result);
      } catch(e) {
        console.warn('Could not save history to cloud', e);
      }

      navigation.replace('Result', { prediction: result });
    };
    analyze();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spinnerContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="loading" size={60} color={Colors.primary} />
          </Animated.View>
          <Icon name="brain" size={24} color={Colors.textPrimary} style={styles.centerIcon} />
        </View>
        <Text style={styles.title}>Analyzing Respiratory Sound</Text>
        <Text style={styles.message}>{loadingText}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  centerIcon: {
    position: 'absolute',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default AnalysisScreen;
