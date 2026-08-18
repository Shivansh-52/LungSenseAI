import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BMIScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getHealthProfile();
      if (res && res.height_cm) setHeight(res.height_cm.toString());
      if (res && res.weight_kg) setWeight(res.weight_kg.toString());
      if (res && res.bmi) {
        setBmi(res.bmi);
        determineCategory(res.bmi);
      }
    } catch (error) {
      console.log('No existing profile');
    } finally {
      setLoading(false);
    }
  };

  const determineCategory = (val) => {
    if (val < 18.5) setCategory('Underweight');
    else if (val < 25) setCategory('Normal range');
    else if (val < 30) setCategory('Overweight');
    else setCategory('Obesity');
  };

  const calculateBmi = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid height and weight.');
      return;
    }

    const hMeters = h / 100;
    const calculatedBmi = (w / (hMeters * hMeters)).toFixed(1);
    setBmi(calculatedBmi);
    determineCategory(calculatedBmi);

    if (isAuthenticated) {
      try {
        setLoading(true);
        await api.updateHealthProfile({ height_cm: h, weight_kg: w });
      } catch (err) {
        Alert.alert('Error', 'Could not save BMI to your profile.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Guest Mode', 'Create an account to save your wellness progress.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BMI Calculator</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.disclaimer}>
          BMI is a general screening measure and does not directly measure body composition or overall health.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 175"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 70"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={calculateBmi} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Calculate & Save</Text>}
        </TouchableOpacity>

        {bmi !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Your BMI</Text>
            <Text style={styles.resultValue}>{bmi}</Text>
            <Text style={[styles.resultCategory, 
              { color: category === 'Normal range' ? Colors.success : Colors.warning }
            ]}>
              {category}
            </Text>
          </View>
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
  container: { padding: 16 },
  disclaimer: { fontSize: 13, color: Colors.textSecondary, marginBottom: 24, fontStyle: 'italic', textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, color: Colors.textPrimary },
  button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { marginTop: 32, alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  resultLabel: { fontSize: 16, color: Colors.textSecondary, marginBottom: 8 },
  resultValue: { fontSize: 48, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  resultCategory: { fontSize: 18, fontWeight: '500' }
});

export default BMIScreen;
