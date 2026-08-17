# Deployment Model Verification

This document verifies the integrity of the deployed machine learning model artifact to ensure that no developmental weights or untrained variants are accidentally promoted to production.

## Model Identity
- **Model Name**: LungSenseAI - CNN + BiLSTM
- **Version**: 1.0 (Frozen Checkpoint)
- **File**: `models/cnn_lstm_best.pth`
- **Configuration**: `models/final_model_config.json`

## Integrity Hash
To verify that this artifact is exactly the model frozen during Step 15, the SHA-256 hash is recorded below:

```text
Algorithm: SHA256
Hash:      FE2599A0D5028924E53D92EF2B0BBE4D0400F132D41FB550A55B31525FA6DC90
```

## Storage Strategy
Because this `.pth` file is sufficiently small, it is committed natively to the source repository for straightforward deployment onto Render without complex external block storage mechanisms. 
