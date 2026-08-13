# LungSense AI

AI-powered respiratory sound analysis — educational/research prototype.

## Architecture

```
                LungSense AI
                     │
          ┌──────────┴──────────┐
          │                     │
      Guest User          Authenticated User
          │                     │
    Record Audio          Full Dashboard
          │                     │
    Basic Result          Health Tracking
                                │
                          Lung Examination
                                │
                          AI Analysis
                                │
                       Wellness Routine
                                │
                          PDF Report
                                │
                         MongoDB Atlas
                                │
                           FastAPI
                                │
                          Future ICBHI
                             Model
```

**Stack:**
- **Android**: React Native CLI (0.73.4)
- **Backend**: Python, FastAPI, Pydantic, JWT
- **Database**: MongoDB Atlas
- **PDF**: ReportLab
- **Auth**: JWT (python-jose) + bcrypt (passlib)

## Features

### Guest Mode (No Login Required)
- Record lung sounds
- Receive basic AI analysis result
- BMI calculator
- View demo doctor profiles
- Browse the app freely

### Authenticated Mode
- **Full Health Dashboard** — personalized greeting, real-time metrics
- **Examination History** — saved to MongoDB, user-scoped
- **Detailed Examination Reports** — pattern, confidence, duration, model version
- **PDF Reports** — professional ReportLab-generated PDFs
- **Wellness Routine** — personalized morning/day/night plan
- **Health Tracking** — steps, water, sleep, weight, activity, nutrition
- **Medicine Reminders** — CRUD with no prescriptions
- **User Profile** — real data, settings, logout, delete account
- **Privacy & Data Management** — view policies, delete data

## Project Structure

```
LungSenseAI/
├── App.js                          # Root with AuthProvider
├── src/
│   ├── context/AuthContext.js      # Auth state management
│   ├── navigation/AppNavigator.js  # Tab + Stack navigation
│   ├── screens/
│   │   ├── HomeDashboardScreen.js  # Main dashboard
│   │   ├── LungDashboardScreen.js  # Lung analysis entry
│   │   ├── RecordingScreen.js      # Audio recording
│   │   ├── AnalysisScreen.js       # Processing animation
│   │   ├── ResultScreen.js         # Result + guest CTA
│   │   ├── HistoryScreen.js        # Examination history
│   │   ├── HealthDashboardScreen.js# Health metrics + BMI
│   │   ├── DoctorsScreen.js        # Demo doctor profiles
│   │   ├── ProfileScreen.js        # User profile + menu
│   │   ├── LoginScreen.js          # Login
│   │   ├── RegisterScreen.js       # Registration
│   │   ├── OnboardingScreen.js     # Health profile setup
│   │   ├── WellnessScreen.js       # Wellness routine
│   │   ├── ReportsScreen.js        # My reports
│   │   ├── MedicineRemindersScreen.js # Medicine reminders
│   │   ├── ExaminationDetailScreen.js # Exam detail
│   │   └── PrivacyScreen.js        # Privacy + delete
│   ├── components/                 # Reusable UI components
│   ├── services/
│   │   ├── api.js                  # Centralized API client
│   │   ├── audioService.js         # Microphone recording
│   │   └── storageService.js       # AsyncStorage helpers
│   ├── constants/colors.js         # Design system colors
│   ├── data/                       # Demo/mock data
│   └── utils/                      # Calculations, mock prediction
├── backend/
│   ├── main.py                     # FastAPI app + preserved endpoints
│   ├── config.py                   # Environment config loader
│   ├── database.py                 # MongoDB connection + indexes
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Env template (safe to commit)
│   ├── models/                     # MongoDB document serializers
│   ├── schemas/                    # Pydantic request/response models
│   ├── routes/                     # API endpoint handlers
│   │   ├── auth.py, users.py, examinations.py
│   │   ├── health.py, wellness.py, reports.py, medicines.py
│   ├── services/                   # Business logic
│   │   ├── auth_service.py, examination_service.py
│   │   ├── wellness_service.py, report_service.py
│   └── utils/
│       ├── security.py             # JWT + bcrypt
│       └── dependencies.py         # FastAPI auth dependencies
└── android/                        # Android native project
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- Android Studio + SDK
- React Native CLI

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret

# Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Android Setup

```bash
# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on device/emulator
npx react-native run-android
```

### MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist your IP address
4. Copy the connection string to `backend/.env` as `MONGODB_URI`
5. Database name: `lungsense_ai`

Collections are created automatically on first use.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster/db` |
| `DATABASE_NAME` | Database name | `lungsense_ai` |
| `JWT_SECRET_KEY` | Secret key for JWT signing | Random 32+ char string |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `60` |

