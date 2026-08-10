import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate('Recording');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LungSense AI</Text>
      <Text style={styles.subtitle}>AI-powered respiratory sound analysis</Text>
        <Icon name="microphone" size={120} color={Colors.primary} />
      <Text style={styles.description}>
        Record a short breathing sound to analyze respiratory sound patterns.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>
        This application is for research and educational purposes only. It is not a medical
        diagnosis tool.
      </Text>
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
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default HomeScreen;
