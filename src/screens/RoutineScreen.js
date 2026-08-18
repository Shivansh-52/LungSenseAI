import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import api from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const RoutineScreen = ({ navigation }) => {
  const [routine, setRoutine] = useState(null);

  useEffect(() => {
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    try {
      const data = await api.getWellnessPlan ? await api.getWellnessPlan() : null;
      if (data) setRoutine(data);
    } catch (err) {
      // In case api.getWellnessPlan isn't fully implemented in frontend yet, fallback to local static data
    }
  };

  const localRoutine = routine || {
    morning_routine: [
      { activity: 'Wake up consistently', description: 'Start your day at the same time.' },
      { activity: 'Hydrate', description: 'Drink a glass of water.' },
      { activity: 'Light stretching', description: '5-10 minutes of gentle movement.' },
      { activity: 'Balanced breakfast', description: 'Nourish your body for the day ahead.' }
    ],
    day_routine: [
      { activity: 'Stay active', description: 'Try to reach your step goal.' },
      { activity: 'Take movement breaks', description: 'Stand up every hour.' },
      { activity: 'Maintain hydration', description: 'Keep drinking water regularly.' }
    ],
    night_routine: [
      { activity: 'Light physical activity', description: 'Relaxing walk or yoga.' },
      { activity: 'Reduce screen exposure', description: 'Avoid screens 1 hour before bed.' },
      { activity: 'Consistent bedtime', description: 'Go to bed at the same time.' }
    ]
  };

  const renderSection = (title, icon, data) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={icon} size={24} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>
        {data.map((item, index) => (
          <View key={index} style={[styles.listItem, index === data.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.bullet} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listActivity}>{item.activity}</Text>
              <Text style={styles.listDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Daily Routine</Text>
      </View>
      <ScrollView style={styles.container}>
        
        <Text style={styles.disclaimer}>
          This is general wellness information and should not be considered a personalized medical treatment plan.
        </Text>

        {renderSection('Morning', 'sunny-outline', localRoutine.morning_routine)}
        {renderSection('Afternoon', 'partly-sunny-outline', localRoutine.day_routine)}
        {renderSection('Evening & Night', 'moon-outline', localRoutine.night_routine)}

        <View style={{ height: 40 }} />
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
  disclaimer: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginLeft: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  listItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6, marginRight: 12 },
  listTextContainer: { flex: 1 },
  listActivity: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  listDescription: { fontSize: 14, color: Colors.textSecondary }
});

export default RoutineScreen;
