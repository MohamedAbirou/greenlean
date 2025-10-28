// src/features/quiz/components/QuizNavigation.tsx

import { Button } from "@/shared/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { QUIZ_PHASES } from "../data/phases";
import type { QuizQuestion } from "../types";

interface QuizNavigationProps {
  currentPhase: number;
  currentQuestion: number;
  question: QuizQuestion;
  canProceed: boolean;
  onPrevious: () => void;
  onSkip: () => void;
  onNext: () => void;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentPhase,
  currentQuestion,
  question,
  canProceed,
  onPrevious,
  onSkip,
  onNext,
}) => {
  const phase = QUIZ_PHASES[currentPhase];
  const isLastQuestion =
    currentPhase === QUIZ_PHASES.length - 1 && currentQuestion === phase.questions.length - 1;
  const isFirstQuestion = currentPhase === 0 && currentQuestion === 0;

  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onPrevious} disabled={isFirstQuestion}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-2">
        {question.skippable && (
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button onClick={onNext} disabled={!canProceed}>
          {isLastQuestion ? (
            <>
              Complete
              <Check className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
