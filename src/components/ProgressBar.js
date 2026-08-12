import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/colors';

const ProgressBar = ({ progress, color = Colors.primary, height = 8 }) => {
  // progress should be 0 to 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.fill, 
          { width: `${clampedProgress * 100}%`, backgroundColor: color }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  }
});

export default ProgressBar;
