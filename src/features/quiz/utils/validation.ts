// src/features/quiz/utils/validation.ts

import type { QuizAnswers, QuizQuestion } from "../types";

export const validateAnswer = (question: QuizQuestion, value: any): string | null => {
  if (question.required) {
    // Special check for height/weight objects
    if (typeof value === "object") {
      const hasValue = Object.values(value || {}).some(
        (v) => v !== "" && v !== null && v !== undefined
      );
      if (!hasValue) return "This field is required";
    } else if (value === "" || value === null || value === undefined) {
      return "This field is required";
    }
  }

  if (question.type === "number" && value !== "") {
    const numValue = Number(value);
    if (isNaN(numValue)) return "Please enter a valid number";
    if (question.min !== undefined && numValue < question.min)
      return `Value must be at least ${question.min}`;
    if (question.max !== undefined && numValue > question.max)
      return `Value cannot exceed ${question.max}`;
  }

  return null;
};

export const canProceed = (question: QuizQuestion, answers: QuizAnswers): boolean => {
  if (question.required) {
    const answer = answers[question.id];
    if (answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
      return false;
    }
  }
  return true;
};
