import { random } from 'lodash';

const predictions = [
  {
    label: 'Normal',
    confidence: 0.92,
    message: 'No abnormal respiratory sound pattern detected.',
  },
  {
    label: 'Crackle',
    confidence: 0.85,
    message: 'Crackle sound pattern detected.',
  },
  {
    label: 'Wheeze',
    confidence: 0.87,
    message: 'Wheezing respiratory sound pattern detected.',
  },
  {
    label: 'Crackle + Wheeze',
    confidence: 0.80,
    message: 'Combined crackle and wheeze sound pattern detected.',
  },
];

export default async function mockPrediction() {
  // Simulate async delay
  await new Promise(res => setTimeout(res, 500));
  const idx = Math.floor(Math.random() * predictions.length);
  return predictions[idx];
}
