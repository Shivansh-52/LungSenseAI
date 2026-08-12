import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import WellnessScore from '../components/WellnessScore';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { MOCK_ACTIVITY_DATA, MOCK_INSIGHTS } from '../data/healthData';
import { calculateWellnessScore } from '../utils/healthCalculations';

const QuickAction = ({ icon, title, onPress, color }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

const HomeDashboardScreen = ({ navigation }) => {
  const [wellnessScore, setWellnessScore] = useState(0);

  useEffect(() => {
    const score = calculateWellnessScore(MOCK_ACTIVITY_DATA);
    setWellnessScore(score);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.appName}>LungSense AI</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Wellness Today</Text>
        <Card style={styles.wellnessCard}>
          <WellnessScore score={wellnessScore} />
        </Card>

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsGrid}>
          <QuickAction 
            icon="medical" 
            title="Lung Check" 
            color={Colors.primary} 
            onPress={() => navigation.navigate('LungTab')} 
          />
          <QuickAction 
            icon="water" 
            title="Add Water" 
            color="#40A9FF" 
            onPress={() => navigation.navigate('HealthTab')} 
          />
          <QuickAction 
            icon="body" 
            title="BMI" 
            color={Colors.accent} 
            onPress={() => navigation.navigate('HealthTab')} 
          />
          <QuickAction 
            icon="search" 
            title="Find Doc" 
            color="#FFA940" 
            onPress={() => navigation.navigate('DoctorsTab')} 
          />
        </View>

        <SectionHeader title="Lung Health" actionTitle="History" onActionPress={() => navigation.navigate('LungTab', { screen: 'History' })} />
        <Card>
          <View style={styles.lungCardHeader}>
            <Icon name="pulse" size={24} color={Colors.primary} />
            <Text style={styles.lungCardTitle}>Analyze your respiratory sound</Text>
          </View>
          <View style={styles.lungLastResult}>
            <Text style={styles.lungResultLabel}>Last Analysis (Today):</Text>
            <Text style={styles.lungResultText}>No abnormal pattern detected</Text>
          </View>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('LungTab', { screen: 'Recording' })}
          >
            <Text style={styles.primaryButtonText}>Record Lung Sound</Text>
          </TouchableOpacity>
        </Card>

        <SectionHeader title="Daily Health Dashboard" actionTitle="See All" onActionPress={() => navigation.navigate('HealthTab')} />
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Icon name="walk" size={20} color={Colors.accent} />
              <Text style={styles.metricTitle}>Steps</Text>
            </View>
            <Text style={styles.metricValue}>{MOCK_ACTIVITY_DATA.steps}</Text>
            <Text style={styles.metricSub}>/ {MOCK_ACTIVITY_DATA.stepsGoal}</Text>
            <View style={{marginTop: 8}}>
              <ProgressBar progress={MOCK_ACTIVITY_DATA.steps / MOCK_ACTIVITY_DATA.stepsGoal} color={Colors.accent} />
            </View>
          </Card>
          
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Icon name="water" size={20} color="#40A9FF" />
              <Text style={styles.metricTitle}>Water</Text>
            </View>
            <Text style={styles.metricValue}>{MOCK_ACTIVITY_DATA.water}L</Text>
            <Text style={styles.metricSub}>/ {MOCK_ACTIVITY_DATA.waterGoal}L</Text>
            <View style={{marginTop: 8}}>
              <ProgressBar progress={MOCK_ACTIVITY_DATA.water / MOCK_ACTIVITY_DATA.waterGoal} color="#40A9FF" />
            </View>
          </Card>
        </View>

        <SectionHeader title="Your Insights" />
        {MOCK_INSIGHTS.map((insight, index) => (
          <Card key={index} style={styles.insightCard}>
            <Icon name="bulb-outline" size={20} color="#FAAD14" style={{marginRight: 12}} />
            <Text style={styles.insightText}>{insight}</Text>
          </Card>
        ))}

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
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  wellnessCard: {
    marginBottom: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  lungCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  lungCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  lungLastResult: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  lungResultLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lungResultText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  metricSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  }
});

export default HomeDashboardScreen;
