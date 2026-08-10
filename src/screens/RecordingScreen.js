import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    // request permission on mount
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
    <View style={styles.container}>
      <Text style={styles.title}>Record Lung Sound</Text>
      {recording && <Text style={styles.recording}>Recording...</Text>}
      <Text style={styles.timer}>{formatTime(timer)}</Text>
      {recording && <AudioWave />}
      <RecordButton
        onPress={recording ? stopRecording : startRecording}
        disabled={recording && timer >= MAX_DURATION}
      />
      {filePath && !recording && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playBtn} onPress={handlePlay}>
            <Text style={styles.btnText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
            <Text style={styles.btnText}>Analyze Sound</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  recording: {
    fontSize: 16,
    color: Colors.warning,
    marginBottom: 8,
  },
  timer: {
    fontSize: 20,
    color: Colors.textPrimary,
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '80%',
  },
  playBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  btnText: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
});

export default RecordingScreen;
