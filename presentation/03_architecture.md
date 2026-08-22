# System Architecture

The system is designed with a strict decoupling of frontend capture and backend inference:

- **Frontend**: React Native Android application. Handles UI, JWT auth state, and native microphone hardware.
- **Backend API**: Python FastAPI deployed on Render. Handles heavy I/O, ML inference, and API routing.
- **Inference Engine**: Frozen PyTorch models analyzing `.wav` byte streams dynamically in-memory.
- **Database**: MongoDB Atlas. Stores user profiles, examination histories, and wellness metrics securely.
- **Reporting**: ReportLab PDF generation synthesizing inference data into professional printable formats.
