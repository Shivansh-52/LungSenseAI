import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [isAuthenticated])
  );

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Fetch from authenticated endpoint
        const data = await api.getMyExaminations();
        setHistory(data.examinations || []);
      } else {
        // Fallback to legacy endpoint for guests
        const data = await api.getHistory();
        setHistory(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    // Handle both authenticated (examination) and legacy (history) formats
    const label = item.analysis?.predicted_class || item.label || 'Unknown';
    const confidence = item.analysis?.confidence || item.confidence || 0;
    const message = item.analysis?.message || item.message || '';
    const isNormal = label.toLowerCase().includes('normal') || label.toLowerCase().includes('healthy');
    const statusColor = isNormal ? Colors.success : Colors.warning;
    
    // Format timestamp
    let timeStr = 'Unknown date';
    const dateSource = item.recorded_at || item.timestamp;
    if (dateSource) {
      const date = new Date(dateSource);
      timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const handlePress = () => {
      if (isAuthenticated && item.id) {
        navigation.navigate('ExaminationDetail', { examination: item });
      }
    };

    return (
      <TouchableOpacity onPress={handlePress} disabled={!isAuthenticated} activeOpacity={0.7}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.dateText}>{timeStr}</Text>
            <Text style={[styles.confidence, { color: statusColor }]}>{Math.round(confidence * 100)}%</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.label, { color: statusColor }]}>{label}</Text>
            <Text style={styles.message} numberOfLines={2}>{message}</Text>
          </View>
          {isAuthenticated && item.id && (
            <View style={styles.cardFooter}>
              <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <View style={styles.placeholder} />
      </View>

      {!isAuthenticated && (
        <View style={styles.guestBanner}>
          <Icon name="information" size={18} color={Colors.primary} />
          <Text style={styles.guestBannerText}>Sign in to save and view your examination history.</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="history" size={60} color={Colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Text style={styles.emptyText}>No history available</Text>
          <Text style={styles.emptySubText}>Record your first respiratory sound to see past analyses here.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => item.id || item._id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  guestBannerText: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  confidence: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
});

export default HistoryScreen;
