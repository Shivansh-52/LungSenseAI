import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import api from '../services/api';

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const DIET_PREFS = ['', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'no preference'];

const OnboardingScreen = ({ navigation }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [stepGoal, setStepGoal] = useState('10000');
  const [waterGoal, setWaterGoal] = useState('2500');
  const [sleepGoal, setSleepGoal] = useState('8');
  const [dietPref, setDietPref] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.saveHealthProfile({
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        activity_level: activityLevel,
        daily_step_goal: parseInt(stepGoal) || 10000,
        water_goal_ml: parseInt(waterGoal) || 2500,
        sleep_goal_hours: parseInt(sleepGoal) || 8,
        diet_preference: dietPref,
      });
    } catch (err) {
      console.warn('Could not save health profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate to the main app (handled by navigator detecting auth)
    // No need to do anything special — just pop the auth stack
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Icon name="heart" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your wellness experience. All fields are optional.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="72"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_LEVELS.map(level => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, activityLevel === level && styles.chipActive]}
                onPress={() => setActivityLevel(level)}>
                <Text style={[styles.chipText, activityLevel === level && styles.chipTextActive]}>
                  {level.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.thirdField}>
              <Text style={styles.label}>Steps Goal</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={stepGoal}
                onChangeText={setStepGoal}
              />
            </View>
            <View style={styles.thirdField}>
              <Text style={styles.label}>Water (ml)</Text>
              <TextInput
                style={styles.input}
                placeholder="2500"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={waterGoal}
                onChangeText={setWaterGoal}
              />
            </View>
            <View style={styles.thirdField}>
              <Text style={styles.label}>Sleep (hrs)</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={sleepGoal}
                onChangeText={setSleepGoal}
              />
            </View>
          </View>

          <Text style={styles.label}>Diet Preference</Text>
          <View style={styles.chipRow}>
            {DIET_PREFS.filter(d => d).map(pref => (
              <TouchableOpacity
                key={pref}
                style={[styles.chip, dietPref === pref && styles.chipActive]}
                onPress={() => setDietPref(dietPref === pref ? '' : pref)}>
                <Text style={[styles.chipText, dietPref === pref && styles.chipTextActive]}>
                  {pref}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  logoContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FF6B6B', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  form: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: Colors.cardBackground, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 48, fontSize: 16, color: Colors.textPrimary,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfField: { width: '48%' },
  thirdField: { width: '31%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.cardBackground, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 4,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  saveButton: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skipButton: { alignItems: 'center', paddingVertical: 12 },
  skipButtonText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
});

export default OnboardingScreen;
