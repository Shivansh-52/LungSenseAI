import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

const dirs = Platform.OS === 'android' ? '/sdcard/' : '';

const requestPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'LungSense AI needs access to your microphone to record lung sounds.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission denied', 'Cannot record without microphone permission.');
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; // iOS permission handled by library (not used here)
};

const startRecording = async () => {
  const path = `${dirs}lungsense_record_${Date.now()}.mp4`;
  await audioRecorderPlayer.startRecorder(path);
  audioRecorderPlayer.addRecordBackListener(e => {
    // Can update UI if needed
    return e;
  });
  return path; // return file path for later use
};

const stopRecording = async () => {
  const result = await audioRecorderPlayer.stopRecorder();
  audioRecorderPlayer.removeRecordBackListener();
  return result; // result contains filePath
};

const play = async filePath => {
  await audioRecorderPlayer.startPlayer(filePath);
  audioRecorderPlayer.addPlayBackListener(e => {
    if (e.current_position >= e.duration) {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    }
    return e;
  });
};

const deleteRecording = async filePath => {
  // Simple delete using RNFS (if installed) – fallback to no‑op if not available
  try {
    const RNFS = require('react-native-fs');
    await RNFS.unlink(filePath);
  } catch (e) {
    console.warn('Delete failed or RNFS not installed', e);
  }
};

export default {
  requestPermission,
  startRecording,
  stopRecording,
  play,
  deleteRecording,
};
