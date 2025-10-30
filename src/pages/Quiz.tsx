// src/pages/Quiz.tsx

import { usePlan } from "@/core/providers/AppProviders";
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
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import { triggerStripeCheckout } from "@/shared/hooks/useStripe";
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
    user,
  } = useQuizState();

  const { submitQuiz, isSubmitting } = useQuizSubmission();
  const {
    planName,
    aiGenQuizCount,
    allowed,
    planId,
    loading: planLoading,
    // refresh: refreshPlan,
  } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

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

  const outOfQuota = !planLoading && aiGenQuizCount >= allowed;

  const handleConfirmSummary = async () => {
    setShowSummary(false);
    setCompleted(true);

    setTimeout(async () => {
      if (outOfQuota) {
        setShowUpgrade(true);
        setCompleted(false);
        return;
      }
      if (profileData) {
        try {
          await submitQuiz(profileData.id, profileData, answers, clearProgress);
        } catch (err) {
          if ((err as any)?.message?.includes("limit reached")) {
            setShowUpgrade(true);
            setCompleted(false);
          }
        }
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

  // Show plan usage at top
  if (outOfQuota) {
    return (
      <>
        <div className="min-h-screen pt-24 pb-16 bg-gradient-global flex flex-col items-center justify-center">
          <div className="p-6 bg-card rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold text-primary mb-2">Upgrade for More AI Plans</h2>
            <span className="inline-flex items-center px-3 py-1 rounded bg-gradient-yellow-amber text-sm font-bold mb-2">
              You have used all your ({aiGenQuizCount}/{allowed}) AI plan generations for this
              period!
            </span>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded bg-primary hover:bg-primary/90 text-white px-4 py-2 font-semibold text-base mt-2 mb-2"
            >
              Upgrade Now
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Unlock up to 50 plans/month with Pro. Billing via Stripe.
            </p>
          </div>
        </div>
        <ModalDialog
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          title="Upgrade for More AI Plans"
          description="Unlock up to 50 quizzes + plans/month. Cancel anytime."
          size="md"
        >
          <div className="space-y-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">
                Your current plan:{" "}
                <span className="inline-block px-2 rounded-full text-white bg-primary text-xs">
                  {planName}
                </span>
              </p>
              <span className="text-foreground text-sm">
                {aiGenQuizCount}/{allowed} used this period.
              </span>
            </div>
            <button
              onClick={() => triggerStripeCheckout(user?.id || "")}
              className="mt-2 w-full rounded bg-primary hover:bg-primary/90 text-white px-4 py-2 font-semibold text-base transition"
            >
              Upgrade Now
            </button>
            <p className="text-xs mt-2 text-muted-foreground">
              Billing handled securely via Stripe.
            </p>
          </div>
        </ModalDialog>
      </>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-global">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="my-4 flex flex-col items-center">
            <div className="inline-flex items-center px-2 py-1 rounded badge-green text-xs text-muted-foreground font-medium gap-2 border border-muted-foreground/20 mb-2">
              {planLoading
                ? "Checking plan ..."
                : `AI plan usage: ${aiGenQuizCount}/${allowed} left`}
            </div>
            {planId === "free" && allowed - aiGenQuizCount <= 2 && (
              <button
                className="text-xs text-primary underline hover:text-primary/80 font-bold"
                onClick={() => setShowUpgrade(true)}
              >
                Upgrade for more
              </button>
            )}
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
          <ModalDialog
            open={showUpgrade}
            onOpenChange={setShowUpgrade}
            title="Upgrade for More AI Plans"
            description="Unlock up to 50 plans/month, priority support, and more!"
            size="md"
          >
            <div className="space-y-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">
                  Your current plan:{" "}
                  <span className="inline-block px-2 rounded-full text-white bg-primary text-xs">
                    {planName}
                  </span>
                </p>
                <span className="text-foreground text-sm">
                  {aiGenQuizCount}/{allowed} AI generations used this period.
                </span>
              </div>
              <button
                onClick={() => triggerStripeCheckout(user?.id || "")}
                className="mt-2 w-full rounded bg-primary hover:bg-primary/90 text-white px-4 py-2 font-semibold text-base transition"
              >
                Upgrade Now
              </button>
              <p className="text-xs mt-2 text-muted-foreground">
                Billing handled securely via Stripe.
              </p>
            </div>
          </ModalDialog>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
