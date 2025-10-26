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

export const prepareAnswersForBackend = (
  answers: any,
  unitSystem: UnitSystem
): any => {
  const preparedAnswers = { ...answers };

  if (answers.height) {
    const heightData = parseHeightAnswer(answers.height, unitSystem);
    if (unitSystem === "imperial") {
      const { feet, inches } = cmToFeetInches(heightData.value);
      preparedAnswers.height = { ft: feet, inch: inches };
    } else {
      preparedAnswers.height = { cm: Math.round(heightData.value) };
    }
  }

  if (answers.currentWeight) {
    const weightData = parseWeightAnswer(answers.currentWeight, unitSystem);
    if (unitSystem === "imperial") {
      preparedAnswers.currentWeight = { lbs: kgToLbs(weightData.value).toFixed(1) };
    } else {
      preparedAnswers.currentWeight = { kg: weightData.value.toFixed(1) };
    }
  }

  if (answers.targetWeight) {
    const weightData = parseWeightAnswer(answers.targetWeight, unitSystem);
    if (unitSystem === "imperial") {
      preparedAnswers.targetWeight = { lbs: kgToLbs(weightData.value).toFixed(1) };
    } else {
      preparedAnswers.targetWeight = { kg: weightData.value.toFixed(1) };
    }
  }

  return preparedAnswers;
};
