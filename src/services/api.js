import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

// ── Token management ─────────────────────────────────────────────────────────

let authToken = null;
let logoutCallback = null; // A callback to force logout on 401

const setAuthToken = (token) => {
  authToken = token;
};

const getAuthToken = () => authToken;

const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const getHeaders = (includeAuth = false, contentType = 'application/json') => {
  const headers = { Accept: 'application/json' };
  if (contentType) headers['Content-Type'] = contentType;
  if (includeAuth && authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    if (logoutCallback) {
      logoutCallback();
    }
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {}
    
    // Fallback if backend returns standard error wrapping: { success: false, error: { message: "..." } }
    let errorMsg = errorData.detail;
    if (errorData.error && errorData.error.message) {
      errorMsg = errorData.error.message;
    }
    
    const err = new Error(errorMsg || `Request failed (${response.status})`);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }
  return response.json();
};


// ── Auth endpoints ───────────────────────────────────────────────────────────

const register = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
  return handleResponse(response);
};

const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

const getMe = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};


// ── Prediction & Examination endpoints ───────────────────────────────────────

const predictAudio = async (audioFilePath, saveExam = true) => {
  const formData = new FormData();
  const filename = audioFilePath.split('/').pop() || 'recording.mp4';
  const ext = filename.split('.').pop();
  
  // React Native FormData requires { uri, name, type }
  const file = {
    uri: Platform.OS === 'android' ? `file://${audioFilePath}` : audioFilePath,
    name: filename,
    type: `audio/${ext === 'mp4' ? 'mp4' : 'wav'}`,
  };
  formData.append('audio', file);

  try {
    const response = await fetch(`${API_BASE_URL}/predict?save_exam=${saveExam ? 'true' : 'false'}`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        // Do NOT set Content-Type explicitly; fetch sets the multipart boundary automatically
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
    });
    return handleResponse(response);
  } catch (err) {
    if (!err.status) {
      throw new Error('Unable to connect to LungSenseAI. Please check your internet connection and try again.');
    }
    throw err;
  }
};

const predictDiseaseAudio = async (audioFilePath) => {
  const formData = new FormData();
  const filename = audioFilePath.split('/').pop() || 'recording.mp4';
  const ext = filename.split('.').pop();
  
  const file = {
    uri: Platform.OS === 'android' ? `file://${audioFilePath}` : audioFilePath,
    name: filename,
    type: `audio/${ext === 'mp4' ? 'mp4' : 'wav'}`,
  };
  formData.append('audio', file);

  try {
    const response = await fetch(`${API_BASE_URL}/predict/disease`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
    });
    return handleResponse(response);
  } catch (err) {
    if (!err.status) {
      throw new Error('Unable to connect to LungSenseAI. Please check your internet connection and try again.');
    }
    throw err;
  }
};

const saveExamination = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/examinations`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

const getExaminations = async (page = 1, pageSize = 20) => {
  const response = await fetch(`${API_BASE_URL}/examinations?page=${page}&page_size=${pageSize}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const getExamination = async (id) => {
  const response = await fetch(`${API_BASE_URL}/examinations/${id}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const deleteExamination = async (id) => {
  const response = await fetch(`${API_BASE_URL}/examinations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ── Report endpoints ─────────────────────────────────────────────────────────

const getReportData = async (examinationId) => {
  const response = await fetch(`${API_BASE_URL}/examinations/${examinationId}/report-data`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

// ── Wellness & Health Endpoints ──────────────────────────────────────────────

const getHealthProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/health-profile`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const updateHealthProfile = async (data) => {
  const response = await fetch(`${API_BASE_URL}/health-profile`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const getWellnessToday = async (dateStr) => {
  const response = await fetch(`${API_BASE_URL}/wellness/today?date=${dateStr}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const getWellnessGoals = async () => {
  const response = await fetch(`${API_BASE_URL}/wellness/goals`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const updateWellnessGoals = async (data) => {
  const response = await fetch(`${API_BASE_URL}/wellness/goals`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const addWaterEntry = async (data) => {
  const response = await fetch(`${API_BASE_URL}/wellness/water`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const addSleepEntry = async (data) => {
  const response = await fetch(`${API_BASE_URL}/wellness/sleep`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const addActivityEntry = async (data) => {
  const response = await fetch(`${API_BASE_URL}/wellness/activity`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};


export default {
  setAuthToken,
  getAuthToken,
  setLogoutCallback,
  register,
  login,
  getMe,
  predictAudio,
  predictDiseaseAudio,
  saveExamination,
  getExaminations,
  getExamination,
  deleteExamination,
  getReportData,
  getHealthProfile,
  updateHealthProfile,
  getWellnessToday,
  getWellnessGoals,
  updateWellnessGoals,
  addWaterEntry,
  addSleepEntry,
  addActivityEntry,
  API_BASE_URL,
};
