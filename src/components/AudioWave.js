import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Colors } from '../constants/colors';

const AudioWave = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: 0.3 }]} />
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }], opacity: 0.5, position: 'absolute' }]} />
      <View style={styles.coreCircle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 150,
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    position: 'absolute',
  },
  coreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
});

export default AudioWave;
