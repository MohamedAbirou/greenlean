// src/features/quiz/components/QuizProgress.tsx

import React from "react";
import { QUIZ_PHASES } from "../data/phases";

interface QuizProgressProps {
  currentPhase: number;
  progress: number;
  progressRestored: boolean;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentPhase,
  progress,
  progressRestored,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          Phase {currentPhase + 1} of {QUIZ_PHASES.length}
        </span>
        <span className="text-sm text-foreground/80">{Math.round(progress)}% Complete</span>
      </div>
      <div className="h-2 bg-card rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {progressRestored && (
        <p className="text-xs text-muted-foreground mt-1">
          Progress saved - you can continue where you left off
        </p>
      )}
    </div>
  );
};

export function PhaseIndicators({ currentPhase }: { currentPhase: number; }) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: QUIZ_PHASES.length }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 rounded-full transition-all ${
            idx === currentPhase
              ? "w-8 bg-primary"
              : idx < currentPhase
              ? "w-2 bg-primary/50"
              : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  );
}