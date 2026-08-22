# Model Comparison

Multiple architectures were evaluated before finalizing the production model.

| Architecture | Macro F1 | Conclusion |
|---|---|---|
| Baseline CNN | 0.28 | Lacked temporal context |
| Weighted CNN | 0.31 | Imbalance still dominating |
| **CNN + BiLSTM** | **0.407** | **Best balance across minority classes** |
| CNN + BiLSTM + Attention | 0.413 | Degraded minority accuracy for slight overall gain |

The standard **CNN + BiLSTM** was selected for its robust, reliable performance on difficult minority acoustic classes like "Crackle + Wheeze".
