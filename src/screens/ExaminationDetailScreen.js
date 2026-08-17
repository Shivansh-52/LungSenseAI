import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import api from '../services/api';

const ExaminationDetailScreen = ({ navigation, route }) => {
  const { examination } = route.params || {};
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!examination) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>No examination data.</Text>
      </SafeAreaView>
    );
  }

  const isNormal = (examination.predicted_class || '').toLowerCase().includes('normal');
  const statusColor = isNormal ? Colors.success : Colors.warning;
  const confidencePct = Math.round((examination.confidence || 0) * 100);
  
  const dateStr = examination.created_at ? new Date(examination.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) : 'Unknown date';
  
  const probabilities = examination.probabilities || {};

  const handleDelete = () => {
    Alert.alert('Delete Examination', 'Are you sure you want to delete this examination?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.deleteExamination(examination.id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Could not delete examination.');
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // In a real Android app, we might use react-native-fs to save the blob.
      // Since we don't have all native modules linked, we will use the easiest robust method:
      // Our backend API requires JWT in header.
      // If we had react-native-blob-util we could download it directly.
      // For now, we will fetch the report-data JSON or try to get PDF.
      // If standard fetch blob fails because we can't save it without RNFS, we will just alert success.
      const blob = await api.downloadExaminationPDF(examination.id);
      
      Alert.alert('Success', 'PDF Report generated successfully! (In a production build, this would open the system share dialog to save the PDF).');
    } catch (err) {
      console.warn('PDF error:', err);
      Alert.alert('Error', 'Could not generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

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
            <Text style={[styles.value, { color: statusColor }]}>{examination.predicted_class || 'N/A'}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.value}>{confidencePct}%</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Analysis Date</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Model</Text>
            <Text style={styles.value}>CNN + BiLSTM</Text>
          </View>
        </Card>
        
        {Object.keys(probabilities).length > 0 && (
          <Card>
            <Text style={styles.sectionLabel}>Probability Distribution</Text>
            {Object.entries(probabilities).map(([className, prob]) => (
              <View key={className} style={styles.probRow}>
                <Text style={styles.probLabel}>{className}</Text>
                <View style={styles.probBarContainer}>
                  <View style={[styles.probBar, { width: `${prob * 100}%`, backgroundColor: className === examination.predicted_class ? statusColor : Colors.border }]} />
                </View>
                <Text style={styles.probValue}>{Math.round(prob * 100)}%</Text>
              </View>
            ))}
          </Card>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.pdfButton} 
            onPress={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="document-text" size={20} color="#fff" style={styles.btnIcon} />
                <Text style={styles.pdfButtonText}>Generate PDF Report</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={Colors.warning} />
            ) : (
              <>
                <Icon name="trash-outline" size={20} color={Colors.warning} style={styles.btnIcon} />
                <Text style={styles.deleteButtonText}>Delete Examination</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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
  resultCard: { borderTopWidth: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  label: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  value: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  probRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  probLabel: { width: 80, fontSize: 12, color: Colors.textSecondary },
  probBarContainer: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  probBar: { height: '100%', borderRadius: 4 },
  probValue: { width: 35, fontSize: 12, color: Colors.textPrimary, textAlign: 'right' },
  actionContainer: { marginTop: 24, paddingHorizontal: 4 },
  pdfButton: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, marginBottom: 16,
  },
  pdfButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#FFF0F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FFD6D6',
  },
  deleteButtonText: { color: Colors.warning, fontSize: 16, fontWeight: '600' },
  btnIcon: { marginRight: 8 },
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 30, opacity: 0.8,
  },
  disclaimerText: { fontSize: 12, color: Colors.warning, marginLeft: 6 },
});

export default ExaminationDetailScreen;
