# LungSenseAI v1.0.0 Release Notes

We are thrilled to announce the v1.0.0 release of LungSenseAI, the complete AI-assisted respiratory wellness research prototype.

## Key Features

### 🎙️ AI-Assisted Respiratory Analysis
- **Acoustic Classification**: Predicts Normal, Crackle, Wheeze, and Crackle+Wheeze patterns directly from `.wav` audio.
- **COPD-Associated Pattern Prediction**: A secondary inference model specifically trained to identify acoustic biomarkers associated with COPD (90.48% held-out accuracy).
- **In-App Recording**: Native Android audio recording.

### 📊 Health & Wellness Dashboard
- **Comprehensive Tracking**: Log Daily Steps, Hydration (ml), Sleep Duration, and varied Physical Activities.
- **BMI Calculator**: Instantly calculates and tracks Body Mass Index.
- **Wellness Score**: Automatically calculates a dynamic 0-100 progress score based on customizable daily goals.
- **Daily Routines**: Tailored morning, day, and evening wellness tips.

### 🔐 Security & Infrastructure
- **Secure Authentication**: JWT-based session management with strict patient data isolation.
- **Guest Mode**: Allows friction-free audio inference without requiring an account.
- **PDF Reports**: Generate downloadable, beautifully formatted clinical-style PDF reports.
- **Render Backend**: Deployed to a highly scalable FastAPI Python backend interacting with a secure MongoDB Atlas cluster.

## Security Hardening
- Complete IDOR protection via strict `user_id` scoped queries.
- Strict `finally` block implementations guarantee the destruction of temporary audio files on the server post-inference.
- Formal security audit successfully passed (Zero Critical Findings).

*Note: LungSenseAI is a research prototype. It is not clinically validated and does not replace professional medical diagnosis.*
