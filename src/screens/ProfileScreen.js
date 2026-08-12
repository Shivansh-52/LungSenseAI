import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
          
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Health & App" />
        
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="document-text" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Health Records</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="notifications" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Medicine Reminders</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="settings" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Settings</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <SectionHeader title="About" />
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="shield-checkmark" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="information-circle" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>About LungSense AI</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            LungSense AI is an educational/research prototype. It does not provide medical diagnoses, treatment plans, or emergency services. Always consult a qualified healthcare professional.
          </Text>
        </View>
        
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
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editBtnText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56, // Align with text
  },
  disclaimerContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#FFF0F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD6E7',
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    lineHeight: 18,
  }
});

export default ProfileScreen;
