# STEP 21: Android API Integration Report

This report documents the integration of the React Native Android application with the production Render FastAPI backend.

## 1. API Integration
A centralized configuration file was created at `src/config/api.js` to store the API base URL and connection parameters. The `src/services/api.js` service layer was fully refactored to remove all mock data, routing all API calls to the real backend. All HTTP requests utilize the standard `fetch` API. 

## 2. Production URL
The frontend application is now configured to point strictly to the HTTPS URL generated in Step 20: `https://lungsenseai-api.onrender.com`.

## 3. Authentication Integration
The `AuthContext.js` utilizes `@react-native-async-storage/async-storage` for local token persistence. It safely restores user sessions on app launch by fetching `/auth/me`. Expired sessions returning `HTTP 401 Unauthorized` are gracefully trapped by an interceptor in `api.js` that cascades a secure logout, clearing device storage and routing the user to the Login screen. The `LoginScreen` and `RegisterScreen` now authenticate against MongoDB Atlas via the backend.

## 4. Guest Flow
The `AppNavigator.js` logic was refactored to enforce strict separation. Guests are provided a restricted `Home` dashboard where they can run new examinations. Features like Examination History, PDF Generation, and Profile Details are locked; attempting to access detailed result screens automatically prompts guests to log in or create an account. 

## 5. Authenticated Flow
Logged-in users have full access to the `ExaminationDetailScreen`, `HistoryScreen`, and `ProfileScreen`. Examination results are automatically saved to their MongoDB account via `POST /examinations`.

## 6. Audio Upload
Audio recorded natively on the Android device via `react-native-audio-recorder-player` is packaged as `multipart/form-data`. The file is extracted from the local device cache and safely streamed to `POST /predict`.

## 7. Prediction Flow
The AI results screen was fully sanitized. The `ResultScreen.js` now strictly reports the "Respiratory sound classification" alongside its confidence percentage and probability distribution, strictly adhering to the API specification. All diagnostic medical wording (like "pneumonia") was purged.

## 8. History
The `HistoryScreen.js` dynamically pulls all examinations via `GET /examinations` and maps the API-standard JSON list. It securely renders dates, AI classifications, and confidence bounds, providing immediate tap access to deeper insights.

## 9. PDF
The PDF generation endpoint `GET /examinations/{id}/report/pdf` is integrated into the `ExaminationDetailScreen.js`. The byte stream triggers successfully for authenticated users.

## 10. Error Handling
Global API error boundaries intercept `500 Server Errors` and `413 Payload Too Large` from the prediction endpoint. Instead of application crashes or blank screens, React Native smoothly alerts the user with: "Analysis failed. Please check your connection and try again."

## 11. Android Testing
Simulated tests ensure:
- Safe handling of missing microphones (`AudioRecorderPlayer` permissions).
- Network disconnections trap appropriately via `catch` blocks.
- App routes dynamically prune restricted Tabs from the Bottom Navigator when unauthenticated.

## 12. Known Limitations
- The underlying `react-native-fs` plugin is necessary to actually invoke Android's file system UI. While the PDF API triggers flawlessly, the file download natively might require the developer to configure `react-native-blob-util` before releasing to the Google Play Store.
- First-time cold starts against the Render free-tier might trigger the application's connection timeout (configured securely up to 30 seconds to tolerate PyTorch boot times).
