import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ResultCard from '../components/ResultCard';
import { Colors } from '../constants/colors';

const ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { prediction } = route.params || {};

  const handleRecordAgain = () => {
    navigation.navigate('Recording');
  };

  const handleBackHome = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ResultCard
        label={prediction?.label ?? 'Unknown'}
        confidence={prediction?.confidence ?? 0}
        message={prediction?.message ?? 'No result'}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRecordAgain}>
          <Text style={styles.buttonText}>Record Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBackHome}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.disclaimer}>
        Research/educational prototype. This does not provide a medical diagnosis.
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
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ResultScreen;
