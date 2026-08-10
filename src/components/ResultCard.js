import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const ResultCard = ({ label, confidence, message }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Analysis Result</Text>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.confidence}>Confidence: {Math.round(confidence * 100)}%</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  confidence: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default ResultCard;
