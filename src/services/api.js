import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

// ── Token management ─────────────────────────────────────────────────────────

let authToken = null;

const setAuthToken = (token) => {
  authToken = token;
};

const getAuthToken = () => authToken;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getHeaders = (includeAuth = false, contentType = 'application/json') => {
  const headers = { Accept: 'application/json' };
  if (contentType) headers['Content-Type'] = contentType;
  if (includeAuth && authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid — caller should handle logout
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.detail || `Request failed (${response.status})`);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }
  return response.json();
};


// ── Auth endpoints ───────────────────────────────────────────────────────────

const register = async (fullName, email, password, confirmPassword) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
    }),
  });
  return handleResponse(response);
};

const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

const getMe = async () => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const logout = async () => {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(true),
    });
  } catch (e) {
    // Ignore — stateless JWT
  }
};


// ── User endpoints ───────────────────────────────────────────────────────────

const getMyProfile = async () => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const updateProfile = async (data) => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const deleteAccount = async () => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const saveHealthProfile = async (data) => {
  const response = await fetch(`${BASE_URL}/users/health-profile`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};


// ── Examination endpoints ────────────────────────────────────────────────────

const saveExamination = async (data) => {
  const response = await fetch(`${BASE_URL}/examinations`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const getMyExaminations = async () => {
  const response = await fetch(`${BASE_URL}/examinations/my`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const getExamination = async (id) => {
  const response = await fetch(`${BASE_URL}/examinations/${id}`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};


// ── Health endpoints ─────────────────────────────────────────────────────────

const saveHealthMetric = async (metricType, value, unit = '') => {
  const response = await fetch(`${BASE_URL}/health/metrics`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ metric_type: metricType, value, unit }),
  });
  return handleResponse(response);
};

const getHealthMetrics = async (metricType = null) => {
  let url = `${BASE_URL}/health/metrics`;
  if (metricType) url += `?metric_type=${metricType}`;
  const response = await fetch(url, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const calculateBMI = async (height, weight) => {
  const response = await fetch(`${BASE_URL}/health/bmi`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ height, weight }),
  });
  return handleResponse(response);
};


// ── Wellness endpoints ───────────────────────────────────────────────────────

const getWellnessPlan = async () => {
  const response = await fetch(`${BASE_URL}/wellness/plan`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};


// ── Report endpoints ─────────────────────────────────────────────────────────

const getMyReports = async () => {
  const response = await fetch(`${BASE_URL}/reports/my`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const downloadExaminationPDF = async (examinationId) => {
  const response = await fetch(`${BASE_URL}/reports/examination/${examinationId}/pdf`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  if (!response.ok) {
    throw new Error('Failed to download PDF');
  }
  // Return the blob for saving
  const blob = await response.blob();
  return blob;
};


// ── Medicine endpoints ───────────────────────────────────────────────────────

const getMedicineReminders = async () => {
  const response = await fetch(`${BASE_URL}/medicines`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

const createMedicineReminder = async (data) => {
  const response = await fetch(`${BASE_URL}/medicines`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

const deleteMedicineReminder = async (id) => {
  const response = await fetch(`${BASE_URL}/medicines/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  return handleResponse(response);
};


// ── Preserved original endpoints ─────────────────────────────────────────────

const analyzeAudio = async (audioFilePath) => {
  const formData = new FormData();
  const filename = audioFilePath.split('/').pop();
  const file = {
    uri: Platform.OS === 'android' ? `file://${audioFilePath}` : audioFilePath,
    name: filename,
    type: 'audio/mp4',
  };
  formData.append('file', file);

  try {
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
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

const saveHistory = async (result) => {
  try {
    const response = await fetch(`${BASE_URL}/history`, {
      method: 'POST',
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.warn('Could not save history', err);
    throw err;
  }
};

const getHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/history`);
    const json = await response.json();
    return json.history || [];
  } catch (err) {
    console.warn('Could not fetch history', err);
    return [];
  }
};


export default {
  // Token management
  setAuthToken,
  getAuthToken,
  // Auth
  register,
  login,
  getMe,
  logout,
  // User
  getMyProfile,
  updateProfile,
  deleteAccount,
  saveHealthProfile,
  // Examinations
  saveExamination,
  getMyExaminations,
  getExamination,
  // Health
  saveHealthMetric,
  getHealthMetrics,
  calculateBMI,
  // Wellness
  getWellnessPlan,
  // Reports
  getMyReports,
  downloadExaminationPDF,
  // Medicines
  getMedicineReminders,
  createMedicineReminder,
  deleteMedicineReminder,
  // Preserved originals
  analyzeAudio,
  saveHistory,
  getHistory,
};
