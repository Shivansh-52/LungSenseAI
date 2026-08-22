# The COPD Model

Following the success of acoustic classification, a secondary binary model was trained specifically to detect COPD-associated respiratory patterns.

- **Architecture**: CNN + BiLSTM
- **Threshold**: 0.70
- **Aggregation Strategy**: Mean probability across all respiratory cycles for a single patient.

This secondary model acts as a powerful analytical tool, complementing the primary acoustic classification.
