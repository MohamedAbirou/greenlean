/**
 * Quiz Page (Refactored)
 * Clean, modular quiz implementation
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";
import { useAuth } from "../features/auth";
import {
  QUIZ_PHASES,
  QuizCard,
  QuizProgressBar,
  PhaseIndicators,
  QuizLoading,
  useQuizState,
  QuizService,
  serializeAnswers,
} from "../features/quiz";
import { AuthModal } from "../features/auth";
import toast from "react-hot-toast";

export default function Quiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentPhase,
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
  } = useQuizState(QUIZ_PHASES);

  const handleQuizComplete = async () => {
    if (!user) {
      toast.error("Please sign in to save your results");
      return;
    }

    setIsSubmitting(true);

    try {
      const serializedAnswers = serializeAnswers(answers);

      const result = await QuizService.submitQuiz(user.id, serializedAnswers);

      toast.success("Your personalized plan is ready!");
      navigate(`/quiz-result/${result.id}`);
    } catch (error) {
      console.error("Quiz submission failed:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextClick = () => {
    if (isLastQuestion) {
      handleQuizComplete();
    } else {
      handleNext();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-4">Sign in to Continue</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to save your quiz results and get your personalized health plan
          </p>

          <AuthModal
            defaultMode="signin"
            buttonText="Sign In"
            buttonClassName="w-full"
            onAuthSuccess={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Health Assessment Quiz</h1>
          <p className="text-muted-foreground">
            Help us create your personalized health and fitness plan
          </p>
        </div>

        {!isCompleted && !isSubmitting && (
          <QuizProgressBar
            currentPhase={currentPhase}
            totalPhases={progress.totalPhases}
            percentComplete={progress.percentComplete}
          />
        )}

        <AnimatePresence mode="wait">
          {!isCompleted && !isSubmitting ? (
            <div key="quiz-content">
              <QuizCard
                phase={phase}
                question={question}
                value={answers[question.id]}
                isFirstQuestion={isFirstQuestion}
                isLastQuestion={isLastQuestion}
                canProceed={canProceed}
                onChange={(value) => handleAnswerChange(question.id, value)}
                onNext={handleNextClick}
                onPrevious={handlePrevious}
                onSkip={handleSkip}
              />

              <PhaseIndicators
                currentPhase={currentPhase}
                totalPhases={progress.totalPhases}
              />
            </div>
          ) : (
            <QuizLoading key="loading" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
