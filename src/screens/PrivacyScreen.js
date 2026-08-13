import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PrivacyScreen = ({ navigation }) => {
  const { isAuthenticated, logout } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data including examinations, health metrics, reports, and wellness plans. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
              await logout();
              Alert.alert('Account Deleted', 'Your account and all data have been deleted.');
            } catch (err) {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Data</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            LungSense AI is an educational/research prototype. Your health data, examination records,
            and personal information are stored securely in our database to provide personalized health
            tracking and examination history.
          </Text>
          <Text style={styles.paragraph}>
            We do not share your health data with third parties. Your examination audio files are
            processed for analysis only and are not stored permanently.
          </Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Data Usage</Text>
          <Text style={styles.paragraph}>
            We collect and store the following data to provide our services:
          </Text>
          <Text style={styles.bulletItem}>• Account information (name, email)</Text>
          <Text style={styles.bulletItem}>• Health profile (height, weight, goals)</Text>
          <Text style={styles.bulletItem}>• Examination results and analysis</Text>
          <Text style={styles.bulletItem}>• Health metrics (steps, water, sleep, weight)</Text>
          <Text style={styles.bulletItem}>• Medicine reminders</Text>
          <Text style={styles.bulletItem}>• Wellness plan preferences</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Terms</Text>
          <Text style={styles.paragraph}>
            This application is an AI research/educational prototype. It does NOT provide medical
            diagnoses, treatment plans, or emergency services. Always consult a qualified healthcare
            professional for medical concerns.
          </Text>
          <Text style={styles.paragraph}>
            By using this application, you acknowledge that AI analysis results are based on machine
            learning models and may not reflect actual medical conditions.
          </Text>
        </Card>

        {isAuthenticated && (
          <Card style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Icon name="trash" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Delete My Account & All Data</Text>
            </TouchableOpacity>
            <Text style={styles.deleteWarning}>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </Text>
          </Card>
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
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  paragraph: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 10 },
  bulletItem: { fontSize: 14, color: Colors.textSecondary, lineHeight: 24, marginLeft: 8 },
  dangerCard: { borderWidth: 1, borderColor: '#FFD6D6', backgroundColor: '#FFF5F5' },
  dangerTitle: { fontSize: 17, fontWeight: '700', color: Colors.warning, marginBottom: 16 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.warning, borderRadius: 12, paddingVertical: 14,
  },
  deleteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 },
  deleteWarning: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});

export default PrivacyScreen;
