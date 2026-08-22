import React, { useState, useCallback } from 'react';
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
      const [wellnessRes, examsRes] = await Promise.allSettled([
        api.getWellnessToday(today),
        api.getExaminations(),
      ]);
      if (wellnessRes.status === 'fulfilled') setWellnessData(wellnessRes.value);
      if (examsRes.status === 'fulfilled') {
        const items = examsRes.value?.items || examsRes.value?.examinations || [];
        if (items.length > 0) setLatestExam(items[0]);
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
    if (hour >= 5 && hour < 12) return '🌅 Good Morning';
    if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
    if (hour >= 17 && hour < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
  };

  // Get first name from user object — backend uses full_name or name
  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || null;

  const score = wellnessData?.score ?? 0;
  const scoreLabel = wellnessData?.score_label ?? (isAuthenticated ? 'Log activities to build your score' : 'Sign in to track wellness');

  // Safely get latest exam result text
  const getExamResultText = (exam) => {
    if (!exam) return null;
    const pred = exam.prediction;
    if (typeof pred === 'string') return pred;
    if (typeof pred === 'object' && pred !== null) return pred.class_name || pred.class || 'See details';
    return 'See details';
  };

  const getExamConfidence = (exam) => {
    if (!exam) return 0;
    const pred = exam.prediction;
    if (typeof pred === 'object' && pred !== null) return pred.confidence || 0;
    return exam.confidence || 0;
  };

  const renderHealthTimeline = () => {
    if (!isAuthenticated) return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Sign in to track your daily wellness activities.</Text>
      </View>
    );
    if (!wellnessData) return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Log your wellness activities to see your timeline.</Text>
      </View>
    );
    const hasData = wellnessData.total_steps > 0 || wellnessData.total_water_ml > 0 ||
      wellnessData.total_sleep_minutes > 0 || wellnessData.total_activity_minutes > 0;

    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineDate}>Today's Activity</Text>
        {wellnessData.total_steps > 0 && (
          <View style={styles.timelineRow}>
            <Icon name="walk" size={16} color="#FA8C16" />
            <Text style={styles.timelineItem}> {wellnessData.total_steps.toLocaleString()} steps</Text>
          </View>
        )}
        {wellnessData.total_water_ml > 0 && (
          <View style={styles.timelineRow}>
            <Icon name="water" size={16} color="#40A9FF" />
            <Text style={styles.timelineItem}> {wellnessData.total_water_ml} ml water</Text>
          </View>
        )}
        {wellnessData.total_sleep_minutes > 0 && (
          <View style={styles.timelineRow}>
            <Icon name="moon" size={16} color="#722ED1" />
            <Text style={styles.timelineItem}> {Math.floor(wellnessData.total_sleep_minutes / 60)}h {wellnessData.total_sleep_minutes % 60}m sleep</Text>
          </View>
        )}
        {wellnessData.total_activity_minutes > 0 && (
          <View style={styles.timelineRow}>
            <Icon name="fitness" size={16} color="#52C41A" />
            <Text style={styles.timelineItem}> {wellnessData.total_activity_minutes} min activity</Text>
          </View>
        )}
        {!hasData && (
          <Text style={styles.timelineItem}>Nothing logged yet today. Tap an activity above to get started!</Text>
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
            {getGreeting()}{firstName ? `, ${firstName}!` : '!'}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
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

        <Text style={styles.sectionTitle}>Wellness Score</Text>
        <Card style={styles.wellnessCard}>
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <Text style={{ fontSize: 56, fontWeight: 'bold', color: score >= 70 ? Colors.success : score >= 40 ? '#FA8C16' : Colors.warning }}>{score}</Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginTop: 4 }}>{scoreLabel}</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            <ProgressBar progress={score / 100} color={score >= 70 ? Colors.success : score >= 40 ? '#FA8C16' : Colors.warning} />
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
              <Text style={styles.lungResultLabel}>Result:</Text>
              <Text style={styles.lungResultText}>{getExamResultText(latestExam)}</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                AI Confidence: {Math.round(getExamConfidence(latestExam) * 100)}% • {new Date(latestExam.created_at).toLocaleDateString('en-IN')}
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 16 }]}
                onPress={() => navigation.navigate('LungTab', { screen: 'ExaminationDetail', params: { examination: latestExam } })}
              >
                <Text style={styles.primaryButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="mic-outline" size={36} color={Colors.textSecondary} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Text style={styles.emptyStateText}>Your first respiratory examination will appear here.</Text>
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 16 }]}
                onPress={() => navigation.navigate('LungTab', { screen: 'Recording' })}
              >
                <Text style={styles.primaryButtonText}>Start First Exam</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <SectionHeader title="Wellness Timeline" />
        <Card style={styles.timelineCard}>
          {renderHealthTimeline()}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: 16 },
  header: { marginBottom: 24, marginTop: 8 },
  greeting: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  date: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 4 },
  appName: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginTop: 2 },
  authBanner: { backgroundColor: Colors.primaryLight, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.primary + '30' },
  authBannerContent: { flexDirection: 'row', alignItems: 'center' },
  authBannerText: { flex: 1, marginLeft: 12 },
  authBannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  authBannerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12 },
  wellnessCard: { marginBottom: 8 },
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  quickAction: { alignItems: 'center', width: '22%' },
  quickActionIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickActionText: { fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },
  lungCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  lungCardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginLeft: 8 },
  lungLastResult: { backgroundColor: Colors.background, padding: 12, borderRadius: 8, marginBottom: 8 },
  lungResultLabel: { fontSize: 14, color: Colors.textSecondary },
  lungResultText: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 4 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timelineCard: { padding: 4 },
  timelineContainer: { padding: 8 },
  timelineDate: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  timelineItem: { fontSize: 14, color: Colors.textSecondary, paddingLeft: 4 },
  emptyState: { padding: 16, alignItems: 'center' },
  emptyStateText: { fontSize: 14, color: Colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
});

export default HomeDashboardScreen;
