# Recommended Demo Flow

This script is designed for a concise 3-5 minute live demonstration of LungSenseAI.

1. **Open app (Guest Mode)**: Launch the app to land on the Guest Dashboard. Explain the low barrier to entry.
2. **Show dashboard**: Highlight the clean interface and generic wellness tips.
3. **Show wellness metrics**: Briefly show the BMI calculator available to guests.
4. **Start respiratory examination**: Tap "New Examination".
5. **Record audio**: Demonstrate the native microphone recording capturing environmental/respiratory audio.
6. **Analyze**: Press "Analyze". Highlight the secure transmission to the Render backend.
7. **Show sound result**: Discuss the acoustic classification (e.g., "Normal" or "Wheeze").
8. **Show COPD-associated pattern result**: Swipe/Tap to show the secondary COPD-associated pattern inference.
9. **Show model probability**: Point out the explicit probability bars.
10. **Show disclaimer**: Emphasize the mandatory medical safety disclaimer.
11. **Login**: Demonstrate the transition to an Authenticated User via secure JWT.
12. **Save examination**: Save a new examination, explaining MongoDB integration.
13. **Open history**: Navigate to the History tab to show chronologically ordered past exams.
14. **Open details**: Click a historical exam to view deep details.
15. **Generate PDF**: Tap "Download PDF" to show the backend-generated ReportLab document.
16. **Show wellness profile**: Walk through the authenticated Health Dashboard (Steps, Water, Sleep).
17. **Demonstrate logout**: Securely clear the JWT and return to the login screen.
