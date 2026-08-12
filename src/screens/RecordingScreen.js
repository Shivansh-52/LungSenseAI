import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RecordButton from '../components/RecordButton';
import AudioWave from '../components/AudioWave';
import { Colors } from '../constants/colors';
import audioService from '../services/audioService';

const MAX_DURATION = 15; // seconds

const RecordingScreen = () => {
  const navigation = useNavigation();
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [filePath, setFilePath] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    audioService.requestPermission();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev + 1 >= MAX_DURATION) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(0);
  };

  const startRecording = async () => {
    setRecording(true);
    setFilePath(null);
    setTimer(0);
    const path = await audioService.startRecording();
    setFilePath(path);
    startTimer();
  };

  const stopRecording = async () => {
    setRecording(false);
    stopTimer();
    await audioService.stopRecording();
  };

  const handleAnalyze = () => {
    navigation.navigate('Analysis', { audioPath: filePath });
  };

  const handlePlay = async () => {
    if (filePath) await audioService.play(filePath);
  };

  const formatTime = sec => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Sound</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Place the microphone near the chest and remain quiet.
        </Text>

        <View style={styles.waveContainer}>
          {recording ? (
            <AudioWave />
          ) : (
            <Icon name="microphone-outline" size={80} color={Colors.textSecondary} style={{ opacity: 0.3 }} />
          )}
        </View>

        <Text style={[styles.timer, recording && styles.timerActive]}>
          {formatTime(timer)} <Text style={styles.timerMax}>/ {formatTime(MAX_DURATION)}</Text>
        </Text>

        <View style={styles.recordButtonWrapper}>
          <RecordButton
            onPress={recording ? stopRecording : startRecording}
            disabled={recording && timer >= MAX_DURATION}
          />
        </View>

        {filePath && !recording && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.playBtn} onPress={handlePlay}>
              <Icon name="play-circle" size={24} color={Colors.primary} style={styles.actionIcon} />
              <Text style={styles.playBtnText}>Listen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
              <Text style={styles.analyzeBtnText}>Analyze Recording</Text>
              <Icon name="chevron-right" size={24} color={Colors.background} />
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  instruction: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 24,
  },
  waveContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: Colors.textSecondary,
    marginBottom: 50,
    fontVariant: ['tabular-nums'],
  },
  timerActive: {
    color: Colors.primary,
    fontWeight: '400',
  },
  timerMax: {
    fontSize: 24,
    color: Colors.textSecondary,
    opacity: 0.5,
  },
  recordButtonWrapper: {
    marginBottom: 40,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    marginRight: 8,
  },
  playBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  analyzeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
});

export default RecordingScreen;
