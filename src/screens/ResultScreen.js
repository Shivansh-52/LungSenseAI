import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { soundResult, diseaseResult, error } = route.params || {};
  const { isAuthenticated } = useAuth();
  
  const [saveStatus, setSaveStatus] = useState('');

  const soundPrediction = soundResult?.prediction;
  const probabilities = soundResult?.probabilities;

  useEffect(() => {
    // Automatically save if authenticated and successful
    const saveExam = async () => {
      if (isAuthenticated && soundResult?.success) {
        try {
          const payload = {
            sound_prediction: soundResult,
          };
          if (diseaseResult && diseaseResult.status === 'success') {
            payload.disease_prediction = diseaseResult;
          }
          await api.saveExamination(payload);
          setSaveStatus('Examination saved to history.');
        } catch (err) {
          console.warn('Could not save examination:', err);
          setSaveStatus('Failed to save to history.');
        }
      }
    };
    saveExam();
  }, [isAuthenticated, soundResult, diseaseResult]);

  const handleRecordAgain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const isNormal = soundPrediction?.class_name?.toLowerCase().includes('normal');
  const statusColor = isNormal ? Colors.success : Colors.warning;

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Icon name="alert-circle" size={60} color={Colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRecordAgain}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Examination Results</Text>
        </View>

        {/* SOUND RESULT CARD */}
        <View style={[styles.card, { borderColor: statusColor, marginBottom: 16 }]}>
          <View style={styles.cardHeader}>
            <Icon name="stethoscope" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>RESPIRATORY SOUND ANALYSIS</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.labelTitle}>Detected pattern:</Text>
            <Text style={[styles.label, { color: statusColor }]}>{soundPrediction?.class_name || 'Unknown'}</Text>
          </View>

          {isAuthenticated ? (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.labelTitle}>Confidence:</Text>
                <Text style={styles.confidence}>{Math.round((soundPrediction?.confidence || 0) * 100)}%</Text>
              </View>

              <View style={styles.divider} />
              <Text style={styles.probTitle}>Probability distribution:</Text>
              {probabilities && Object.entries(probabilities).map(([className, prob]) => (
                <View key={className} style={styles.probRow}>
                  <Text style={styles.probLabel}>{className}</Text>
                  <View style={styles.probBarContainer}>
                    <View style={[styles.probBar, { width: `${prob * 100}%`, backgroundColor: className === soundPrediction?.class_name ? statusColor : Colors.border }]} />
                  </View>
                  <Text style={styles.probValue}>{Math.round(prob * 100)}%</Text>
                </View>
              ))}
            </>
          ) : null}
          <Text style={styles.modelInfo}>Model: {soundResult?.model?.name || 'CNN + BiLSTM'}</Text>
        </View>

        {/* DISEASE RESULT CARD */}
        <View style={[styles.card, { borderColor: Colors.accent }]}>
          <View style={styles.cardHeader}>
            <Icon name="lungs" size={24} color={Colors.accent} />
            <Text style={styles.cardTitle}>DISEASE PATTERN ANALYSIS</Text>
          </View>

          {diseaseResult?.status === 'success' ? (
            <>
              <View style={[styles.resultRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={[styles.labelTitle, { marginBottom: 8 }]}>Result:</Text>
                <Text style={[styles.label, { color: Colors.textPrimary, fontSize: 18 }]}>
                  {diseaseResult.prediction}
                </Text>
              </View>
              
              {isAuthenticated ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.resultRow}>
                    <Text style={styles.labelTitle}>COPD-associated probability:</Text>
                    <Text style={styles.confidence}>{Math.round((diseaseResult.copd_probability || 0) * 100)}%</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.labelTitle}>Threshold:</Text>
                    <Text style={[styles.confidence, { color: Colors.textSecondary }]}>{Math.round((diseaseResult.threshold || 0) * 100)}%</Text>
                  </View>
                  <Text style={styles.modelInfo}>Model Version: {diseaseResult.model_version}</Text>
                </>
              ) : null}
            </>
          ) : (
            <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginTop: 8 }}>
              Disease analysis is unavailable. {diseaseResult?.message || ''}
            </Text>
          )}
        </View>

        {saveStatus ? <Text style={styles.saveStatus}>{saveStatus}</Text> : null}

        <View style={styles.buttonsContainer}>
          {!isAuthenticated && (
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Login to view full report & save history</Text>
            </TouchableOpacity>
          )}

          {isAuthenticated && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('LungTab', { screen: 'History' })}>
              <Text style={styles.primaryButtonText}>View History</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={handleRecordAgain}>
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            This AI-generated result is a research prediction based on respiratory audio. It is not a medical diagnosis and has not been clinically validated. Please consult a qualified healthcare professional for diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scrollContent: { padding: 24, alignItems: 'center', flexGrow: 1 },
  header: { marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  errorText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginTop: 16, marginBottom: 24 },
  card: {
    backgroundColor: Colors.cardBackground, borderRadius: 20, padding: 24,
    width: '100%', borderTopWidth: 4, elevation: 6, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginLeft: 8, letterSpacing: 0.5 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  labelTitle: { fontSize: 16, color: Colors.textSecondary, fontWeight: '500' },
  label: { fontSize: 20, fontWeight: '800' },
  confidence: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  probTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  probRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  probLabel: { width: 80, fontSize: 12, color: Colors.textSecondary },
  probBarContainer: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  probBar: { height: '100%', borderRadius: 4 },
  probValue: { width: 35, fontSize: 12, color: Colors.textPrimary, textAlign: 'right' },
  modelInfo: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center', marginTop: 8 },
  buttonsContainer: { width: '100%', marginTop: 32 },
  primaryButton: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryButton: { backgroundColor: Colors.cardBackground, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  secondaryButtonText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 16 },
  loginButton: { backgroundColor: Colors.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  loginButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footer: { marginTop: 'auto', paddingTop: 30 },
  disclaimer: { fontSize: 12, color: Colors.warning, textAlign: 'center', lineHeight: 18 },
  saveStatus: { marginTop: 16, fontSize: 14, color: Colors.success, fontWeight: '500' },
});

export default ResultScreen;
