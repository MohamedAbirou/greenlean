export type UnitSystem = "metric" | "imperial";

export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return totalInches * 2.54;
};

export const kgToLbs = (kg: number): number => {
  return kg * 2.20462;
};

export const lbsToKg = (lbs: number): number => {
  return lbs / 2.20462;
};

export const formatHeight = (cm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === "imperial") {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}' ${inches}"`;
  }
  return `${Math.round(cm)} cm`;
};

export const formatWeight = (kg: number, unitSystem: UnitSystem): string => {
  if (unitSystem === "imperial") {
    return `${kgToLbs(kg).toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
};

export const parseHeightAnswer = (
  heightAnswer: any,
  unitSystem: UnitSystem
): { value: number; unit: string; displayValue: string } => {
  if (!heightAnswer) {
    return { value: 0, unit: unitSystem === "imperial" ? "ft/in" : "cm", displayValue: "N/A" };
  }

  if (heightAnswer.cm) {
    const cm = parseFloat(heightAnswer.cm);
    if (unitSystem === "imperial") {
      const { feet, inches } = cmToFeetInches(cm);
      return {
        value: cm,
        unit: "ft/in",
        displayValue: `${feet}' ${inches}"`,
      };
    }
    return { value: cm, unit: "cm", displayValue: `${Math.round(cm)} cm` };
  }

  if (heightAnswer.ft && heightAnswer.inch !== undefined) {
    const feet = parseFloat(heightAnswer.ft);
    const inches = parseFloat(heightAnswer.inch || "0");
    const cm = feetInchesToCm(feet, inches);
    return {
      value: cm,
      unit: "ft/in",
      displayValue: `${feet}' ${inches}"`,
    };
  }

  return { value: 0, unit: unitSystem === "imperial" ? "ft/in" : "cm", displayValue: "N/A" };
};

export const parseWeightAnswer = (
  weightAnswer: any,
  unitSystem: UnitSystem
): { value: number; unit: string; displayValue: string } => {
  if (!weightAnswer) {
    return { value: 0, unit: unitSystem === "imperial" ? "lbs" : "kg", displayValue: "N/A" };
  }

  if (weightAnswer.kg) {
    const kg = parseFloat(weightAnswer.kg);
    if (unitSystem === "imperial") {
      const lbs = kgToLbs(kg);
      return { value: kg, unit: "lbs", displayValue: `${lbs.toFixed(1)} lbs` };
    }
    return { value: kg, unit: "kg", displayValue: `${kg.toFixed(1)} kg` };
  }

  if (weightAnswer.lbs) {
    const lbs = parseFloat(weightAnswer.lbs);
    const kg = lbsToKg(lbs);
    return { value: kg, unit: "lbs", displayValue: `${lbs.toFixed(1)} lbs` };
  }

  return { value: 0, unit: unitSystem === "imperial" ? "lbs" : "kg", displayValue: "N/A" };
};

const formatMetricField = (value: any, unitSystem: UnitSystem, fieldType: 'height' | 'weight'): any => {
  if (!value) return value;

  if (typeof value === 'object') {
    if (value.ft !== undefined || value.inch !== undefined) {
      return { ft: String(value.ft || 0), inch: String(value.inch || 0) };
    }
    if (value.cm !== undefined) {
      return { cm: String(Math.round(parseFloat(value.cm))) };
    }
    if (value.kg !== undefined) {
      return { kg: String(parseFloat(value.kg).toFixed(1)) };
    }
    if (value.lbs !== undefined) {
      return { lbs: String(parseFloat(value.lbs).toFixed(1)) };
    }
    return value;
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;

  if (fieldType === 'height') {
    if (unitSystem === "imperial") {
      const { feet, inches } = cmToFeetInches(numValue);
      return { ft: String(feet), inch: String(inches) };
    } else {
      return { cm: String(Math.round(numValue)) };
    }
  } else {
    if (unitSystem === "imperial") {
      return { lbs: String(kgToLbs(numValue).toFixed(1)) };
    } else {
      return { kg: String(numValue.toFixed(1)) };
    }
  }
};

export const prepareAnswersForBackend = (
  answers: any,
  unitSystem: UnitSystem
): any => {
  const preparedAnswers = { ...answers };

  const heightFields = ['height', 'neck', 'waist', 'hip'];
  const weightFields = ['currentWeight', 'targetWeight'];

  heightFields.forEach(field => {
    if (preparedAnswers[field] !== undefined) {
      preparedAnswers[field] = formatMetricField(preparedAnswers[field], unitSystem, 'height');
    }
  });

  weightFields.forEach(field => {
    if (preparedAnswers[field] !== undefined) {
      preparedAnswers[field] = formatMetricField(preparedAnswers[field], unitSystem, 'weight');
    }
  });

  return preparedAnswers;
};

export const combineProfileWithQuizAnswers = (
  profileData: any,
  quizAnswers: any,
  unitSystem: UnitSystem
): any => {
  const combined: any = {};

  if (profileData.age) combined.age = String(profileData.age);
  if (profileData.gender) combined.gender = profileData.gender;
  if (profileData.country) combined.country = profileData.country;
  if (profileData.occupation_activity) combined.occupation_activity = profileData.occupation_activity;

  if (profileData.height_cm) {
    if (unitSystem === "imperial") {
      const { feet, inches } = cmToFeetInches(profileData.height_cm);
      combined.height = { ft: String(feet), inch: String(inches) };
    } else {
      combined.height = { cm: String(Math.round(profileData.height_cm)) };
    }
  }

  if (profileData.weight_kg) {
    if (unitSystem === "imperial") {
      combined.currentWeight = { lbs: String(kgToLbs(profileData.weight_kg).toFixed(1)) };
    } else {
      combined.currentWeight = { kg: String(profileData.weight_kg.toFixed(1)) };
    }
  }

  return {
    ...combined,
    ...quizAnswers,
  };
};