**⚠️ Never commit the `.env` file. Use `.env.example` as a template.**

## API Endpoints

### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Yes | Get current user |
| POST | `/auth/logout` | No | Logout (stateless) |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Yes | Profile + health profile |
| PUT | `/users/me` | Yes | Update profile |
| DELETE | `/users/me` | Yes | Delete account + all data |
| POST | `/users/health-profile` | Yes | Create/update health profile |

### Examinations
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/examinations` | Yes | Save examination |
| GET | `/examinations/my` | Yes | List user's examinations |
| GET | `/examinations/{id}` | Yes | Get examination detail |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/health/metrics` | Yes | Save health metric |
| GET | `/health/metrics` | Yes | Get all metrics |
| GET | `/health/metrics/{type}` | Yes | Get metrics by type |
| POST | `/health/bmi` | No | Calculate BMI |

### Wellness & Reports
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wellness/plan` | Yes | Get wellness routine |
| GET | `/reports/my` | Yes | List reports |
| GET | `/reports/examination/{id}/pdf` | Yes | Download PDF |

### Medicines
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/medicines` | Yes | Create reminder |
| GET | `/medicines` | Yes | List reminders |
| PUT | `/medicines/{id}` | Yes | Update reminder |
| DELETE | `/medicines/{id}` | Yes | Delete reminder |

### Preserved Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/predict` | No | Analyze audio (mock) |
| POST | `/history` | No | Save history (legacy) |
| GET | `/history` | No | Get history (legacy) |

## Database Collections

| Collection | Indexes |
|---|---|
| `users` | `email` (unique) |
| `health_profiles` | `user_id` |
| `lung_examinations` | `user_id`, `(user_id, recorded_at)` |
| `lung_analysis_results` | `examination_id` |
| `health_metrics` | `user_id`, `(user_id, metric_type)` |
| `medicine_reminders` | `user_id` |
| `wellness_plans` | `user_id` |
| `reports` | `user_id`, `examination_id` |
| `appointments` | `user_id` (future) |

## Security

- JWT authentication with bcrypt password hashing
- User ownership verification on all data access
- Environment variables for secrets (never in code)
- Token stored in AsyncStorage (production: use react-native-keychain)
- MongoDB Atlas credentials never in mobile app
- CORS configured for development
- Input validation via Pydantic

## Current Mock Data

- `/predict` returns dummy Wheeze/Normal/Crackle results
- Demo doctor profiles (clearly labeled "DEMO — NOT REAL")
- Health dashboard uses mock activity data

## Future Integrations

- **ICBHI CNN Model** — real respiratory sound classification
- **Doctor Directory** — legitimate telemedicine provider API
- **Doctor Review** — verified healthcare professional report review
- **Push Notifications** — medicine reminders, health alerts
- **Real Health Device Integration** — step counters, sleep trackers
- **Refresh Tokens** — token rotation for enhanced security

## Medical Safety

This is an **AI research/educational prototype**.

- Never claims medical diagnoses
- Never prescribes medicines
- Never creates fake doctor credentials
- All reports labeled "AI RESEARCH / EDUCATIONAL REPORT"
- All results use "sound pattern detected" language
- Wellness plans labeled "General guidance — not medical advice"

## License

Educational/Research Prototype — Not for clinical use.
