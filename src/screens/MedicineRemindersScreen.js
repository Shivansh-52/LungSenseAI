import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, TextInput, Alert, Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MedicineRemindersScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadReminders();
    else setLoading(false);
  }, [isAuthenticated]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await api.getMedicineReminders();
      setReminders(data.reminders || []);
    } catch (err) {
      console.warn('Could not load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!medicineName.trim()) return Alert.alert('Error', 'Medicine name is required');
    setSaving(true);
    try {
      await api.createMedicineReminder({
        medicine_name: medicineName.trim(),
        dosage: dosage.trim(),
        schedule: schedule.trim(),
        notes: notes.trim(),
      });
      setShowModal(false);
      setMedicineName('');
      setDosage('');
      setSchedule('');
      setNotes('');
      await loadReminders();
    } catch (err) {
      Alert.alert('Error', 'Could not save reminder');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteMedicineReminder(id);
            await loadReminders();
          } catch (err) {
            Alert.alert('Error', 'Could not delete reminder');
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Icon name="medkit-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>Medicine Reminders</Text>
          <Text style={styles.emptySubText}>Login to manage your medicine reminders.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <Card style={styles.reminderCard}>
      <View style={styles.reminderHeader}>
        <View style={styles.pillIcon}>
          <Icon name="medkit" size={22} color={Colors.primary} />
        </View>
        <View style={styles.reminderInfo}>
          <Text style={styles.medicineName}>{item.medicine_name}</Text>
          {item.dosage ? <Text style={styles.dosageText}>{item.dosage}</Text> : null}
          {item.schedule ? <Text style={styles.scheduleText}>📅 {item.schedule}</Text> : null}
          {item.notes ? <Text style={styles.notesText}>{item.notes}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Icon name="trash-outline" size={20} color={Colors.warning} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Reminders</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
          <Icon name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimerBanner}>
        <Icon name="information-circle" size={16} color={Colors.textSecondary} />
        <Text style={styles.disclaimerText}>
          Enter medicines as prescribed by your healthcare professional. This app does not prescribe or recommend medicines.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      ) : reminders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="medkit-outline" size={60} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>No Reminders</Text>
          <Text style={styles.emptySubText}>Tap + to add a medicine reminder.</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medicine Reminder</Text>

            <Text style={styles.label}>Medicine Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Paracetamol" placeholderTextColor={Colors.textSecondary}
              value={medicineName} onChangeText={setMedicineName} />

            <Text style={styles.label}>Dosage</Text>
            <TextInput style={styles.input} placeholder="e.g. 500mg" placeholderTextColor={Colors.textSecondary}
              value={dosage} onChangeText={setDosage} />

            <Text style={styles.label}>Schedule</Text>
            <TextInput style={styles.input} placeholder="e.g. Twice daily after meals" placeholderTextColor={Colors.textSecondary}
              value={schedule} onChangeText={setSchedule} />

            <Text style={styles.label}>Notes</Text>
            <TextInput style={styles.input} placeholder="Optional notes" placeholderTextColor={Colors.textSecondary}
              value={notes} onChangeText={setNotes} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: { padding: 8 },
  disclaimerBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16,
    backgroundColor: '#FFF8E1', borderRadius: 8, borderWidth: 1, borderColor: '#FFE082',
  },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 8, flex: 1, lineHeight: 17 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary, marginTop: 16 },
  emptySubText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  loginButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 20 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listContent: { padding: 16 },
  reminderCard: { marginBottom: 10 },
  reminderHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  pillIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  reminderInfo: { flex: 1 },
  medicineName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  dosageText: { fontSize: 14, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  scheduleText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  notesText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { padding: 8 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, height: 46, fontSize: 15, color: Colors.textPrimary,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  cancelBtnText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: Colors.primary, marginLeft: 8 },
  saveBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

export default MedicineRemindersScreen;
