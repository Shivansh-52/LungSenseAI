import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import Icon from 'react-native-vector-icons/Ionicons';
import { MOCK_ACTIVITY_DATA } from '../data/healthData';

const HealthDashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Health Tracking</Text>

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

        <SectionHeader title="Calculators" />
        <View style={styles.toolsGrid}>
          <TouchableOpacity style={styles.toolBtn}>
            <Icon name="calculator" size={28} color={Colors.primary} />
            <Text style={styles.toolBtnText}>BMI Calc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <Icon name="bar-chart" size={28} color={Colors.accent} />
            <Text style={styles.toolBtnText}>Trends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <Icon name="nutrition" size={28} color="#52C41A" />
            <Text style={styles.toolBtnText}>Diet</Text>
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
