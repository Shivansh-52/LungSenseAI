import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const Wave = new Animated.Value(0);

const AudioWave = () => {
  Animated.loop(
    Animated.timing(Wave, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    })
  ).start();

  const translateY = Wave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -10, 0],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { transform: [{ translateY }] }]} />
      <Animated.View style={[styles.bar, { transform: [{ translateY: translateY }], opacity: 0.8 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  bar: {
    width: 8,
    height: 40,
    backgroundColor: Colors.accent,
    marginHorizontal: 4,
    borderRadius: 4,
  },
});

export default AudioWave;
