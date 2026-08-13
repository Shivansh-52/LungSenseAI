import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Card from '../components/Card';

const ExaminationDetailScreen = ({ navigation, route }) => {
  const { examination } = route.params || {};
  const analysis = examination?.analysis;

  if (!examination) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>No examination data.</Text>
      </SafeAreaView>
    );
  }

  const isNormal = (analysis?.predicted_class || '').toLowerCase().includes('normal');
  const statusColor = isNormal ? Colors.success : Colors.warning;
  const confidencePct = analysis ? Math.round(analysis.confidence * 100) : 0;
  const dateStr = examination.recorded_at ? new Date(examination.recorded_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) : 'Unknown date';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Examination Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={[styles.resultCard, { borderColor: statusColor }]}>
          <Text style={styles.sectionLabel}>Respiratory Sound Analysis</Text>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Detected Pattern</Text>
            <Text style={[styles.value, { color: statusColor }]}>{analysis?.predicted_class || 'N/A'}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.value}>{confidencePct}%</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Recording Duration</Text>
            <Text style={styles.value}>{examination.duration_seconds || 0} seconds</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Analysis Date</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Model</Text>
            <Text style={styles.value}>{analysis?.model_version || 'mock-v1'}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>Interpretation</Text>
          <Text style={styles.messageText}>{analysis?.message || 'No analysis available.'}</Text>
        </Card>

        <Card style={styles.guidanceCard}>
          <Icon name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.guidanceText}>
            If you have persistent, severe, or worsening symptoms, consider consulting a qualified healthcare professional.
          </Text>
        </Card>

        <View style={styles.disclaimerBox}>
          <Icon name="alert-circle" size={16} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            Research/educational prototype only. Do not use for medical diagnosis.
          </Text>
        </View>

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
  errorText: { fontSize: 16, color: Colors.warning, textAlign: 'center', marginTop: 60 },
  resultCard: { borderTopWidth: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  label: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  value: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  messageText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  guidanceCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  guidanceText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, opacity: 0.8,
  },
  disclaimerText: { fontSize: 12, color: Colors.warning, marginLeft: 6 },
});

export default ExaminationDetailScreen;
