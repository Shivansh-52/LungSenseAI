# Security & Data Privacy

Medical research data requires extreme protection.

- **Authentication**: JWT-based session management ensuring strict state separation.
- **IDOR Protection**: Every database query is strictly scoped to the authenticated `user_id`.
- **Ephemeral Processing**: Uploaded `.wav` files are processed in secure temporary paths and immediately destroyed using `finally` blocks, regardless of inference success.
- **Guest Isolation**: Unauthenticated users can perform inference, but are completely blocked from executing database writes.
