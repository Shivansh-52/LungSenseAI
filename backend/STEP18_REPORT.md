# STEP 18: Application Architecture & Examination History Report

## 1. MongoDB Architecture
The backend uses **MongoDB Atlas** as its cloud database, interacting asynchronously using the `motor` engine (`AsyncIOMotorClient`). The database connection is handled globally via `app.db.mongodb.py`, which is established during FastAPI's `startup` event and cleanly closed during the `shutdown` event.

## 2. Database Collections
The database is named `lungsenseai` and relies primarily on two main collections for this phase:
- **`users`**: Stores registered user details, credentials (hashed), and metadata.
- **`examinations`**: Stores historical lung sound prediction results, bounding them either to users or tagging them as guest predictions if generated organically (not permanently saved).

## 3. User Schema
The user schema requires unique data validation at the Pydantic level and MongoDB index level.
- `_id`: ObjectId (Primary key)
- `name`: string (Full Name, length >= 2)
- `email`: string (Normalized lowercase, Unique Index)
- `password_hash`: string (Bcrypt hashed)
- `created_at`: datetime
- `updated_at`: datetime
- `is_active`: boolean (Defaults to true)

## 4. Examination Schema
Examinations map an audio prediction event securely.
- `_id`: ObjectId (Primary key)
- `user_id`: string (Foreign key reference to `users`)
- `prediction`: Document (`class_id`, `class_name`, `confidence`)
- `probabilities`: Document (`Normal`, `Crackle`, `Wheeze`, `Crackle + Wheeze`)
- `model`: Document (`name`, `version`)
- `source`: string ("authenticated")
- `created_at`: datetime (Indexed for fast querying by newest-first)

## 5. Authentication Flow
- **Registration (`POST /auth/register`)**: Verifies name, email formatting, and password constraints (>=6 chars). If the email is unused, it inserts a new document securely storing the bcrypt hashed password.
- **Login (`POST /auth/login`)**: Takes an email/password combination, validates it against the MongoDB `password_hash`, and produces a short-lived JSON Web Token (JWT).
- **Logout (`POST /auth/logout`)**: Informational endpoint instructing clients to discard their stateless JWTs.
- **Get Me (`GET /auth/me`)**: Resolves the provided JWT to the authenticated user's profile data.

## 6. JWT Flow
JSON Web Tokens (JWT) are signed using a symmetric `JWT_SECRET_KEY` specified in the `.env` file. They carry the stringified `user_id` in their `sub` claim. 
A FastAPI `Depends(get_current_user)` security hook natively intercepts the `Authorization: Bearer <token>` header, decodes the JWT, and verifies the user exists and is active, automatically rejecting requests with HTTP 401 if tampered or expired.

## 7. Guest Flow
The system embraces an open-access philosophy for base ML inference. When a guest uploads an audio file via `POST /predict` without an `Authorization` header, the system successfully processes the file using the frozen CNN + BiLSTM model and returns the prediction result. It natively skips MongoDB persistence and flags `"saved": false` in the response body.

## 8. Authenticated Flow
When a logged-in user requests a prediction (`POST /predict`), the system seamlessly resolves the attached JWT via `Depends(get_optional_user)`. After generating the ML prediction, it actively inserts a document into the `examinations` collection and attaches the new `examination_id` and `"saved": true` flag into the response payload.

## 9. API Endpoints
All endpoints are available in the Swagger documentation natively at `/docs`.

**Authentication:**
- `POST /auth/register` (Registers a new account)
- `POST /auth/login` (Authenticates and returns JWT)
- `POST /auth/logout` (API completeness)
- `GET /auth/me` (Gets logged in profile)

**Predictions:**
- `POST /predict` (ML inference — optional auth)

**Examinations:**
- `GET /examinations` (Returns user's paginated prediction history)
- `GET /examinations/{id}` (Returns specific examination details securely)
- `DELETE /examinations/{id}` (Deletes a user's examination)

**System:**
- `GET /health` (Database and Model readiness)

## 10. Security Measures
1. **Password Safety:** Plaintext passwords are never logged, echoed, or stored. Passlib handles bcrypt hashing securely.
2. **Path Traversal Protection:** Audio files are saved temporarily using `tempfile.mkstemp` and explicitly whitelisted (`.wav`, `.mp3`, `.m4a`).
3. **Data Isolation (Tenant Safety):** The `examinations` collection enforces strict `user_id` verification natively inside queries (`db.examinations.find_one({"_id": ObjectId(examination_id), "user_id": current_user["_id"]})`). It's impossible to fetch or delete another user's records. Missing or inaccessible records universally throw a generic `HTTP 404` to avoid leaking database states.
4. **Environment Isolation:** Sensitive variables (`MONGODB_URI`, `JWT_SECRET_KEY`) are loaded explicitly via `.env`.

## 11. Environment Variables
- `MONGODB_URI`: Production connection string to MongoDB Atlas.
- `JWT_SECRET`: Secret key used for signing HMAC SHA-256 JWT tokens.
- `JWT_EXPIRE_MINUTES`: Expiration time limit for active sessions (default 1440m).
- `MODEL_PATH`: Pointer to frozen weights.
- `MAX_UPLOAD_SIZE_MB`: Audio size limits.
- `CORS_ORIGINS`: Access-Control policies.

## 12. Testing Results
Automated tests run effectively using `FastAPI TestClient` combined with `mongomock_motor`. They proved full parity and security coverage for duplicate registration rejections, valid token resolutions, proper guest isolation vs authenticated persistence, and exact examination lifecycle management. Tests for unauthorized data modifications definitively produced `404 Not Found` rejections.

## 13. Known Limitations
- The JWTs are completely stateless. A "logout" only works if the client discards the token. Server-side token blacklisting is intentionally skipped for performance in this iteration.
- While endpoints are paginated, rate limiting (Throttling) against abuse is not implemented.
- `MAX_UPLOAD_SIZE_MB` enforcement occurs slightly upstream of application logic, meaning excessively large payloads could still generate minor load pressure before rejection.
