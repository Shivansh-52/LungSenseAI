import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const analyzeAudio = async (audioFilePath) => {
  const formData = new FormData();
  const filename = audioFilePath.split('/').pop();
  const file = {
    uri: Platform.OS === 'android' ? `file://${audioFilePath}` : audioFilePath,
    name: filename,
    type: 'audio/mp4', // assuming mp4 container from recorder
  };
  formData.append('file', file);

  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // NOTE: Do NOT set Content-Type; fetch will set multipart boundary automatically
      },
    });
    const json = await response.json();
    return json;
  } catch (err) {
    console.warn('API error:', err);
    throw err;
  }
};
