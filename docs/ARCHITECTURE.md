# System Architecture

LungSenseAI utilizes a strictly decoupled, highly scalable architecture splitting native mobile interface, centralized web APIs, and a serverless database backend.

```text
       Android App (React Native)
             │
             │ HTTPS (Encrypted)
             ↓
       FastAPI Backend (Render)
             │
      Authentication (JWT)
             │
      ┌──────┴──────┐
      │             │
 ML Inference   Data Storage
      │             │
 ┌────┴────┐   MongoDB Atlas
 │         │        │
Sound   Disease     │
Model    Model      │
                    │
           History & Reports (PDF)
```

## System Components

### 1. Android Application
- Built natively using React Native.
- Interacts exclusively with the `/api` namespaces.
- Manages secure persistent JWT tokens locally.
- Captures raw `.wav` audio using native device hardware.

### 2. FastAPI Backend
- Hosted dynamically on Render.
- Orchestrates multi-model PyTorch inferencing efficiently in a single memory space.
- Validates structural data using Pydantic.
- Serves dynamic byte-streams for PDF report downloads via ReportLab.

### 3. Wellness APIs
Integrated into the FastAPI backend are dedicated wellness endpoints that calculate and aggregate:
- **BMI**: Derived from health profiles.
- **Steps**: Native pedometer integration.
- **Hydration**: Daily fluid tracking.
- **Sleep**: Duration logs.
- **Activity**: Granular activity tracking.
- **Goals**: Target constraints.
- **Wellness Score**: A dynamic 0-100 progress metric.
