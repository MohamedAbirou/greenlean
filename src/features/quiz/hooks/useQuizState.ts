/**
 * Quiz State Hook
 * Manages quiz navigation and answers
 */

import { useState, useCallback } from "react";
import type { QuizAnswers, QuizPhase } from "../types";
import {
  calculateProgress,
  canProceedToNext,
  getNextQuestion,
  getPreviousQuestion,
} from "../utils/quizHelpers";

export function useQuizState(phases: QuizPhase[]) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const phase = phases[currentPhase];
  const question = phase.questions[currentQuestion];

  const progress = calculateProgress(currentPhase, currentQuestion, phases);

  const isFirstQuestion = currentPhase === 0 && currentQuestion === 0;
  const isLastQuestion =
    currentPhase === phases.length - 1 && currentQuestion === phase.questions.length - 1;

  const canProceed = canProceedToNext(question.id, answers, question.required);

  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const handleNext = useCallback(() => {
    const next = getNextQuestion(currentPhase, currentQuestion, phases);

    if (next.completed) {
      setIsCompleted(true);
    } else {
      setCurrentPhase(next.phase);
      setCurrentQuestion(next.question);
    }
  }, [currentPhase, currentQuestion, phases]);

  const handlePrevious = useCallback(() => {
    const prev = getPreviousQuestion(currentPhase, currentQuestion);
    if (prev) {
      setCurrentPhase(prev.phase);
      setCurrentQuestion(prev.question);
    }
  }, [currentPhase, currentQuestion]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  return {
    currentPhase,
    currentQuestion,
    phase,
    question,
    answers,
    progress,
    isCompleted,
    isFirstQuestion,
    isLastQuestion,
    canProceed,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    handleSkip,
  };
}
