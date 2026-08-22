import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
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

  // Flatten nested prediction fields for easy access
  const predictionObj = examination.prediction || {};
  const predictedClass = predictionObj.class_name || examination.predicted_class || null;
  const confidence = predictionObj.confidence || examination.confidence || 0;

  const isNormal = (predictedClass || '').toLowerCase().includes('normal');
  const statusColor = isNormal ? Colors.success : Colors.warning;
  const confidencePct = Math.round(confidence * 100);
  
  const dateStr = examination.created_at ? new Date(examination.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) : 'Unknown date';
  
  const probabilities = examination.probabilities || {};

  const generateSummary = () => {
    let summary = '';
    if (!predictedClass) {
      return 'Analysis complete. Tap the technical details below to see your results.';
    }
    if (isNormal) {
      summary += 'Great news! The AI did not detect any abnormal crackles or wheezes in your breathing. ';
    } else {
      summary += `The AI picked up some unusual sounds (${predictedClass}) in your breathing. This does not confirm a disease, but it is worth discussing with a doctor. `;
    }

    if (examination.disease_prediction && examination.disease_prediction.status === 'success') {
      const isCOPD = !examination.disease_prediction.prediction.toLowerCase().includes('no copd');
      if (isCOPD) {
        summary += 'Additionally, patterns associated with COPD were found. We strongly recommend sharing this report with a doctor.';
      } else {
        summary += 'Also, no signs associated with COPD were found. Your lungs appear to be clear.';
      }
    }
    return summary;
  };

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
      const token = await api.getAuthToken();
      const url = `${api.API_BASE_URL}/examinations/${examination.id}/report`;
      const fileName = `LungSenseAI_${new Date().toISOString().slice(0,10)}.pdf`;
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const result = await RNFS.downloadFile({
        fromUrl: url,
        toFile: downloadDest,
        headers: { Authorization: `Bearer ${token}` },
      }).promise;

      if (result.statusCode === 200) {
        // Scan into Android MediaStore so it shows in Files app immediately
        try { await RNFS.scanFile(downloadDest); } catch (_) {}
        Alert.alert(
          '✅ PDF Downloaded!',
          `Your report has been saved!\n\nTo find it:\n1. Open your phone's Files app\n2. Tap "Downloads"\n3. Look for: ${fileName}`,
          [{ text: 'OK' }]
        );
      } else {
        // Read the error body so we know what went wrong
        const errorText = await RNFS.readFile(downloadDest, 'utf8').catch(() => '');
        await RNFS.unlink(downloadDest).catch(() => {});
        throw new Error(`Server error ${result.statusCode}: ${errorText.slice(0, 100)}`);
      }
    } catch (err) {
      console.warn('PDF error:', err);
      Alert.alert('Download Failed', `Could not download the PDF.\n\nReason: ${err.message}\n\nMake sure you are logged in.`);
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

        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Icon name="sparkles" size={20} color={Colors.primary} />
            <Text style={styles.summaryTitle}>AI Summary</Text>
          </View>
          <Text style={styles.summaryText}>{generateSummary()}</Text>
        </Card>

        <Card style={[styles.resultCard, { borderColor: statusColor }]}>
          <Text style={styles.sectionLabel}>🫁 Breathing Sound Check</Text>

          <View style={styles.resultRow}>
            <Text style={styles.label}>What we heard</Text>
            <Text style={[styles.value, { color: statusColor }]}>
              {predictedClass ? predictedClass : 'Not available'}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>AI Confidence</Text>
            <Text style={styles.value}>
              {predictedClass ? `${confidencePct}%` : 'Not available'}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>Analysis Date</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.label}>AI Model Used</Text>
            <Text style={styles.value}>CNN + BiLSTM</Text>
          </View>
        </Card>
        
        {examination.disease_prediction && examination.disease_prediction.status === 'success' && (
          <Card style={[styles.resultCard, { borderColor: Colors.accent }]}>
            <Text style={styles.sectionLabel}>🔬 COPD Risk Check</Text>

            <View style={styles.resultRow}>
              <Text style={styles.label}>Result</Text>
              <Text style={[styles.value, { color: Colors.textPrimary, flex: 1, textAlign: 'right', marginLeft: 16 }]}>
                {examination.disease_prediction.prediction}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.label}>COPD Risk Score</Text>
              <Text style={[styles.value, { color: Colors.primary }]}>
                {Math.round((examination.disease_prediction.copd_probability || 0) * 100)}%
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.label}>Risk Threshold</Text>
              <Text style={[styles.value, { color: Colors.textSecondary }]}>
                {Math.round((examination.disease_prediction.threshold || 0) * 100)}% (scores above this are flagged)
              </Text>
            </View>
          </Card>
        )}
        
        {Object.keys(probabilities).length > 0 && (
          <Card>
            <Text style={styles.sectionLabel}>📊 Detailed Sound Breakdown</Text>
            <Text style={styles.subLabel}>These are the types of breathing sounds the AI checked for:</Text>
            {Object.entries(probabilities).map(([className, prob]) => (
              <View key={className} style={styles.probRow}>
                <Text style={styles.probLabel}>{className}</Text>
                <View style={styles.probBarContainer}>
                  <View style={[styles.probBar, { width: `${prob * 100}%`, backgroundColor: className === predictedClass ? statusColor : Colors.border }]} />
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
            This AI-generated result is a research prediction based on respiratory audio. It is not a medical diagnosis and has not been clinically validated. Please consult a qualified healthcare professional for diagnosis and treatment.
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
  summaryCard: { backgroundColor: '#F0F7FF', borderColor: Colors.primary, borderWidth: 1, marginBottom: 16 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginLeft: 8 },
  summaryText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  resultCard: { borderTopWidth: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  subLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
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
