import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ResultCard from '../components/ResultCard';
import { Colors } from '../constants/colors';

const ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { prediction } = route.params || {};

  const handleRecordAgain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }, { name: 'Recording' }],
    });
  };

  const handleBackHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analysis Report</Text>
        </View>

        <ResultCard
          label={prediction?.label ?? 'Unknown'}
          confidence={prediction?.confidence ?? 0}
          message={prediction?.message ?? 'No result'}
        />

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRecordAgain}>
            <Icon name="microphone-plus" size={24} color={Colors.background} style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Record Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackHome}>
            <Icon name="home" size={24} color={Colors.textPrimary} style={styles.btnIcon} />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Icon name="alert-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.disclaimer}>
            Research/educational prototype only. Do not use for medical diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  btnIcon: {
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.warning,
    marginLeft: 6,
  },
});

export default ResultScreen;
