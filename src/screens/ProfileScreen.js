import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Guest View
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.guestHeader}>
            <View style={styles.avatarGuest}>
              <Icon name="person-outline" size={40} color={Colors.textSecondary} />
            </View>
            <Text style={styles.guestTitle}>Welcome to LungSense AI</Text>
            <Text style={styles.guestSubtitle}>
              Create an account to unlock health tracking, examination history, personalized wellness, and more.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              LungSense AI is an educational/research prototype. It does not provide medical diagnoses, treatment plans, or emergency services. Always consult a qualified healthcare professional.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authenticated View
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.full_name)}</Text>
          </View>
          <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        </View>

        <SectionHeader title="Lung Health" />
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('LungTab', { screen: 'History' })}>
            <Icon name="pulse" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>My Examinations</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Reports')}>
            <Icon name="document-text" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>My Reports</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Removed Health & Wellness Section */}

        <SectionHeader title="Settings" />
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Privacy')}>
            <Icon name="shield-checkmark" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>Privacy & Data</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <Icon name="information-circle" size={24} color={Colors.primary} />
            <Text style={styles.menuText}>About LungSense AI</Text>
            <Icon name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Icon name="log-out" size={24} color={Colors.warning} />
            <Text style={[styles.menuText, { color: Colors.warning }]}>Logout</Text>
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
  // Guest styles
  guestHeader: {
    alignItems: 'center',
    marginVertical: 40,
  },
  avatarGuest: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 24,
    width: '80%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 12,
    width: '80%',
    alignItems: 'center',
  },
  registerBtnText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Authenticated styles
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
    marginLeft: 56,
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
