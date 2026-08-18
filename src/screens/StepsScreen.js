import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import ProgressBar from '../components/ProgressBar';
import { NativeModules, NativeEventEmitter } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { StepCounter } = NativeModules;

const StepsScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [steps, setSteps] = useState(0);
  const [goal, setGoal] = useState(8000);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadGoal();
    checkSupportAndPermission();
    return () => {
      if (StepCounter) StepCounter.stop();
    };
  }, []);

  const loadGoal = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.getWellnessGoals();
        if (res && res.daily_steps) setGoal(res.daily_steps);
      } catch (err) {}
    }
  };

  const checkSupportAndPermission = async () => {
    if (Platform.OS !== 'android') {
      setIsSupported(false);
      return;
    }
    
    if (StepCounter) {
      const supported = await StepCounter.isSupported();
      setIsSupported(supported);
      if (supported) {
        requestPermission();
      }
    } else {
      setIsSupported(false);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: "Step Tracking Permission",
          message: "LungSenseAI needs access to your activity to track your steps.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionGranted(true);
        startTracking();
      } else {
        setPermissionGranted(false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const startTracking = () => {
    if (StepCounter) {
      StepCounter.start();
      const eventEmitter = new NativeEventEmitter(StepCounter);
      eventEmitter.addListener('StepCounterUpdate', (event) => {
        setSteps(event.steps);
      });
    }
  };

  const changeGoal = (newGoal) => {
    setGoal(newGoal);
    if (isAuthenticated) {
      api.updateWellnessGoals({ daily_steps: newGoal, daily_water_ml: 2500 }).catch(() => {});
    } else {
      Alert.alert('Guest Mode', 'Create an account to save your personal activity goal.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step Tracking</Text>
      </View>
      <View style={styles.container}>
        
        {!isSupported ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Step tracking is not available on this device.</Text>
          </View>
        ) : !permissionGranted ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Activity recognition permission is required to track steps.</Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.progressContainer}>
              <Text style={styles.stepsValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.stepsLabel}>/ {goal.toLocaleString()} steps today</Text>
              <View style={{ marginTop: 24, width: '100%' }}>
                <ProgressBar progress={Math.min(steps / goal, 1)} color={Colors.accent} />
              </View>
              <Text style={styles.progressPercent}>{Math.round(Math.min(steps / goal, 1) * 100)}% of daily goal</Text>
            </View>

            <Text style={styles.sectionTitle}>Personal Activity Goal</Text>
            <View style={styles.goalGrid}>
              {[4000, 6000, 8000, 10000].map(val => (
                <TouchableOpacity 
                  key={val} 
                  style={[styles.goalButton, goal === val && styles.goalButtonActive]} 
                  onPress={() => changeGoal(val)}>
                  <Text style={[styles.goalButtonText, goal === val && styles.goalButtonTextActive]}>{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.disclaimer}>
              We do not claim that a specific step count is medically optimal for everyone. This is a personal activity goal.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.cardBackground, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { marginRight: 16 },
  backText: { color: Colors.primary, fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  container: { padding: 16, flex: 1 },
  progressContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 32, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: Colors.border },
  stepsValue: { fontSize: 48, fontWeight: 'bold', color: Colors.accent },
  stepsLabel: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },
  goalGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  goalButton: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  goalButtonActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  goalButtonText: { color: Colors.textPrimary, fontWeight: '500' },
  goalButtonTextActive: { color: '#fff' },
  disclaimer: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default StepsScreen;
