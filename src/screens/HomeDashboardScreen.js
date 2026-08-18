import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import SectionHeader from '../components/SectionHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const QuickAction = ({ icon, title, onPress, color }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.quickActionText}>{title}</Text>
  </TouchableOpacity>
);

const HomeDashboardScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [wellnessData, setWellnessData] = useState(null);
  const [latestExam, setLatestExam] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await api.getWellnessToday(today);
      setWellnessData(data);
      
      const exams = await api.getExaminations(1, 1);
      if (exams && exams.examinations && exams.examinations.length > 0) {
        setLatestExam(exams.examinations[0]);
      }
    } catch (err) {
      console.log('Error loading dashboard', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [isAuthenticated])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const score = wellnessData ? wellnessData.score : 0;
  const scoreLabel = wellnessData ? wellnessData.score_label : 'Needs Attention';

  const renderHealthTimeline = () => {
    if (!wellnessData) return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Log your wellness activities to see your timeline.</Text>
      </View>
    );
    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineDate}>Today</Text>
        {wellnessData.total_steps > 0 && <Text style={styles.timelineItem}>• {wellnessData.total_steps.toLocaleString()} steps</Text>}
        {wellnessData.total_water_ml > 0 && <Text style={styles.timelineItem}>• {wellnessData.total_water_ml} ml water</Text>}
        {wellnessData.total_sleep_minutes > 0 && <Text style={styles.timelineItem}>• {Math.floor(wellnessData.total_sleep_minutes/60)}h {wellnessData.total_sleep_minutes%60}m sleep</Text>}
        {wellnessData.total_activity_minutes > 0 && <Text style={styles.timelineItem}>• {wellnessData.total_activity_minutes} min activity</Text>}
        
        {wellnessData.total_water_ml === 0 && wellnessData.total_sleep_minutes === 0 && wellnessData.total_activity_minutes === 0 && (
          <Text style={styles.timelineItem}>No wellness data logged today.</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}{isAuthenticated && user ? `, ${user.full_name?.split(' ')[0]}` : ''}
          </Text>
          <Text style={styles.appName}>LungSense AI</Text>
        </View>

        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.authBanner}
            onPress={() => navigation.navigate('Login')}>
            <View style={styles.authBannerContent}>
              <Icon name="person-circle-outline" size={28} color={Colors.primary} />
              <View style={styles.authBannerText}>
                <Text style={styles.authBannerTitle}>Unlock Full Dashboard</Text>
                <Text style={styles.authBannerSubtitle}>Sign in to track wellness & save progress</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Wellness Progress</Text>
        <Card style={styles.wellnessCard}>
          <View style={{alignItems: 'center', marginVertical: 16}}>
            <Text style={{fontSize: 48, fontWeight: 'bold', color: Colors.primary}}>{score}</Text>
            <Text style={{fontSize: 16, color: Colors.textSecondary}}>{scoreLabel}</Text>
          </View>
          <View style={{marginTop: 8}}>
            <ProgressBar progress={score / 100} color={Colors.primary} />
          </View>
        </Card>

        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActionsGrid}>
          <QuickAction icon="medical" title="Exam" color={Colors.primary} onPress={() => navigation.navigate('LungTab', { screen: 'Recording' })} />
          <QuickAction icon="time" title="History" color={Colors.secondary} onPress={() => navigation.navigate('LungTab', { screen: 'History' })} />
          <QuickAction icon="body" title="BMI" color={Colors.accent} onPress={() => navigation.navigate('BMI')} />
          <QuickAction icon="walk" title="Steps" color="#FA8C16" onPress={() => navigation.navigate('Steps')} />
        </View>
        <View style={styles.quickActionsGrid}>
          <QuickAction icon="water" title="Water" color="#40A9FF" onPress={() => navigation.navigate('Hydration')} />
          <QuickAction icon="moon" title="Sleep" color="#722ED1" onPress={() => navigation.navigate('Sleep')} />
          <QuickAction icon="fitness" title="Activity" color="#52C41A" onPress={() => navigation.navigate('Activity')} />
          <QuickAction icon="calendar" title="Routine" color="#EB2F96" onPress={() => navigation.navigate('Routine')} />
        </View>

        <SectionHeader title="Respiratory Health" />
        <Card>
          <View style={styles.lungCardHeader}>
            <Icon name="pulse" size={24} color={Colors.primary} />
            <Text style={styles.lungCardTitle}>Latest Examination</Text>
          </View>
          {latestExam ? (
            <View style={styles.lungLastResult}>
              <Text style={styles.lungResultLabel}>Respiratory sound classification:</Text>
              <Text style={styles.lungResultText}>{latestExam.prediction}</Text>
              <Text style={{fontSize: 12, color: Colors.textSecondary, marginTop: 4}}>
                Confidence: {Math.round(latestExam.confidence * 100)}% • {new Date(latestExam.created_at).toLocaleDateString()}
              </Text>
              <TouchableOpacity 
                style={[styles.primaryButton, {marginTop: 16}]}
                onPress={() => navigation.navigate('LungTab', { screen: 'ExaminationDetail', params: { examinationId: latestExam.id } })}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Your first respiratory examination will appear here.</Text>
            </View>
          )}
        </Card>

        <SectionHeader title="Wellness Timeline" />
        <Card style={styles.timelineCard}>
          {renderHealthTimeline()}
        </Card>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: 16 },
  header: { marginBottom: 24, marginTop: 8 },
  greeting: { fontSize: 16, color: Colors.textSecondary },
  appName: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  authBanner: { backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.primary + '30' },
  authBannerContent: { flexDirection: 'row', alignItems: 'center' },
  authBannerText: { flex: 1, marginLeft: 12 },
  authBannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  authBannerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12 },
  wellnessCard: { marginBottom: 8 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  quickAction: { alignItems: 'center', width: '22%' },
  quickActionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },
  lungCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  lungCardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginLeft: 8 },
  lungLastResult: { backgroundColor: Colors.background, padding: 12, borderRadius: 8, marginBottom: 8 },
  lungResultLabel: { fontSize: 14, color: Colors.textSecondary },
  lungResultText: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 4 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timelineCard: { padding: 16 },
  timelineContainer: {},
  timelineDate: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 },
  timelineItem: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4, paddingLeft: 8 },
  emptyState: { padding: 16, alignItems: 'center' },
  emptyStateText: { fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' }
});

export default HomeDashboardScreen;
