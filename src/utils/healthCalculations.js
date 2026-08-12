/**
 * Calculates BMI based on height (cm) and weight (kg).
 * @param {number} heightCm
 * @param {number} weightKg
 * @returns {object} { bmi: number, category: string }
 */
export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, category: 'Invalid Input' };
  }
  
  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 18.5 && bmi <= 24.9) category = 'Normal range';
  else if (bmi >= 25 && bmi <= 29.9) category = 'Overweight';
  else category = 'Obese';

  return { bmi, category };
};

/**
 * Calculates a dummy Wellness Score (0-100) based on mock metrics.
 * Disclaimer: This is NOT a medical score.
 * @param {object} metrics { steps, sleepMinutes, waterLiters }
 * @returns {number} score 0-100
 */
export const calculateWellnessScore = (metrics) => {
  const { steps = 0, sleepMinutes = 0, waterLiters = 0 } = metrics || {};
  
  // Simple weighted calculation for prototype
  // Steps: up to 40 points (10000 steps = 40)
  // Sleep: up to 40 points (480 mins = 40)
  // Water: up to 20 points (2.5L = 20)
  
  let stepsScore = Math.min((steps / 10000) * 40, 40);
  let sleepScore = Math.min((sleepMinutes / 480) * 40, 40);
  let waterScore = Math.min((waterLiters / 2.5) * 20, 20);
  
  return Math.round(stepsScore + sleepScore + waterScore);
};

export const getWellnessCategory = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
};
