// src/features/quiz/utils/conversion.ts

import type { ProfileData, QuizAnswers, UnitSystem } from "../types";

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

export const kgToLbs = (kg: number): number => kg * 2.20462;

export const lbsToKg = (lbs: number): number => lbs / 2.20462;

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

const formatMetricField = (
  value: any,
  unitSystem: UnitSystem,
  fieldType: "height" | "weight"
): any => {
  if (!value) return value;

  if (typeof value === "object") {
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

  if (fieldType === "height") {
    if (unitSystem === "imperial") {
      const { feet, inches } = cmToFeetInches(numValue);
      return { ft: String(feet), inch: String(inches) };
    }
    return { cm: String(Math.round(numValue)) };
  } else {
    if (unitSystem === "imperial") {
      return { lbs: String(kgToLbs(numValue).toFixed(1)) };
    }
    return { kg: String(numValue.toFixed(1)) };
  }
};

export const prepareAnswersForBackend = (
  answers: QuizAnswers,
  unitSystem: UnitSystem
): Record<string, any> => {
  const preparedAnswers = { ...answers };

  const heightFields: (keyof QuizAnswers)[] = ["height", "neck", "waist", "hip"];
  const weightFields: (keyof QuizAnswers)[] = ["currentWeight", "targetWeight"];

  heightFields.forEach((field) => {
    if (preparedAnswers[field] !== undefined) {
      preparedAnswers[field] = formatMetricField(
        preparedAnswers[field],
        unitSystem,
        "height"
      ) as any;
    }
  });

  weightFields.forEach((field) => {
    if (preparedAnswers[field] !== undefined) {
      preparedAnswers[field] = formatMetricField(
        preparedAnswers[field],
        unitSystem,
        "weight"
      ) as any;
    }
  });

  // Add default values for removed optional fields (quiz simplification)
  // These fields are no longer collected in the simplified quiz but required by ML service
  if (!preparedAnswers.equipment) preparedAnswers.equipment = [];
  if (!preparedAnswers.injuries) preparedAnswers.injuries = undefined;
  if (!preparedAnswers.foodAllergies) preparedAnswers.foodAllergies = undefined;
  if (!preparedAnswers.dislikedFoods) preparedAnswers.dislikedFoods = undefined;
  if (!preparedAnswers.secondaryGoals) preparedAnswers.secondaryGoals = [];
  if (!preparedAnswers.challenges) preparedAnswers.challenges = [];
  if (!preparedAnswers.healthConditions) preparedAnswers.healthConditions = ["None"];
  if (!preparedAnswers.medications) preparedAnswers.medications = undefined;
  if (!preparedAnswers.bodyFat) preparedAnswers.bodyFat = undefined;
  if (!preparedAnswers.neck) preparedAnswers.neck = undefined;
  if (!preparedAnswers.waist) preparedAnswers.waist = undefined;
  if (!preparedAnswers.hip) preparedAnswers.hip = undefined;

  return preparedAnswers;
};

export const combineProfileWithQuizAnswers = (
  profileData: ProfileData,
  quizAnswers: QuizAnswers,
  unitSystem: UnitSystem
): QuizAnswers => {
  const combined: QuizAnswers = {};

  if (profileData.age) combined.age = String(profileData.age);
  if (profileData.gender) combined.gender = profileData.gender;
  if (profileData.country) combined.country = profileData.country;
  if (profileData.occupation_activity)
    combined.occupation_activity = profileData.occupation_activity;

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
