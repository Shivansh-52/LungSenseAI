import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const WellnessScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadPlan();
    else setLoading(false);
  }, [isAuthenticated]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const data = await api.getWellnessPlan();
      setPlan(data);
    } catch (err) {
      console.warn('Could not load wellness plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Icon name="leaf-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>Personal Wellness Routine</Text>
          <Text style={styles.emptySubText}>Login to get a personalized wellness plan based on your health profile.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderRoutineItem = (item, index) => (
    <View key={index} style={styles.routineItem}>
      <View style={styles.timeBadge}>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      <View style={styles.routineContent}>
        <Text style={styles.routineActivity}>{item.activity}</Text>
        <Text style={styles.routineDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wellness Routine</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : plan ? (
          <>
            <Card style={styles.planHeader}>
              <Icon name="leaf" size={28} color={Colors.accent} />
              <Text style={styles.planTitle}>{plan.plan_name}</Text>
            </Card>

            <Text style={styles.sectionTitle}>🌅 Morning</Text>
            {(plan.morning_routine || []).map(renderRoutineItem)}

            <Text style={styles.sectionTitle}>☀️ Day</Text>
            {(plan.day_routine || []).map(renderRoutineItem)}

            <Text style={styles.sectionTitle}>🌙 Night</Text>
            {(plan.night_routine || []).map(renderRoutineItem)}

            <View style={styles.disclaimerBox}>
              <Icon name="information-circle-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.disclaimerText}>{plan.disclaimer}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptySubText}>Could not load wellness plan.</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptySubText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  loginButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 20 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  planTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 20, marginBottom: 12 },
  routineItem: {
    flexDirection: 'row', backgroundColor: Colors.cardBackground, borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  timeBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    justifyContent: 'center', marginRight: 12, minWidth: 70, alignItems: 'center',
  },
  timeText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  routineContent: { flex: 1 },
  routineActivity: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  routineDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14, backgroundColor: '#FFF8E1',
    borderRadius: 10, marginTop: 20, borderWidth: 1, borderColor: '#FFE082',
  },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 17 },
});

export default WellnessScreen;
