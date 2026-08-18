# STEP22_REPORT

## 1. Dashboard Architecture
The `HomeDashboardScreen` has been transformed into a comprehensive Wellness Dashboard. It fetches data dynamically via the `/wellness/today` endpoint, displaying a unified timeline, a calculated Wellness Score, and quick actions to log lifestyle activities. It successfully unifies respiratory examinations (still unmodified) with new general wellness features.

## 2. BMI
Implemented `BMIScreen` to calculate BMI based on height (cm) and weight (kg). BMI is clearly labeled as a general screening tool with no medical diagnosis claims. Calculations are handled client-side and saved via `PUT /health-profile` for authenticated users. Guests can use the calculator without persisting the data.

## 3. Step Tracking
Created a custom lightweight React Native Module (`StepCounterModule.kt`) bridging the Android `Sensor.TYPE_STEP_COUNTER` to Javascript via `DeviceEventManagerModule`. This avoids heavy third-party dependencies while providing real, device-based step counting if the device supports it. It correctly informs users if their hardware lacks the sensor.

## 4. Water Tracking
Implemented `HydrationScreen` that tracks daily intake in `ml`. Users can quick-add 250, 500, or 750ml. Entries are saved via `POST /wellness/water`. It emphasizes hydration targets as personal goals, not medical necessities.

## 5. Sleep Tracking
Implemented `SleepScreen` for manual entry (HH:MM). It calculates sleep duration safely including overnight crossing (e.g. 23:00 to 07:00). Logs are saved via `POST /wellness/sleep`. Disclaimer mentions consistent schedules are beneficial without guaranteeing specific health outcomes.

## 6. Activity Tracking
Implemented `ActivityScreen` covering types like Walking, Running, Cycling, Gym, Yoga. Saves duration in minutes via `POST /wellness/activity`.

## 7. Goals
Users can define step and water goals. Default is 8,000 steps and 2,500ml of water. Goals are managed via `GET/PUT /wellness/goals`.

## 8. Wellness Score
The backend calculates a transparent `Wellness Progress Score` (0-100) based strictly on completion percentages of daily steps, water, sleep (relative to 8h), and activity (relative to 30m). It maps to labels: "Needs Attention", "Moderate Progress", "Good Progress", "Excellent Progress". No medical risk terminology is used.

## 9. Routine
`RoutineScreen` displays general wellness tips split by time-of-day (Morning, Afternoon, Evening/Night) to encourage healthy lifestyle habits.

## 10. MongoDB Schema
Added new collections:
- `health_profiles`: { user_id, height_cm, weight_kg, bmi }
- `hydration`: { user_id, amount_ml, date }
- `sleep_logs`: { user_id, sleep_time, wake_time, duration_minutes, date }
- `daily_activity`: { user_id, activity_type, duration_minutes, date }
- `wellness_goals`: { user_id, daily_steps, daily_water_ml }

## 11. API Endpoints
Added to FastAPI Backend:
- `GET/PUT /health-profile`
- `GET /wellness/today`
- `GET/PUT /wellness/goals`
- `POST/GET /wellness/water`
- `POST/GET /wellness/sleep`
- `POST/GET /wellness/activity`

## 12. Security
All `user_id` fields are injected server-side by decoding the JWT provided in `Authorization: Bearer <token>`. The client NEVER passes `user_id` in request bodies, ensuring absolute data isolation and ownership enforcement.

## 13. Guest Restrictions
Guest users can view the dashboard, calculate BMI, and see the daily routine. However, any attempt to save water, sleep, activity, or goals triggers a polite alert requesting them to create an account. No local persistence was aggressively implemented to avoid syncing complexity as requested, graceful fallbacks are used.

## 14. Android Permissions
The `AndroidManifest.xml` was updated to include `android.permission.ACTIVITY_RECOGNITION`. The `StepsScreen` uses `PermissionsAndroid` to request this gracefully at runtime before initializing the sensor.

## 15. Testing
- **Backend:** Models serialize correctly, JWT validation ensures user isolation.
- **Frontend:** Guest restrictions verify correctly. The UI renders cleanly mirroring LungSenseAI aesthetics.

## 16. Known Limitations
- Background step tracking is currently not implemented (steps are counted accurately while the app/screen is active, but a persistent foreground service is needed for true background counting).
- Offline sync is limited to graceful guest degradation (saving fails gracefully with an alert if offline).
