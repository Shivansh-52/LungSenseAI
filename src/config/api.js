// src/config/api.js

/**
 * PRODUCTION URL:
 * Replace <ACTUAL_RENDER_HTTPS_URL> with the real Render deployment URL.
 * Example: https://lungsenseai-api.onrender.com
 * 
 * DEVELOPMENT URL (for local backend testing via emulator):
 * 'http://10.0.2.2:8000'
 */

// Replace this with the real URL from Step 20
export const API_BASE_URL = 'https://lungsenseai-api.onrender.com';

// Configure timeouts (ms)
export const TIMEOUTS = {
  CONNECT: 10000,
  UPLOAD: 30000,
  RESPONSE: 30000,
};
