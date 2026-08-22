# The ML Pipeline

Data leakage is the biggest pitfall in medical ML. We designed a strict pipeline to prevent it:

1. **Patient-Level Split**: Data was partitioned so no single patient's audio exists in both the training and test sets.
   - `Train ∩ Test = 0`
2. **Preprocessing**: Audio was normalized, resampled to 16kHz, and converted to Mel-spectrograms.
3. **Training**: Specialized temporal architectures (CNNs for spatial features, BiLSTMs for temporal sequences) were trained on the processed spectrograms.
4. **Aggregation**: Frame-level predictions were mathematically aggregated (using Mean) to form robust patient-level evaluations.
