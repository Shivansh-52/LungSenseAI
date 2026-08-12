import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../constants/colors';
import DoctorCard from '../components/DoctorCard';
import SectionHeader from '../components/SectionHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { DEMO_DOCTORS, SPECIALTIES } from '../data/doctorData';

const DoctorsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={Colors.textSecondary} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search specialties, conditions..." 
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtiesScroll}>
          {SPECIALTIES.map((spec, idx) => (
            <TouchableOpacity key={idx} style={[styles.specialtyChip, idx === 0 && styles.specialtyChipActive]}>
              <Text style={[styles.specialtyText, idx === 0 && styles.specialtyTextActive]}>{spec}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="Recommended Specialists" />
        
        {DEMO_DOCTORS.map(doc => (
          <DoctorCard 
            key={doc.id} 
            doctor={doc} 
            onPress={() => {}} 
          />
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
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  specialtiesScroll: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialtyChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specialtyText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  specialtyTextActive: {
    color: '#fff',
  }
});

export default DoctorsScreen;
