import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import Card from '../components/Card';

const { width } = Dimensions.get('window');

const LungDashboardScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lung Analysis</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Record a short respiratory sound for analysis.</Text>

        <TouchableOpacity 
          style={styles.microphoneContainer} 
          onPress={() => navigation.navigate('Recording')}
          activeOpacity={0.8}
        >
          <View style={styles.micBgOuter}>
            <View style={styles.micBgInner}>
              <Icon name="microphone" size={60} color="#fff" />
            </View>
          </View>
          <Text style={styles.primaryButtonText}>Record Lung Sound</Text>
        </TouchableOpacity>

        <View style={styles.cardsContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('History')} style={{width: '100%'}}>
            <Card style={styles.historyCard}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Icon name="history" size={24} color={Colors.primary} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Analysis History</Text>
                  <Text style={styles.cardSub}>View past respiratory recordings</Text>
                </View>
                <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          ⚠️ Research/educational prototype. This result does not provide a medical diagnosis.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  microphoneContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  micBgOuter: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  micBgInner: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardsContainer: {
    width: '100%',
  },
  historyCard: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LungDashboardScreen;
