import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="brain" size={40} color={Colors.primary} />
        <Text style={styles.title}>LungSense <Text style={styles.titleHighlight}>AI</Text></Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconGlow}>
            <Icon name="stethoscope" size={90} color={Colors.primary} />
          </View>
        </View>

        <Text style={styles.subtitle}>Advanced Respiratory Analysis</Text>
        <Text style={styles.description}>
          Record a short breath sample. Our AI will analyze the audio to detect potential respiratory sound patterns.
        </Text>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('Recording')}
          activeOpacity={0.8}
        >
          <Icon name="microphone" size={24} color={Colors.background} style={styles.btnIcon} />
          <Text style={styles.primaryButtonText}>Start New Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Icon name="history" size={24} color={Colors.textPrimary} style={styles.btnIcon} />
          <Text style={styles.secondaryButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          ⚠️ For educational and research purposes only. Not a medical diagnosis tool.
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  titleHighlight: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 10,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 18,
  },
});

export default HomeScreen;
