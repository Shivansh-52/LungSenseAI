import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SleepScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [durationStr, setDurationStr] = useState('0h 0m');
  const [sleepEntries, setSleepEntries] = useState([]);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getWellnessToday(today);
      if (data && data.total_sleep_minutes) {
        const h = Math.floor(data.total_sleep_minutes / 60);
        const m = data.total_sleep_minutes % 60;
        setDurationStr(`${h}h ${m}m`);
      }
    } catch (err) {}
  };

  const calculateAndSave = async () => {
    // Simple HH:MM calculation for same day or cross-midnight
    const [sH, sM] = sleepTime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    if (isNaN(sH) || isNaN(wH)) {
      Alert.alert('Invalid', 'Please use HH:MM format');
      return;
    }

    let sleepMins = sH * 60 + sM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins < sleepMins) {
      wakeMins += 24 * 60; // Next day
    }
    
    const diff = wakeMins - sleepMins;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    setDurationStr(`${h}h ${m}m`);

    if (isAuthenticated) {
      try {
        const today = new Date().toISOString().split('T')[0];
        // Create dummy ISO strings based on today for API requirements
        const sleepIso = `${today}T${sleepTime.padStart(5, '0')}:00Z`;
        const wakeIso = `${today}T${wakeTime.padStart(5, '0')}:00Z`;
        
        await api.addSleepEntry({
          sleep_time: sleepIso,
          wake_time: wakeIso,
          date: today
        });
        Alert.alert('Saved', 'Sleep data logged successfully');
      } catch (err) {
        Alert.alert('Error', 'Could not save sleep data.');
      }
    } else {
      Alert.alert('Guest Mode', 'Create an account to save your sleep logs.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep Tracking</Text>
      </View>
      <ScrollView style={styles.container}>
        
        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>Today's Sleep Duration</Text>
          <Text style={styles.durationValue}>{durationStr}</Text>
        </View>

        <Text style={styles.disclaimer}>
          Consistent sleep schedules can support overall wellbeing. We do not claim that a specific duration guarantees health.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Log Sleep (HH:MM)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sleep Time</Text>
            <TextInput
              style={styles.input}
              value={sleepTime}
              onChangeText={setSleepTime}
              placeholder="e.g. 23:00"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wake Time</Text>
            <TextInput
              style={styles.input}
              value={wakeTime}
              onChangeText={setWakeTime}
              placeholder="e.g. 07:00"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={calculateAndSave}>
            <Text style={styles.buttonText}>Save Log</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.cardBackground, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backButton: { marginRight: 16 },
  backText: { color: Colors.primary, fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary },
  container: { padding: 16 },
  durationCard: { alignItems: 'center', backgroundColor: '#fff', padding: 32, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  durationLabel: { fontSize: 16, color: Colors.textSecondary, marginBottom: 8 },
  durationValue: { fontSize: 48, fontWeight: 'bold', color: Colors.primary },
  disclaimer: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.textPrimary },
  button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SleepScreen;
