// src/pages/Quiz.tsx

import { AuthGate } from "@/features/quiz/components/AuthGate";
import { PhaseDots } from "@/features/quiz/components/PhaseDots";
import { PhaseHeader } from "@/features/quiz/components/PhaseHeader";
import { QuizCard } from "@/features/quiz/components/QuizCard";
import { QuizLoading } from "@/features/quiz/components/QuizLoading";
import { QuizProgress } from "@/features/quiz/components/QuizProgress";
import { QuizSummary } from "@/features/quiz/components/QuizSummary";
import { useQuizState } from "@/features/quiz/hooks/useQuizState";
import { useQuizSubmission } from "@/features/quiz/hooks/useQuizSubmission";
import type { QuizAnswers } from "@/features/quiz/types";
import { AnimatePresence } from "framer-motion";
import React, { useState } from "react";

const Quiz: React.FC = () => {
  const {
    currentPhase,
    currentQuestion,
    answers,
    heightUnit,
    weightUnit,
    errors,
    profileData,
    progressRestored,
    phase,
    question,
    progress,
    isLoading,
    isAuthenticated,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSkip,
    canProceed,
    clearProgress,
  } = useQuizState();

  const { submitQuiz, isSubmitting } = useQuizSubmission();

  const [showSummary, setShowSummary] = useState(false);
  const [completed, setCompleted] = useState(false);

  const toggleMultiSelect = (questionId: keyof QuizAnswers, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    const newValue = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    handleAnswer(questionId, newValue);
  };

  const handleNextWrapper = () => {
    const result = handleNext();
    if (result === "complete") {
      setShowSummary(true);
    }
  };

  const handleConfirmSummary = async () => {
    setShowSummary(false);
    setCompleted(true);

    // Small delay for animation
    setTimeout(async () => {
      if (profileData) {
        await submitQuiz(profileData.id, profileData, answers, clearProgress);
      }
    }, 500);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gradient-global flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-global">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-sm text-center rounded-lg my-2 py-2">
            ⚠️ This quiz is in <span className="font-bold">BETA</span> mode — results may not be
            final.
          </div>

          <AnimatePresence mode="wait">
            {showSummary ? (
              <QuizSummary
                answers={answers}
                onEdit={() => setShowSummary(false)}
                onConfirm={handleConfirmSummary}
              />
            ) : completed || isSubmitting ? (
              <QuizLoading />
            ) : (
              <>
                <QuizProgress
                  currentPhase={currentPhase}
                  progress={progress}
                  progressRestored={progressRestored}
                />

                <PhaseHeader phase={phase} />

                <QuizCard
                  currentPhase={currentPhase}
                  currentQuestion={currentQuestion}
                  question={question}
                  answers={answers}
                  heightUnit={heightUnit}
                  weightUnit={weightUnit}
                  errors={errors}
                  canProceed={canProceed()}
                  onAnswer={handleAnswer}
                  onToggleMultiSelect={toggleMultiSelect}
                  onPrevious={handlePrevious}
                  onSkip={handleSkip}
                  onNext={handleNextWrapper}
                />

                <PhaseDots currentPhase={currentPhase} />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
