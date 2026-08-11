import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';

const ResultCard = ({ label, confidence, message }) => {
  const isNormal = label.toLowerCase().includes('normal') || label.toLowerCase().includes('healthy');
  const statusColor = isNormal ? Colors.success : Colors.warning;
  const iconName = isNormal ? 'check-circle' : 'alert-circle';

  return (
    <View style={[styles.card, { borderColor: statusColor }]}>
      <View style={styles.header}>
        <Icon name={iconName} size={32} color={statusColor} />
        <Text style={styles.title}>Analysis Complete</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.resultRow}>
        <Text style={styles.labelTitle}>Detected Pattern:</Text>
        <Text style={[styles.label, { color: statusColor }]}>{label}</Text>
      </View>
      
      <View style={styles.resultRow}>
        <Text style={styles.labelTitle}>Confidence Score:</Text>
        <Text style={styles.confidence}>{Math.round(confidence * 100)}%</Text>
      </View>
      
      <View style={styles.messageBox}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
    width: '100%',
    borderTopWidth: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labelTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
  },
  confidence: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  messageBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  message: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    opacity: 0.9,
  },
});

export default ResultCard;
