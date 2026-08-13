import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ReportsScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadReports();
    else setLoading(false);
  }, [isAuthenticated]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getMyReports();
      setReports(data.reports || []);
    } catch (err) {
      console.warn('Could not load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (examinationId) => {
    try {
      Alert.alert('PDF Report', 'Downloading your report...');
      await api.downloadExaminationPDF(examinationId);
      Alert.alert('Success', 'Report downloaded successfully.');
    } catch (err) {
      Alert.alert('Error', 'Could not download the report.');
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Icon name="document-text-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>My Reports</Text>
          <Text style={styles.emptySubText}>Login to access your examination reports and download PDFs.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    const dateStr = item.generated_at ? new Date(item.generated_at).toLocaleDateString() : 'Unknown date';
    return (
      <Card style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportIcon}>
            <Icon name="document-text" size={24} color={Colors.primary} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>Respiratory Analysis</Text>
            <Text style={styles.reportDate}>{dateStr}</Text>
            <Text style={styles.reportBadge}>AI Research Report</Text>
          </View>
        </View>
        <View style={styles.reportActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDownloadPDF(item.examination_id)}>
            <Icon name="download-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      ) : reports.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="document-text-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptySubText}>Complete a lung examination to generate your first report.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptySubText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  loginButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 20 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listContent: { padding: 16 },
  reportCard: { marginBottom: 12 },
  reportHeader: { flexDirection: 'row', alignItems: 'center' },
  reportIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  reportDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  reportBadge: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 4 },
  reportActions: {
    flexDirection: 'row', justifyContent: 'flex-end',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  actionText: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginLeft: 6 },
});

export default ReportsScreen;
