# LungSense AI v1.0.0

An AI-powered respiratory sound analysis platform and wellness dashboard — designed as an educational/research prototype.

## Architecture

```
                LungSense AI (React Native App)
                      │
               [ HTTPS REST API ]
                      │
            FastAPI Backend (Render)
                      │
   ┌──────────────────┼──────────────────┐
   │                  │                  │
 Auth/Security   ML Inference      Data Storage
 (JWT/bcrypt)    (PyTorch CNN)   (MongoDB Atlas)
```

**Technology Stack:**
- **Android App**: React Native CLI (0.73.4)
- **Backend API**: Python, FastAPI, Pydantic
- **Machine Learning**: PyTorch, Librosa, Torchaudio
- **Database**: MongoDB Atlas
- **PDF Generation**: ReportLab
- **Authentication**: JWT (python-jose), bcrypt (passlib)

## Machine Learning Models
Both models are **frozen** and run dynamically within the FastAPI backend.

1. **Respiratory Sound Classification Model**:
   - Architecture: CNN + BiLSTM
   - State: FROZEN
2. **Disease Prediction Model (COPD)**:
   - Architecture: CNN + BiLSTM
   - Version: `LungSenseAI-COPD-v1.0`
   - Threshold: `0.70`
   - Aggregation: `Mean`
   - SHA-256 Hash: `8b02089bba87216ced5131c989fc2e14cd4b87651669eaf37d9bfc5287184a6a`

## Features

### Guest Mode
- Record and upload lung sounds for immediate, non-persisted AI analysis.
- Basic BMI calculator and generic daily routine tips.

### Authenticated Flow
- **Complete Examination Workflow**: Record audio, receive comprehensive sound and disease analysis, and save the record persistently.
- **Examination History**: View past AI predictions scoped securely to your user ID.
- **PDF Generation**: Download a professional ReportLab-generated PDF containing examination details and safe medical disclaimers.
- **Wellness Tracking**: Log steps, hydration, sleep, and physical activity.
- **Medicine Reminders**: Manage daily medicine notifications.
- **Health Profile**: Automatically calculated wellness score based on customized daily goals.
- **Privacy Controls**: Complete user data isolation and instant account deletion capabilities.

## Setup

### Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Android Setup (React Native)
```bash
# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run Android build
npx react-native run-android
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas string | `mongodb+srv://user:pass@cluster...` |
| `DATABASE_NAME` | Database name | `lungsense_ai` |
| `JWT_SECRET_KEY` | JWT signing secret | `your-secure-256-bit-secret` |
| `JWT_ALGORITHM` | Algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Expiration | `1440` |
| `MAX_UPLOAD_SIZE_MB` | Upload constraint | `10` |

*Security Note: Never commit production `.env` files to Git. `backend/.env.example` provides a safe template.*

## API Endpoints

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Authenticate and receive JWT
- `GET /auth/me` - Validate session

### Prediction & Examinations
- `POST /predict` - Upload `.wav` audio. Performs inference. Guest compatible.
- `POST /predict/disease` - Upload `.wav` audio for standalone disease evaluation.
- `GET /examinations` - Fetch authenticated user's history
- `GET /examinations/{id}` - Fetch specific examination details
- `DELETE /examinations/{id}` - Delete examination record
- `GET /examinations/{id}/report` - Download PDF report

### Wellness & Profile
- `POST /health/metrics` - Submit health metrics
- `POST /health/bmi` - BMI Calculator
- `GET /wellness/today` - Retrieve current wellness score and daily progress
- `GET /wellness/goals` - Fetch/Update daily targets

### System
- `GET /health` - Liveness probe checking MongoDB and PyTorch model loaded states

## Production Deployment
The production application is configured to run automatically on a Render Web Service.
1. Specify `backend` as the Root Directory.
2. Use the standard Python environment.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Inject all Production Environment Variables securely via the Render Dashboard.

## Medical Safety Limitations (CRITICAL)
This system is an **educational and research prototype**.
1. **Not Clinically Validated**: The disease model was trained on public datasets (ICBHI) and is not intended for real-world clinical application.
2. **Not a Diagnosis**: The application never explicitly diagnoses COPD. All results represent a "COPD-associated probability".
3. **Non-COPD ≠ Healthy**: A negative detection does not rule out asthma, pneumonia, or other respiratory illnesses.
4. **Professional Evaluation Required**: This tool does not replace professional medical evaluation, diagnosis, or treatment.
