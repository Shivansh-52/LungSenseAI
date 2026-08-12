import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { getWellnessCategory } from '../utils/healthCalculations';

const WellnessScore = ({ score }) => {
  // Simple circular representation using borders
  const category = getWellnessCategory(score);
  
  let scoreColor = Colors.success;
  if (score < 80) scoreColor = Colors.primary;
  if (score < 60) scoreColor = '#FAAD14'; // Warning orange
  if (score < 40) scoreColor = Colors.warning;

  return (
    <View style={styles.container}>
      <View style={[styles.circleOuter, { borderColor: scoreColor }]}>
        <View style={styles.circleInner}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.maxScoreText}>/100</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Wellness Score</Text>
        <Text style={[styles.category, { color: scoreColor }]}>{category}</Text>
        <Text style={styles.disclaimer}>*This is a general tracking score, not a medical assessment.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  circleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  maxScoreText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  textContainer: {
    marginLeft: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  }
});

export default WellnessScore;
