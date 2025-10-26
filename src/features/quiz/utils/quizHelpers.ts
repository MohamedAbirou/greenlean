/**
 * Quiz Helper Functions
 */

import type { QuizAnswers, QuizPhase, QuizProgress } from "../types";

export function calculateProgress(
  currentPhase: number,
  currentQuestion: number,
  phases: QuizPhase[]
): QuizProgress {
  const totalPhases = phases.length;
  let totalQuestions = 0;
  let answeredQuestions = 0;

  phases.forEach((phase, phaseIdx) => {
    totalQuestions += phase.questions.length;
    if (phaseIdx < currentPhase) {
      answeredQuestions += phase.questions.length;
    } else if (phaseIdx === currentPhase) {
      answeredQuestions += currentQuestion;
    }
  });

  const percentComplete = Math.round((answeredQuestions / totalQuestions) * 100);

  return {
    currentPhase,
    currentQuestion,
    totalPhases,
    totalQuestions,
    percentComplete,
  };
}

export function canProceedToNext(
  questionId: string,
  answers: QuizAnswers,
  isRequired: boolean
): boolean {
  if (!isRequired) return true;
  const answer = answers[questionId];
  if (answer === undefined || answer === null || answer === "") return false;
  if (Array.isArray(answer) && answer.length === 0) return false;
  return true;
}

export function validateAnswer(
  value: any,
  questionType: string
): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { valid: false, error: "This field is required" };
  }

  switch (questionType) {
    case "weight":
    case "height":
    case "number":
      if (typeof value === "object" && "value" in value) {
        if (isNaN(value.value) || value.value <= 0) {
          return { valid: false, error: "Please enter a valid number" };
        }
      }
      break;

    case "multiselect":
      if (Array.isArray(value) && value.length === 0) {
        return { valid: false, error: "Please select at least one option" };
      }
      break;
  }

  return { valid: true };
}

export function getNextQuestion(
  currentPhase: number,
  currentQuestion: number,
  phases: QuizPhase[]
): { phase: number; question: number; completed: boolean } {
  const phase = phases[currentPhase];

  if (currentQuestion < phase.questions.length - 1) {
    return { phase: currentPhase, question: currentQuestion + 1, completed: false };
  }

  if (currentPhase < phases.length - 1) {
    return { phase: currentPhase + 1, question: 0, completed: false };
  }

  return { phase: currentPhase, question: currentQuestion, completed: true };
}

export function getPreviousQuestion(
  currentPhase: number,
  currentQuestion: number
): { phase: number; question: number } | null {
  if (currentPhase === 0 && currentQuestion === 0) {
    return null;
  }

  if (currentQuestion > 0) {
    return { phase: currentPhase, question: currentQuestion - 1 };
  }

  return { phase: currentPhase - 1, question: 0 };
}

export function serializeAnswers(answers: QuizAnswers): QuizAnswers {
  const serialized: QuizAnswers = {};

  Object.entries(answers).forEach(([key, value]) => {
    if (value && typeof value === "object" && "value" in value && "unit" in value) {
      serialized[key] = value;
    } else {
      serialized[key] = value;
    }
  });

  return serialized;
}
