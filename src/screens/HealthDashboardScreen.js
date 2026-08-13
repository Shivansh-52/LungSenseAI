import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import Icon from 'react-native-vector-icons/Ionicons';
import { MOCK_ACTIVITY_DATA } from '../data/healthData';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HealthDashboardScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [showBMI, setShowBMI] = useState(false);
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  const handleCalculateBMI = async () => {
    const h = parseFloat(bmiHeight);
    const w = parseFloat(bmiWeight);
    if (!h || !w || h <= 0 || w <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid height and weight.');
      return;
    }
    try {
      const result = await api.calculateBMI(h, w);
      setBmiResult(result);
    } catch (err) {
      // Fallback to local calculation
      const heightM = h / 100;
      const bmi = (w / (heightM * heightM)).toFixed(1);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi <= 24.9) category = 'Normal range';
      else if (bmi <= 29.9) category = 'Overweight';
      else category = 'Obese';
      setBmiResult({ bmi: parseFloat(bmi), category, disclaimer: 'BMI is a screening measure and does not provide a complete assessment of health.' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Health Tracking</Text>

        {!isAuthenticated && (
          <TouchableOpacity style={styles.authBanner} onPress={() => navigation.navigate('Login')}>
            <Icon name="lock-closed-outline" size={20} color={Colors.primary} />
            <Text style={styles.authBannerText}>Sign in to track and save your health data</Text>
          </TouchableOpacity>
        )}

        <SectionHeader title="Daily Summary" />
        
        <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={styles.iconBox}>
                <Icon name="walk" size={24} color={Colors.primary} />
              </View>
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricTitle}>Steps</Text>
                <Text style={styles.metricValue}>{MOCK_ACTIVITY_DATA.steps} / {MOCK_ACTIVITY_DATA.stepsGoal}</Text>
              </View>
            </View>
            <ProgressBar progress={MOCK_ACTIVITY_DATA.steps / MOCK_ACTIVITY_DATA.stepsGoal} />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={[styles.iconBox, {backgroundColor: '#E6F7FF'}]}>
                <Icon name="water" size={24} color="#1890FF" />
              </View>
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricTitle}>Water</Text>
                <Text style={styles.metricValue}>{MOCK_ACTIVITY_DATA.water}L / {MOCK_ACTIVITY_DATA.waterGoal}L</Text>
              </View>
            </View>
            <ProgressBar progress={MOCK_ACTIVITY_DATA.water / MOCK_ACTIVITY_DATA.waterGoal} color="#1890FF" />
          </Card>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => {}}>
          <Card style={styles.metricCard}>
            <View style={styles.metricRow}>
              <View style={[styles.iconBox, {backgroundColor: '#F9F0FF'}]}>
                <Icon name="moon" size={24} color="#722ED1" />
              </View>
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricTitle}>Sleep</Text>
                <Text style={styles.metricValue}>7h 42m</Text>
              </View>
            </View>
            <ProgressBar progress={MOCK_ACTIVITY_DATA.sleepMinutes / MOCK_ACTIVITY_DATA.sleepGoalMinutes} color="#722ED1" />
          </Card>
        </TouchableOpacity>

        <SectionHeader title="BMI Calculator" />
        <Card>
          <View style={styles.bmiInputRow}>
            <View style={styles.bmiField}>
              <Text style={styles.bmiLabel}>Height (cm)</Text>
              <TextInput
                style={styles.bmiInput}
                placeholder="175"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={bmiHeight}
                onChangeText={setBmiHeight}
              />
            </View>
            <View style={styles.bmiField}>
              <Text style={styles.bmiLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.bmiInput}
                placeholder="72"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
                value={bmiWeight}
                onChangeText={setBmiWeight}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.bmiButton} onPress={handleCalculateBMI}>
            <Text style={styles.bmiButtonText}>Calculate BMI</Text>
          </TouchableOpacity>
          {bmiResult && (
            <View style={styles.bmiResultBox}>
              <Text style={styles.bmiResultValue}>BMI: {bmiResult.bmi}</Text>
              <Text style={styles.bmiResultCategory}>{bmiResult.category}</Text>
              <Text style={styles.bmiDisclaimer}>{bmiResult.disclaimer}</Text>
            </View>
          )}
        </Card>

        <SectionHeader title="Tools" />
        <View style={styles.toolsGrid}>
          <TouchableOpacity style={styles.toolBtn} onPress={() => {}}>
            <Icon name="bar-chart" size={28} color={Colors.accent} />
            <Text style={styles.toolBtnText}>Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => {}}>
            <Icon name="nutrition" size={28} color="#52C41A" />
            <Text style={styles.toolBtnText}>Diet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => {}}>
            <Icon name="scale" size={28} color="#722ED1" />
            <Text style={styles.toolBtnText}>Weight</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  authBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  authBannerText: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  metricCard: {
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  bmiInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bmiField: {
    width: '48%',
  },
  bmiLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  bmiInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  bmiButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bmiButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bmiResultBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    alignItems: 'center',
  },
  bmiResultValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  bmiResultCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  bmiDisclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  toolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolBtn: {
    width: '31%',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toolBtnText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  }
});

export default HealthDashboardScreen;
