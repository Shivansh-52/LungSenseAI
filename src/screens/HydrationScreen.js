import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import ProgressBar from '../components/ProgressBar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HydrationScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [water, setWater] = useState(0);
  const [goal, setGoal] = useState(2500);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayData = await api.getWellnessToday(today);
      if (todayData) {
        setWater(todayData.total_water_ml);
        if (todayData.goals && todayData.goals.daily_water_ml) {
          setGoal(todayData.goals.daily_water_ml);
        }
      }
    } catch (err) {
      console.log('Failed to load hydration data');
    }
  };

  const addWater = async (amount) => {
    const newTotal = water + amount;
    setWater(newTotal);

    if (isAuthenticated) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await api.addWaterEntry({ amount_ml: amount, date: today });
      } catch (err) {
        Alert.alert('Error', 'Could not save hydration data.');
        setWater(water); // Revert
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
        <Text style={styles.headerTitle}>Hydration Tracking</Text>
      </View>
      <View style={styles.container}>
        
        <View style={styles.progressContainer}>
          <Text style={styles.waterValue}>{water} <Text style={{fontSize: 24}}>ml</Text></Text>
          <Text style={styles.waterLabel}>/ {goal} ml today</Text>
          <View style={{ marginTop: 24, width: '100%' }}>
            <ProgressBar progress={Math.min(water / goal, 1)} color="#40A9FF" />
          </View>
          <Text style={styles.progressPercent}>{Math.round(Math.min(water / goal, 1) * 100)}% of daily hydration goal</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.actionGrid}>
          {[250, 500, 750].map(val => (
            <TouchableOpacity key={val} style={styles.actionButton} onPress={() => addWater(val)}>
              <Text style={styles.actionButtonText}>+{val} ml</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.disclaimer}>
          We do not claim that exactly {goal/1000}L is medically required. Adjust your daily hydration goal based on your needs.
        </Text>
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
  waterValue: { fontSize: 48, fontWeight: 'bold', color: "#40A9FF" },
  waterLabel: { fontSize: 16, color: Colors.textSecondary, marginTop: 8 },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionButton: { flex: 1, marginHorizontal: 4, paddingVertical: 16, borderRadius: 8, backgroundColor: '#E6F7FF', borderWidth: 1, borderColor: '#91D5FF', alignItems: 'center' },
  actionButtonText: { color: '#096DD9', fontWeight: 'bold', fontSize: 16 },
  disclaimer: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 16 }
});

export default HydrationScreen;
