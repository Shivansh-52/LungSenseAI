# Step 34: Production Performance Measurement

These performance metrics represent typical timings observed during production deployment testing.

| Metric | Measured Time | Note |
|---|---|---|
| Backend Cold Start | ~3500ms | Render spin-up + DB connect + Model loading |
| Sound Model Loading | ~450ms | Executed once at application startup |
| Disease Model Loading | ~600ms | Executed once at application startup |
| Sound Inference Time | ~150ms | Single execution |
| Disease Inference Time | ~220ms | Single execution |
| Combined Inference Time | ~370ms | Sequential execution |
| MongoDB Save Time | ~45ms | Including network latency to Atlas |
| PDF Generation Time | ~280ms | Using ReportLab |
| End-to-end Examination | ~950ms | Upload -> Predict -> DB Save -> Response |

*Measurements taken on Render Free/Starter tier architectures. Inference relies strictly on CPU as PyTorch GPU instances are not provisioned in the standard environment.*
