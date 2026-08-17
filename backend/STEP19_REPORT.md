# STEP 19: Full Examination Report & PDF Generation

## 1. PDF Architecture
The PDF generation engine leverages `reportlab` to construct high-quality vector PDFs purely in memory using `io.BytesIO()`. This architecture strictly avoids local file persistence vulnerabilities, mitigating storage bloat and maximizing data confidentiality.

## 2. Report Structure
The generated report strictly adheres to a non-diagnostic, informational structure:
- **Report Header**: ID, UTC timestamp, and model architecture references (CNN + BiLSTM).
- **User Information**: Basic profile metadata (Name, Email).
- **Examination Summary**: Acoustic classification result and model confidence rating.
- **Model Probabilities**: A full statistical spread of the 4 acoustic classes (Normal, Crackle, Wheeze, Crackle + Wheeze).
- **Interpretation**: A cautious, pre-scripted textual interpretation mapped strictly to the class, not asserting medical conclusions.
- **Wellness Guidance**: Holistic, standard lifestyle advice (Sleep, Hydration, Environment).
- **Daily Routine**: A generic morning-to-night schedule focusing on respiratory wellness and mobility.
- **Disclaimer**: Prominent footer/section clarifying the system as an AI prototype incapable of clinical diagnosis.

## 3. Wellness Guidance
All wellness guidance is strictly deterministic. The `app.reports.wellness` module stores hardcoded mappings for interpretations and routines. This deliberate separation from an LLM guarantees the content remains purely educational and cannot "hallucinate" fake medical advice, prescriptions, or treatments.

## 4. Safety / Disclaimer Design
Safety is maintained by aggressively qualifying the data:
- No medical terminologies such as "you have asthma" or "pneumonia."
- Emphasizes consulting qualified healthcare professionals constantly.
- Refrains completely from suggesting or detailing specific medical treatments, doctor names, or prescriptions.

## 5. API Endpoints
Two endpoints were successfully added and integrated under `app/api/examinations.py`:
- `GET /examinations/{id}/report`: Compiles the examination document into a `application/pdf` binary stream.
- `GET /examinations/{id}/report-data`: Exposes the structured deterministic data behind the report in JSON format, facilitating frontend UI implementations.

## 6. Security
- **Strict Ownership**: Requests validate that the requester's JWT `_id` matches the document's `user_id` inside MongoDB.
- **Guest Restriction**: Guests lack JWTs, and therefore cannot access these endpoints (`HTTP 401 Unauthorized`).
- **Data Encapsulation**: Unexpected or cross-tenant IDs cleanly fail with `HTTP 404 Not Found` to prevent metadata leakage.

## 7. PDF Testing
Automated testing via `FastAPI TestClient` verified:
- Standard generation flow (Authentication -> Predict -> Generate).
- Binary validation: the response payload starts with the standard `b"%PDF"` magic bytes and has length > 0.
- Ownership checks accurately denied cross-tenant and unauthenticated access (Returns 404 & 401 respectively).

## 8. Example Output
A `test_report.pdf` generated during testing demonstrated correct headers, clean tabular layouts for probabilities, distinct paragraph separations for the wellness data, and bolded disclaimers at the bottom.

## 9. Known Limitations
- Since `reportlab` compiles PDFs dynamically, generating bulk PDFs simultaneously on heavy traffic could briefly impact CPU overhead.
- Currently, the PDF layout is strictly structured and doesn't inject personalized Android-side configurations or localized languages (English only).
