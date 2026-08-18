# Model Development History

This document traces the experimentation and progression of the LungSenseAI machine learning models culminating in the v1.0.0 release.

## Experimentation Track

| Model | Validation Macro F1 | Decision | Reason |
|---|---|---|---|
| Baseline CNN | 0.2880 | Rejected | Insufficient learning capacity |
| Weighted CNN | 0.3143 | Rejected | Class imbalance still dominating |
| CNN + BiLSTM | 0.4071 | **Selected** | Excellent temporal feature extraction |
| CNN + BiLSTM + Attention | 0.4135 | Rejected | Minor overall gain, but degraded minority classes |
| SpecAugment | 0.3742 | Rejected | Degraded temporal structure of Crackles |
| Noise | 0.4048 | Rejected | No significant robustness gain over baseline |
| Time Stretch | 0.3894 | Rejected | Pitch distortion confused model classes |

## Patient-Level Separation (Data Leakage Prevention)

A critical component of this research prototype was preventing data leakage.
- `Train ∩ Validation = 0`
- `Train ∩ Test = 0`
- `Validation ∩ Test = 0`

Patient-level grouping was used to prevent respiratory cycles from the same patient from appearing across different evaluation partitions. This ensures the models actually learned generalized acoustic features rather than memorizing patient-specific respiratory traits.

## Final Selected Model: CNN + BiLSTM

Despite Attention achieving a nominally higher Macro F1, the **CNN + BiLSTM** was selected as the final architecture because it provided significantly better balance across difficult minority classes, offering safer predictions.

### COPD Model (Disease Pattern)
Following the sound classification success, a dedicated binary model was trained utilizing patient-level mean aggregation. A threshold of `0.70` was empirically established on the validation set to balance recall and specificity for the COPD-associated pattern.
