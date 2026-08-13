import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ResultCard from '../components/ResultCard';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { savePendingExamination } from '../services/storageService';

const ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { prediction, duration } = route.params || {};
  const { isAuthenticated } = useAuth();

  const handleRecordAgain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LungDashboard' }, { name: 'Recording' }],
    });
  };

  const handleBackHome = () => {
    navigation.navigate('LungDashboard');
  };

  const handleSaveExamination = async () => {
    if (!isAuthenticated) {
      // Save pending examination for after login
      await savePendingExamination({
        predicted_class: prediction?.label,
        confidence: prediction?.confidence,
        message: prediction?.message,
        duration_seconds: duration || 0,
        model_version: 'mock-v1',
      });
      navigation.navigate('Login');
      return;
    }

    try {
      await api.saveExamination({
        predicted_class: prediction?.label || 'Unknown',
        confidence: prediction?.confidence || 0,
        message: prediction?.message || '',
        duration_seconds: duration || 0,
        model_version: 'mock-v1',
      });
    } catch (err) {
      console.warn('Could not save examination:', err);
    }
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

        {!isAuthenticated && (
          <View style={styles.unlockCard}>
            <Icon name="lock-open-variant" size={28} color={Colors.primary} />
            <Text style={styles.unlockTitle}>Unlock Your Complete Health Report</Text>
            <Text style={styles.unlockSubtitle}>Create an account to access:</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>✓ Detailed analysis reports</Text>
              <Text style={styles.featureItem}>✓ Examination history</Text>
              <Text style={styles.featureItem}>✓ Personalized wellness routine</Text>
              <Text style={styles.featureItem}>✓ PDF reports</Text>
              <Text style={styles.featureItem}>✓ Health tracking</Text>
            </View>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {isAuthenticated && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveExamination}>
              <Icon name="content-save" size={24} color="#fff" style={styles.btnIcon} />
              <Text style={styles.saveButtonText}>Save Examination</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={handleRecordAgain}>
            <Icon name="microphone-plus" size={24} color={Colors.background} style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Record Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackHome}>
            <Icon name="home" size={24} color={Colors.textPrimary} style={styles.btnIcon} />
            <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
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
  unlockCard: {
    width: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  unlockTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 10,
    textAlign: 'center',
  },
  unlockSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  featureList: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginLeft: 10,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  authButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  loginButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  registerButton: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 24,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
    color: '#fff',
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
    borderColor: Colors.border,
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
