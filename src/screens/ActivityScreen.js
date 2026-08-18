import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const ActivityScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [duration, setDuration] = useState('');
  const [activityType, setActivityType] = useState('Walking');
  const [notes, setNotes] = useState('');
  const [todayActivity, setTodayActivity] = useState(0);

  const activities = ['Walking', 'Running', 'Cycling', 'Gym', 'Yoga', 'Other'];

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getWellnessToday(today);
      if (data && data.total_activity_minutes) {
        setTodayActivity(data.total_activity_minutes);
      }
    } catch (err) {}
  };

  const saveActivity = async () => {
    const mins = parseInt(duration);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert('Invalid', 'Please enter a valid duration in minutes.');
      return;
    }

    if (isAuthenticated) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await api.addActivityEntry({
          activity_type: activityType,
          duration_minutes: mins,
          notes: notes,
          date: today
        });
        setTodayActivity(prev => prev + mins);
        setDuration('');
        setNotes('');
        Alert.alert('Saved', 'Activity logged successfully');
      } catch (err) {
        Alert.alert('Error', 'Could not save activity data.');
      }
    } else {
      setTodayActivity(prev => prev + mins); // temporary for guest
      Alert.alert('Guest Mode', 'Create an account to save your activity logs permanently.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Physical Activity</Text>
      </View>
      <ScrollView style={styles.container}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today's Activity</Text>
          <Text style={styles.summaryValue}>{todayActivity} <Text style={{fontSize: 20}}>min</Text></Text>
        </View>

        <Text style={styles.disclaimer}>
          We do not make medical claims from activity levels. Regular physical activity generally supports wellness.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Log Activity</Text>
          
          <Text style={styles.label}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {activities.map(type => (
              <TouchableOpacity 
                key={type} 
                style={[styles.typeBadge, activityType === type && styles.typeBadgeActive]}
                onPress={() => setActivityType(type)}
              >
                <Text style={[styles.typeText, activityType === type && styles.typeTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g. 30"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Morning run in the park"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={saveActivity}>
            <Text style={styles.buttonText}>Log Activity</Text>
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
  summaryCard: { alignItems: 'center', backgroundColor: '#fff', padding: 32, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  summaryLabel: { fontSize: 16, color: Colors.textSecondary, marginBottom: 8 },
  summaryValue: { fontSize: 48, fontWeight: 'bold', color: Colors.accent },
  disclaimer: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 8 },
  typeScroll: { flexDirection: 'row', marginBottom: 20 },
  typeBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  typeBadgeActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  typeText: { color: Colors.textSecondary, fontWeight: '500' },
  typeTextActive: { color: '#fff' },
  inputGroup: { marginBottom: 16 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.textPrimary },
  button: { backgroundColor: Colors.accent, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ActivityScreen;
