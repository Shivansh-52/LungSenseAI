import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import Card from './Card';
import Icon from 'react-native-vector-icons/Ionicons';

const DoctorCard = ({ doctor, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={24} color={Colors.primary} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.name}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
          </View>
          {doctor.isDemo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>DEMO DATA</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.statText}>{doctor.rating}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{doctor.experience}</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="cash-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{doctor.consultationFee}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  demoBadge: {
    backgroundColor: '#FFF0F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFD6E7',
  },
  demoText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default DoctorCard;
