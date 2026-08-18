# API Documentation

All protected endpoints require the following header:
`Authorization: Bearer <JWT_TOKEN>`

## Authentication
### `POST /auth/register`
- **Purpose**: Create a new user account.
- **Request**: `{"email": "...", "password": "...", "name": "..."}`
- **Response**: User object.

### `POST /auth/login`
- **Purpose**: Authenticate user and receive JWT.
- **Request**: `{"email": "...", "password": "..."}`
- **Response**: `{"access_token": "...", "token_type": "bearer"}`

## Predictions
### `POST /predict`
- **Purpose**: Upload `.wav` audio. Performs respiratory sound inference. Guest compatible.
- **Request**: `multipart/form-data` with `audio` file.
- **Response**: AI pattern classification and probabilities.

### `POST /predict/disease`
- **Purpose**: Standalone disease evaluation.
- **Request**: `multipart/form-data` with `audio` file.
- **Response**: COPD-associated pattern prediction.

## Examinations
### `GET /examinations`
- **Purpose**: Fetch authenticated user's history.
- **Auth**: Required.
- **Response**: List of past examinations.

### `GET /examinations/{id}`
- **Purpose**: Fetch specific examination details.
- **Auth**: Required.

### `DELETE /examinations/{id}`
- **Purpose**: Delete examination record securely.
- **Auth**: Required.

### `GET /examinations/{id}/report`
- **Purpose**: Download PDF report byte-stream.
- **Auth**: Required.

### `GET /examinations/{id}/report-data`
- **Purpose**: Structured JSON for report visualization.
- **Auth**: Required.

## System
### `GET /health`
- **Purpose**: Liveness probe checking MongoDB and PyTorch model loaded states.
- **Auth**: None.
- **Response**: `{"status": "healthy", ...}`
